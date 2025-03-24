d("entry-form").reset();
});
// Configura el cliente de Supabase
const supabaseUrl = 'https://opyosxtaqpiuaquritch.supabase.co'; // Tu URL de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weW9zeHRhcXBpdWFxdXJpdGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODU0MzcsImV4cCI6MjA1ODM2MTQzN30.tUiV5xs9vx6vUucDf_lk2QnAvO-LPbz0h44qPhOd7bM'; // Tu clave pública de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Cargar registros de la base de datos y mostrarlos en la tabla
async function cargarRegistros() {
    const { data, error } = await supabase
        .from('registros') // Nombre de la tabla en Supabase
        .select('*'); // Seleccionar todos los registros

    if (error) {
        console.error('Error al cargar los registros:', error);
    } else {
        const tableBody = document.querySelector('#daily-tracker tbody');
        tableBody.innerHTML = ''; // Vaciar la tabla antes de agregar nuevos registros

        // Mostrar los registros en la tabla
        data.forEach(registro => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${registro.type}</td>
                <td>${registro.date}</td>
                <td>$${registro.amount}</td>
                <td><button class="delete-btn" onclick="eliminarRegistro(${registro.id})">Eliminar</button></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Función para agregar un nuevo registro
document.getElementById('entry-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;

    // Insertar datos en la tabla 'registros' en Supabase
    const { data, error } = await supabase
        .from('registros')
        .insert([
            { amount: amount, date: date, type: type }
        ]);

    if (error) {
        console.error('Error al insertar los datos:', error);
    } else {
        console.log('Registro insertado con éxito:', data);
        cargarRegistros(); // Recargar los registros para mostrar el nuevo
    }
});

// Función para eliminar un registro
async function eliminarRegistro(id) {
    const { data, error } = await supabase
        .from('registros')
        .delete()
        .eq('id', id); // Eliminar el registro por su ID

    if (error) {
        console.error('Error al eliminar el registro:', error);
    } else {
        console.log('Registro eliminado:', data);
        cargarRegistros(); // Recargar los registros después de eliminar
    }
}

// Llamar la función para cargar los registros al inicio
cargarRegistros();
