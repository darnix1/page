// Variables globales para los totales
let pending = 0; // Crédito pendiente
let totalSpent = 0; // Total gastado
let totalPaid = 0; // Total pagado
let remainingCredit = 2400; // Crédito restante inicial

// Elementos del DOM
const notification = document.getElementById("notification");

// Mostrar notificación
function showNotification(message) {
    notification.classList.remove("hidden");
    notification.classList.add("visible");
    document.getElementById("notification-message").textContent = message;

    setTimeout(() => {
        notification.classList.remove("visible");
        notification.classList.add("hidden");
    }, 3000);
}

// Actualizar los totales en la interfaz
function updateTotals() {
    document.getElementById("pending").textContent = `$${pending.toFixed(2)}`;
    document.getElementById("total-spent").textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById("total-paid").textContent = `$${totalPaid.toFixed(2)}`;
    document.getElementById("remaining-credit").textContent = `$${remainingCredit.toFixed(2)}`;
}

// Guardar datos en localStorage
function saveDataToLocalStorage(data) {
    localStorage.setItem("creditData", JSON.stringify(data));
}

// Cargar datos y recalcular totales
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem("creditData");
    if (savedData) {
        const data = JSON.parse(savedData);

        // Reiniciar los valores antes de recalcular
        pending = 0;
        totalSpent = 0;
        totalPaid = 0;
        remainingCredit = 2400; // Valor inicial

        document.querySelector("#daily-tracker tbody").innerHTML = ""; // Limpiar tabla antes de cargar

        data.forEach((row) => {
            addRowToTable(row.type, row.date, row.amount, false);

            if (row.type === "gasto") {
                totalSpent += row.amount;
                pending += row.amount;
                remainingCredit -= row.amount;
            } else if (row.type === "pago") {
                totalPaid += row.amount;
                pending -= row.amount;
                remainingCredit += row.amount;
            }
        });

        updateTotals();
    }
}

// Agregar una fila a la tabla
function addRowToTable(type, date, amount, updateTotalsFlag = true) {
    const tableBody = document.querySelector("#daily-tracker tbody");
    const newRow = document.createElement("tr");

    const typeCell = document.createElement("td");
    typeCell.textContent = type === "gasto" ? "Gasto" : "Abono";

    const dateCell = document.createElement("td");
    dateCell.textContent = date;

    const amountCell = document.createElement("td");
    amountCell.textContent = type === "gasto" ? `+${amount.toFixed(2)}` : `-${Math.abs(amount).toFixed(2)}`;

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.onclick = () => removeRow(deleteButton);
    actionCell.appendChild(deleteButton);

    newRow.appendChild(typeCell);
    newRow.appendChild(dateCell);
    newRow.appendChild(amountCell);
    newRow.appendChild(actionCell);
    tableBody.appendChild(newRow);

    if (updateTotalsFlag) {
        if (type === "gasto") {
            totalSpent += amount;
            pending += amount;
            remainingCredit -= amount;
        } else if (type === "pago") {
            totalPaid += amount;
            pending -= amount;
            remainingCredit += amount;
        }
        updateTotals();
    }

    const rowData = { type, date, amount };
    const existingData = JSON.parse(localStorage.getItem("creditData")) || [];
    existingData.push(rowData);
    saveDataToLocalStorage(existingData);
}

// Eliminar una fila
function removeRow(button) {
    const row = button.closest("tr");
    const typeCell = row.querySelector("td:nth-child(1)").textContent.trim();
    const amountCell = row.querySelector("td:nth-child(3)").textContent.trim();
    const amount = parseFloat(amountCell.replace(/[^-\d.]/g, ""));

    if (typeCell === "Gasto") {
        totalSpent -= amount;
        pending -= amount;
        remainingCredit += amount;
    } else if (typeCell === "Abono") {
        totalPaid -= amount;
        pending += amount;
        remainingCredit -= amount;
    }

    row.remove();
    updateTotals();

    const existingData = JSON.parse(localStorage.getItem("creditData")) || [];
    const updatedData = existingData.filter(
        (data) =>
            !(
                data.type === (typeCell === "Gasto" ? "gasto" : "pago") &&
                data.date === row.querySelector("td:nth-child(2)").textContent &&
                data.amount === amount
            )
    );
    saveDataToLocalStorage(updatedData);
    showNotification("Registro eliminado correctamente");
}

// Limpiar todos los datos
document.getElementById("clear-all").addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas limpiar todos los registros?")) {
        document.querySelector("#daily-tracker tbody").innerHTML = "";
        pending = 0;
        totalSpent = 0;
        totalPaid = 0;
        remainingCredit = 2400;
        updateTotals();
        localStorage.removeItem("creditData");
        showNotification("Todos los registros han sido eliminados");
    }
});

// Agregar un nuevo registro
document.getElementById("entry-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;

    if (!amount || !date || !type) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    addRowToTable(type, date, amount);
    document.getElementById("entry-form").reset();
    showNotification("Registro agregado correctamente");
});

// Cargar datos al iniciar la página
window.addEventListener("load", () => {
    loadDataFromLocalStorage();
});
            
