// Configuración de Supabase
const supabase = createClient('https://opyosxtaqpiuaquritch.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weW9zeHRhcXBpdWFxdXJpdGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODU0MzcsImV4cCI6MjA1ODM2MTQzN30.tUiV5xs9vx6vUucDf_lk2QnAvO-LPbz0h44qPhOd7bM);

// Función para agregar un registro
async function addTransaction(type, amount, date) {
    const { data, error } = await supabase
        .from('transactions')
        .insert([{ type, amount, date }]);

    if (error) {
        alert('Error al agregar el registro');
    } else {
        showNotification('Registro agregado correctamente');
        loadTransactions();
    }
}

// Función para obtener los registros y actualizar la tabla
async function loadTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*');

    if (error) {
        alert('Error al cargar los registros');
    } else {
        const tableBody = document.querySelector("#daily-tracker tbody");
        tableBody.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos registros

        data.forEach(row => {
            const newRow = document.createElement("tr");

            // Crear las celdas
            const typeCell = document.createElement("td");
            typeCell.textContent = row.type === 'gasto' ? 'Gasto' : 'Abono';
            const dateCell = document.createElement("td");
            dateCell.textContent = row.date;
            const amountCell = document.createElement("td");
            amountCell.textContent = row.type === 'gasto' ? `+${row.amount}` : `-${row.amount}`;
            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.onclick = () => deleteTransaction(row.id);
            actionCell.appendChild(deleteButton);

            // Agregar celdas a la fila
            newRow.appendChild(typeCell);
            newRow.appendChild(dateCell);
            newRow.appendChild(amountCell);
            newRow.appendChild(actionCell);
            tableBody.appendChild(newRow);
        });
    }
}

// Función para eliminar un registro
async function deleteTransaction(id) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error al eliminar el registro');
    } else {
        showNotification('Registro eliminado correctamente');
        loadTransactions();
    }
}

// Al cargar la página, cargar los registros
window.addEventListener("load", loadTransactions);

// Enviar datos del formulario
document.getElementById("entry-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;
    addTransaction(type, amount, date);
    document.getElementById("entry-form").reset();
});
