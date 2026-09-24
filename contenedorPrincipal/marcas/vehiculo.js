// 1. SELECTORES
// Se guardan las referencias del DOM en constantes globales del archivo
const titulo = document.getElementById("vehicle-title");
const precio = document.getElementById("vehicle-price");
const motor = document.getElementById("vehicle-motor");
const estatus = document.getElementById("vehicle-status");
const owners = document.getElementById("vehicle-owners");
const transmision = document.getElementById("vehicle-transmision");
const descripcion = document.getElementById("vehicle-description");

// 2. FUNCIONES
// Lógica asíncrona separada para obtener y renderizar los datos
const cargarDetallesVehiculo = async () => {
  // Extraer el ID de la URL
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("id");

  if (!vehicleId) {
    alert("Vehículo no especificado");
    window.location.href = "../index.html";
    return;
  }

  try {
    // Consultar a la API
    const response = await fetch(`/api/vehiculos/${vehicleId}`);
    const vehiculo = await response.json();

    // Inyectar la información en el DOM usando los selectores
    titulo.textContent = `${vehiculo.marca}, ${vehiculo.modelo}`;
    precio.textContent = `${vehiculo.precio.toLocaleString()}`;
    motor.textContent = vehiculo.motor;
    estatus.textContent = vehiculo.status;
    owners.textContent = vehiculo.owners;
    transmision.textContent = vehiculo.transmision;
    descripcion.textContent = vehiculo.description;
  } catch (error) {
    console.error("Error cargando el vehículo:", error);
  }
};

// 3. EVENT LISTENERS
// Se ejecuta la función únicamente cuando el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", cargarDetallesVehiculo);
