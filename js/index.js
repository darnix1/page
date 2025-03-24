// Variables globales para almacenar los totales
let pending = 0; // Crédito pendiente
let totalSpent = 0; // Total gastado
let totalPaid = 0; // Total pagado
let remainingCredit = 2400; // Crédito restante (inicial)

// Elementos del DOM
const notification = document.getElementById("notification");

// Abrir la base de datos IndexedDB
let db;
const request = indexedDB.open("CreditManagerDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadDataFromIndexedDB(); // Cargar datos al iniciar
};

request.onerror = function () {
    console.error("Error al abrir IndexedDB");
};

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

// Guardar datos en IndexedDB
function saveDataToIndexedDB(transaction) {
    const transactionStore = db.transaction("transactions", "readwrite").objectStore("transactions");
    transactionStore.add(transaction);
}

// Cargar datos desde IndexedDB
function loadDataFromIndexedDB() {
    const transactionStore = db.transaction("transactions", "readonly").objectStore("transactions");
    const request = transactionStore.getAll();

    request.onsuccess = function () {
        const transactions = request.result;
        transactions.forEach((row) => {
            addRowToTable(row.type, row.date, row.amount, false); // No recalculamos totales aquí
        });
        updateTotals(); // Recalcular totales después de cargar los datos
    };
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
    deleteButton.onclick = () => removeRow(deleteButton, type, amount, date);
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
        saveDataToIndexedDB({ type, date, amount });
    }
}

// Eliminar una fila de la tabla
function removeRow(button, type, amount, date) {
    const row = button.closest("tr");
    row.remove();

    if (type === "gasto") {
        totalSpent -= Math.abs(amount);
        pending -= Math.abs(amount);
        remainingCredit += Math.abs(amount);
    } else if (type === "pago") {
        totalPaid += Math.abs(amount);
        pending += Math.abs(amount);
        remainingCredit -= Math.abs(amount);
    }

    updateTotals();

    // Eliminar de IndexedDB
    const transactionStore = db.transaction("transactions", "readwrite").objectStore("transactions");
    const request = transactionStore.openCursor();

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.type === type && cursor.value.amount === amount && cursor.value.date === date) {
                cursor.delete();
                return;
            }
            cursor.continue();
        }
    };

    showNotification("Registro eliminado correctamente");
}

// Limpiar todos los datos
document.getElementById("clear-all").addEventListener("click", () => {
    const confirmation = confirm("¿Estás seguro de que deseas limpiar todos los registros?");
    if (confirmation) {
        const transactionStore = db.transaction("transactions", "readwrite").objectStore("transactions");
        transactionStore.clear();

        document.querySelector("#daily-tracker tbody").innerHTML = "";

        pending = 0;
        totalSpent = 0;
        totalPaid = 0;
        remainingCredit = 2400;
        updateTotals();

        showNotification("Todos los registros han sido eliminados");
    }
});

// Agregar un nuevo registro a la tabla
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
    if (db) {
        loadDataFromIndexedDB();
    }
});
                                                
