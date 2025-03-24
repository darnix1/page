//const jsonBinUrl = "https://api.jsonbin.io/v3/b/67e174cb8561e97a50f1ed57"; // Reemplaza con tu URL
//const jsonBinKey = "$2a$10$d4NXRsjStC0Oouw5e8ylt.qGg74c53bPHKU9VbI7PKMTSMyXvWfvK"; // Reemplaza con tu API Key 
// Variables de Totales
let pending = 0;
let totalSpent = 0;
let totalPaid = 0;
let remainingCredit = 2400;

// URL de JSONBin
const jsonBinUrl = "https://api.jsonbin.io/v3/b/67e174cb8561e97a50f1ed57"; // Reemplaza con tu URL
const jsonBinKey = "$2a$10$d4NXRsjStC0Oouw5e8ylt.qGg74c53bPHKU9VbI7PKMTSMyXvWfvK"; // Reemplaza con tu API Key

const notification = document.getElementById("notification");
const closeNotification = document.getElementById("close-notification");

// Mostrar notificación
function showNotification(message) {
    notification.classList.remove("hidden");
    notification.classList.add("visible");
    document.getElementById("notification-message").textContent = message;

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

// Cargar datos desde JSONBin
async function loadDataFromJSON() {
    try {
        const response = await fetch(jsonBinUrl, {
            headers: { "X-Master-Key": jsonBinKey }
        });
        const result = await response.json();
        const data = result.record;

        if (data && data.length > 0) {
            // Agregar los registros a la tabla y actualizar los totales
            data.forEach((row) => {
                addRowToTable(row.type, row.date, row.amount, false); // No recalcular totales al cargar
            });
        }
        updateTotals(); // Recalcular totales después de cargar los datos
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

// Guardar datos en JSONBin
async function saveDataToJSON(data) {
    try {
        await fetch(jsonBinUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": jsonBinKey
            },
            body: JSON.stringify({ record: data })
        });
    } catch (error) {
        console.error("Error al guardar los datos:", error);
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
            totalPaid -= amount;
            pending -= amount;
            remainingCredit += amount;
        }
        updateTotals();
    }

    const rowData = { type, date, amount };
    const existingData = JSON.parse(localStorage.getItem("creditData")) || [];
    existingData.push(rowData);
    saveDataToJSON(existingData);
}

// Eliminar una fila de la tabla
function removeRow(button) {
    const row = button.closest("tr");
    const typeCell = row.querySelector("td:nth-child(1)").textContent.trim();
    const amountCell = row.querySelector("td:nth-child(3)").textContent.trim();
    const amount = parseFloat(amountCell.replace(/[^\d.-]/g, ""));
    const dateCell = row.querySelector("td:nth-child(2)").textContent.trim();

    row.remove();

    if (typeCell === "Gasto") {
        totalSpent -= amount;
        pending -= amount;
        remainingCredit += amount;
    } else if (typeCell === "Abono") {
        totalPaid += amount;
        pending += amount;
        remainingCredit -= amount;
    }

    updateTotals();

    // Actualizar en JSONBin
    loadDataFromJSON();
}

// Limpiar todo
document.getElementById("clear-all").addEventListener("click", () => {
    localStorage.removeItem("creditData");
    loadDataFromJSON();
});

// Formulario para agregar una entrada
document.getElementById("entry-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;

    if (isNaN(amount) || !date || !type) {
        showNotification("Por favor complete todos los campos.");
        return;
    }

    addRowToTable(type, date, amount);
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    document.getElementById("type").value = "gasto";
});

document.getElementById("close-notification").addEventListener("click", hideNotification);

// Cargar datos al cargar la página
window.addEventListener("load", loadDataFromJSON);
                              
