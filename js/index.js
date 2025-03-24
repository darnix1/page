// Variables globales para almacenar los totales
let pending = 0; // Crédito pendiente
let totalSpent = 0; // Total gastado
let totalPaid = 0; // Total pagado
let remainingCredit = 2400; // Crédito restante (inicial)

// Elementos del DOM
const notification = document.getElementById("notification");
const closeNotification = document.getElementById("close-notification");

// Mostrar notificación
function showNotification(message) {
    notification.classList.remove("hidden");
    notification.classList.add("visible");
    document.getElementById("notification-message").textContent = message;

    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

// Ocultar notificación
function hideNotification() {
    notification.classList.remove("visible");
    notification.classList.add("hidden");
}

// Actualizar los totales en la interfaz
function updateTotals() {
    document.getElementById("pending").textContent = `$${pending.toFixed(2)}`;
    document.getElementById("total-spent").textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById("total-paid").textContent = `$${Math.abs(totalPaid).toFixed(2)}`;
    document.getElementById("remaining-credit").textContent = `$${remainingCredit.toFixed(2)}`;
}

// Guardar datos en localStorage
function saveDataToLocalStorage(data) {
    localStorage.setItem("creditData", JSON.stringify(data));
}

// Cargar datos desde localStorage y recalcular totales
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem("creditData");
    if (savedData) {
        const data = JSON.parse(savedData);

        // Reiniciar los valores antes de recalcular
        pending = 0;
        totalSpent = 0;
        totalPaid = 0;
        remainingCredit = 2400; // Valor inicial

        data.forEach((row) => {
            addRowToTable(row.type, row.date, row.amount, false); // Agregar sin actualizar totales

            // Recalcular los valores
            if (row.type === "gasto") {
                totalSpent += row.amount;
                pending += row.amount;
                remainingCredit -= row.amount;
            } else if (row.type === "pago") {
                totalPaid -= row.amount;
                pending -= row.amount;
                remainingCredit += row.amount;
            }
        });

        // Actualizar la interfaz con los valores corregidos
        updateTotals();
    }
}

// Agregar una fila a la tabla
function addRowToTable(type, date, amount, updateTotalsFlag = true) {
    const tableBody = document.querySelector("#daily-tracker tbody");
    const newRow = document.createElement("tr");

    // Tipo de transacción
    const typeCell = document.createElement("td");
    typeCell.textContent = type === "gasto" ? "Gasto" : "Abono";

    // Fecha
    const dateCell = document.createElement("td");
    dateCell.textContent = date;

    // Monto
    const amountCell = document.createElement("td");
    amountCell.textContent = type === "gasto" ? `+${amount.toFixed(2)}` : `-${Math.abs(amount).toFixed(2)}`;

    // Acciones
    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.onclick = () => removeRow(deleteButton);
    actionCell.appendChild(deleteButton);

    // Agregar celdas a la fila
    newRow.appendChild(typeCell);
    newRow.appendChild(dateCell);
    newRow.appendChild(amountCell);
    newRow.appendChild(actionCell);

    // Agregar la fila a la tabla
    tableBody.appendChild(newRow);

    // Actualizar los totales si es necesario
    if (updateTotalsFlag) {
        if (type === "gasto") {
            totalSpent += amount;
            pending += amount;
            remainingCredit -= amount;
        } else if (type === "pago") {
            totalPaid -= amount;
            pending -= amount;
            remainingCredit += amount;
        }
        updateTotals();
    }

    // Guardar los datos en localStorage
    const rowData = { type, date, amount };
    const existingData = JSON.parse(localStorage.getItem("creditData")) || [];
    existingData.push(rowData);
    saveDataToLocalStorage(existingData);
}

// Eliminar una fila de la tabla
function removeRow(button) {
    const row = button.closest("tr");
    const typeCell = row.querySelector("td:nth-child(1)").textContent.trim();
    const amountCell = row.querySelector("td:nth-child(3)").textContent.trim();
    const amount = parseFloat(amountCell.replace(/[^-\d.]/g, ""));

    // Restaurar los totales según el tipo de entrada
    if (typeCell === "Gasto") {
        totalSpent -= Math.abs(amount);
        pending -= Math.abs(amount);
        remainingCredit += Math.abs(amount);
    } else if (typeCell === "Abono") {
        totalPaid += Math.abs(amount);
        pending += Math.abs(amount);
        remainingCredit -= Math.abs(amount);
    }

    // Eliminar la fila
    row.remove();

    // Actualizar los totales
    updateTotals();

    // Actualizar localStorage
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

    // Mostrar notificación
    showNotification("Registro eliminado correctamente");
}

// Limpiar todos los datos
document.getElementById("clear-all").addEventListener("click", () => {
    const confirmation = confirm("¿Estás seguro de que deseas limpiar todos los registros?");
    if (confirmation) {
        // Limpiar la tabla
        const tableBody = document.querySelector("#daily-tracker tbody");
        tableBody.innerHTML = "";

        // Reiniciar los totales
        pending = 0;
        totalSpent = 0;
        totalPaid = 0;
        remainingCredit = 2400;
        updateTotals();

        // Limpiar localStorage
        localStorage.removeItem("creditData");

        // Mostrar notificación
        showNotification("Todos los registros han sido eliminados");
    }
});

// Agregar un nuevo registro a la tabla
document.getElementById("entry-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;

    // Validar campos
    if (!amount || !date || !type) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Agregar la fila a la tabla
    addRowToTable(type, date, amount);

    // Limpiar el formulario
    document.getElementById("entry-form").reset();

    // Mostrar notificación
    showNotification("Registro agregado correctamente");
});

// Cargar datos al iniciar la página
window.addEventListener("load", () => {
    loadDataFromLocalStorage();
});
    
