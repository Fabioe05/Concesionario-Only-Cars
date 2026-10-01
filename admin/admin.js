// 1. SELECTORES DE ELEMENTOS DEL DOM
const formVehiculo = document.getElementById("form-vehiculo");
const inputVehiculoId = document.getElementById("vehiculo-id");

// Capturamos 'marca' (el select) y el nuevo campo 'kilometraje'
const inputMarca = document.getElementById("marca");
const inputKilometraje = document.getElementById("kilometraje");

const inputModelo = document.getElementById("modelo");
const inputAño = document.getElementById("año");
const inputMotor = document.getElementById("motor");
const inputPrecio = document.getElementById("precio");
const inputTransmision = document.getElementById("transmision");
const inputDueños = document.getElementById("dueños");
const inputEstatus = document.getElementById("estatus");
const inputDescripcion = document.getElementById("descripcion");
const inputImagenes = document.getElementById("input-imagenes");
const divVistaPrevia = document.getElementById("vista-previa");

// Selectores para los botones
const btnAgregar = document.getElementById("btn-agregar");
const btnModificar = document.getElementById("btn-modificar");
const btnEliminar = document.getElementById("btn-eliminar");
const btnLimpiar = document.getElementById("btn-limpiar");

// 2. FUNCIONES PRINCIPALES

// Función unificada para Crear (POST) o Modificar (PUT)
async function guardarVehiculo(metodo) {
  const id = inputVehiculoId.value.trim();

  // Validamos que exista un ID si el método es PUT (Modificar)
  if (metodo === "PUT" && !id) {
    return alert(
      "Por favor, ingresa el ID del vehículo que deseas modificar en la parte superior.",
    );
  }

  const formData = new FormData();

  // Agregar campos de texto al FormData
  formData.append("marca", inputMarca.value);
  formData.append("kilometraje", inputKilometraje.value);
  formData.append("modelo", inputModelo.value);
  formData.append("año", inputAño.value);
  formData.append("motor", inputMotor.value);
  formData.append("precio", inputPrecio.value);
  formData.append("transmision", inputTransmision.value);
  formData.append("dueños", inputDueños.value);
  formData.append("estatus", inputEstatus.value);
  formData.append("descripcion", inputDescripcion.value);

  // Agregar los archivos (imágenes) al FormData
  if (inputImagenes.files.length > 0) {
    for (let i = 0; i < inputImagenes.files.length; i++) {
      formData.append("images", inputImagenes.files[i]);
    }
  }

  // Definimos la URL. Si hay ID, lo concatenamos (para PUT)
  const url = id ? `/api/vehiculos/${id}` : "/api/vehiculos";

  try {
    const res = await fetch(url, {
      method: metodo,
      body: formData,
    });

    if (res.ok) {
      alert(
        `Vehículo ${metodo === "PUT" ? "actualizado" : "agregado"} con éxito`,
      );
      limpiarFormulario();
    } else {
      const errorText = await res.text();
      alert(`Error al guardar: ${errorText}`);
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Hubo un error de conexión con el servidor.");
  }
}

// Función para Eliminar (DELETE)
async function eliminarVehiculo() {
  const id = inputVehiculoId.value.trim();

  if (!id) {
    return alert("Ingresa o selecciona un ID para eliminar");
  }

  if (confirm("¿Estás seguro de eliminar este vehículo permanentemente?")) {
    try {
      const res = await fetch(`/api/vehiculos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Vehículo eliminado exitosamente");
        limpiarFormulario();
      } else {
        alert("Error al intentar eliminar el vehículo.");
      }
    } catch (error) {
      console.error("Error en la solicitud de eliminación:", error);
      alert("Hubo un error de conexión con el servidor.");
    }
  }
}

// Función para limpiar el formulario
function limpiarFormulario() {
  if (formVehiculo) formVehiculo.reset();
  if (inputVehiculoId) inputVehiculoId.value = "";
  if (divVistaPrevia) divVistaPrevia.innerHTML = "";
}

// 3. EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
  // Escuchando clic en Agregar (POST)
  if (btnAgregar) {
    btnAgregar.addEventListener("click", (e) => {
      e.preventDefault(); // Evita que la página recargue
      guardarVehiculo("POST");
    });
  }

  // Escuchando clic en Modificar (PUT)
  if (btnModificar) {
    btnModificar.addEventListener("click", (e) => {
      e.preventDefault();
      guardarVehiculo("PUT");
    });
  }

  // Escuchando clic en Eliminar (DELETE)
  if (btnEliminar) {
    btnEliminar.addEventListener("click", (e) => {
      e.preventDefault();
      eliminarVehiculo();
    });
  }

  // Escuchando clic en Limpiar
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", (e) => {
      e.preventDefault();
      limpiarFormulario();
    });
  }
});
