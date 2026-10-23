// Selectores de la vista
const tituloVehiculo = document.getElementById("vehicle-title");
const motorVehiculo = document.getElementById("vehicle-motor");
const estatusVehiculo = document.getElementById("vehicle-status");
const transmisionVehiculo = document.getElementById("vehicle-transmission");
const dueñosVehiculo = document.getElementById("vehicle-owners");
const añoVehiculo = document.getElementById("vehicle-year");
const descripcionVehiculo = document.getElementById("vehicle-description");
const precioVehiculo = document.getElementById("vehicle-price");
const btnContactarVehiculo = document.getElementById("btn-contactar-vehiculo");

// Selectores de la Galería
const imagenPrincipal = document.getElementById("main-image");
const contenedorMiniaturas = document.getElementById("thumbnails-container");

// Selectores del Lightbox
const modalLightbox = document.getElementById("lightbox-modal");
const imagenLightbox = document.getElementById("lightbox-img");
const cerrarLightbox = document.getElementById("lightbox-close");
const lightboxAnterior = document.getElementById("lightbox-prev");
const lightboxSiguiente = document.getElementById("lightbox-next");

let imagenesVehiculo = [];
let indiceImagenActual = 0;

function obtenerIdDeUrl() {
  const parametrosUrl = new URLSearchParams(window.location.search);
  return parametrosUrl.get("id");
}

function renderizarVehiculo(vehiculo) {
  tituloVehiculo.textContent =
    `${vehiculo.marca || ""} ${vehiculo.modelo}`.trim();

  if (btnContactarVehiculo && vehiculo.id) {
    btnContactarVehiculo.href = `../../index.html?vehiculo=${encodeURIComponent(vehiculo.id)}#contacto`;
  }

  motorVehiculo.textContent = vehiculo.motor || "N/A";
  estatusVehiculo.textContent = vehiculo.status || "N/A";
  transmisionVehiculo.textContent = vehiculo.transmision || "N/A";
  dueñosVehiculo.textContent = vehiculo.owners ?? "N/A";
  añoVehiculo.textContent = vehiculo.anio || "N/A";
  descripcionVehiculo.textContent = vehiculo.description || "";
  precioVehiculo.textContent = `$${vehiculo.precio || 0}`;

  // Galería de imágenes
  imagenesVehiculo = vehiculo.images || [];

  if (imagenesVehiculo.length > 0) {
    imagenPrincipal.src = imagenesVehiculo[0];
    contenedorMiniaturas.innerHTML = "";

    imagenesVehiculo.forEach((imgUrl, index) => {
      const thumb = document.createElement("img");
      thumb.src = imgUrl;
      thumb.classList.add("thumb-img");
      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        indiceImagenActual = index;
        actualizarImagenPrincipal();
      });

      contenedorMiniaturas.appendChild(thumb);
    });
  } else {
    imagenPrincipal.alt = "Sin imagen disponible";
  }
}

function actualizarImagenPrincipal() {
  imagenPrincipal.src = imagenesVehiculo[indiceImagenActual];

  // Actualizar borde activo en miniaturas
  const miniaturas = contenedorMiniaturas.querySelectorAll(".thumb-img");
  miniaturas.forEach((thumb, idx) => {
    thumb.classList.toggle("active", idx === indiceImagenActual);
  });
}

// Configuración del Lightbox (Modal)
function inicializarLightbox() {
  imagenPrincipal.addEventListener("click", () => {
    if (imagenesVehiculo.length === 0) return;
    imagenLightbox.src = imagenesVehiculo[indiceImagenActual];
    modalLightbox.classList.add("active");
  });

  cerrarLightbox.addEventListener("click", () => {
    modalLightbox.classList.remove("active");
  });

  lightboxAnterior.addEventListener("click", () => {
    indiceImagenActual =
      (indiceImagenActual - 1 + imagenesVehiculo.length) %
      imagenesVehiculo.length;
    imagenLightbox.src = imagenesVehiculo[indiceImagenActual];
    actualizarImagenPrincipal();
  });

  lightboxSiguiente.addEventListener("click", () => {
    indiceImagenActual = (indiceImagenActual + 1) % imagenesVehiculo.length;
    imagenLightbox.src = imagenesVehiculo[indiceImagenActual];
    actualizarImagenPrincipal();
  });

  // Cerrar al hacer clic fuera de la foto
  modalLightbox.addEventListener("click", (e) => {
    if (e.target === modalLightbox) {
      modalLightbox.classList.remove("active");
    }
  });
}

async function inicializarVehiculo() {
  const vehiculoId = obtenerIdDeUrl();

  if (!vehiculoId || vehiculoId === "undefined") {
    alert("ID de vehículo no válido");
    window.location.href = "../../index.html#marcas";
    return;
  }

  try {
    const response = await fetch(`/api/vehiculos/${vehiculoId}`);
    if (!response.ok) throw new Error("Vehículo no encontrado");

    const vehiculo = await response.json();
    renderizarVehiculo(vehiculo);
    inicializarLightbox();
  } catch (error) {
    console.error("Error al cargar detalle del vehículo:", error);
  }
}

document.addEventListener("DOMContentLoaded", inicializarVehiculo);
