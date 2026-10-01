// Selectores de la vista
const tituloVehiculo = document.getElementById("vehicle-title");
const motorVehiculo = document.getElementById("vehicle-motor");
const estatusVehiculo = document.getElementById("vehicle-status");
const transmisionVehiculo = document.getElementById("vehicle-transmission");
const dueñosVehiculo = document.getElementById("vehicle-owners");
const añoVehiculo = document.getElementById("vehicle-year");
const descripcionVehiculo = document.getElementById("vehicle-description");
const precioVehiculo = document.getElementById("vehicle-price");

// Selectores de la Galería
const mainImg = document.getElementById("main-image");
const thumbnailsContainer = document.getElementById("thumbnails-container");

// Selectores del Lightbox
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

let imagenesVehiculo = [];
let indiceImagenActual = 0;

function obtenerIdDeUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function renderizarVehiculo(vehiculo) {
  tituloVehiculo.textContent =
    `${vehiculo.marca || ""} ${vehiculo.modelo}`.trim();
  motorVehiculo.textContent = vehiculo.motor || "N/A";
  estatusVehiculo.textContent = vehiculo.estatus || vehiculo.status || "N/A";
  transmisionVehiculo.textContent = vehiculo.transmision || "N/A";
  dueñosVehiculo.textContent = vehiculo.dueños ?? vehiculo.owners ?? "N/A";
  añoVehiculo.textContent = vehiculo.año || "N/A";
  descripcionVehiculo.textContent =
    vehiculo.descripcion || vehiculo.description || "";
  precioVehiculo.textContent = `$${vehiculo.precio || 0}`;

  // Galería de imágenes
  imagenesVehiculo = vehiculo.images || vehiculo.imagenes || [];

  if (imagenesVehiculo.length > 0) {
    mainImg.src = imagenesVehiculo[0];
    thumbnailsContainer.innerHTML = "";

    imagenesVehiculo.forEach((imgUrl, index) => {
      const thumb = document.createElement("img");
      thumb.src = imgUrl;
      thumb.classList.add("thumb-img");
      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        indiceImagenActual = index;
        actualizarImagenPrincipal();
      });

      thumbnailsContainer.appendChild(thumb);
    });
  } else {
    mainImg.alt = "Sin imagen disponible";
  }
}

function actualizarImagenPrincipal() {
  mainImg.src = imagenesVehiculo[indiceImagenActual];

  // Actualizar borde activo en miniaturas
  const thumbs = thumbnailsContainer.querySelectorAll(".thumb-img");
  thumbs.forEach((thumb, idx) => {
    thumb.classList.toggle("active", idx === indiceImagenActual);
  });
}

// Configuración del Lightbox (Modal)
function inicializarLightbox() {
  mainImg.addEventListener("click", () => {
    if (imagenesVehiculo.length === 0) return;
    lightboxImg.src = imagenesVehiculo[indiceImagenActual];
    lightboxModal.classList.add("active");
  });

  lightboxClose.addEventListener("click", () => {
    lightboxModal.classList.remove("active");
  });

  lightboxPrev.addEventListener("click", () => {
    indiceImagenActual =
      (indiceImagenActual - 1 + imagenesVehiculo.length) %
      imagenesVehiculo.length;
    lightboxImg.src = imagenesVehiculo[indiceImagenActual];
    actualizarImagenPrincipal();
  });

  lightboxNext.addEventListener("click", () => {
    indiceImagenActual = (indiceImagenActual + 1) % imagenesVehiculo.length;
    lightboxImg.src = imagenesVehiculo[indiceImagenActual];
    actualizarImagenPrincipal();
  });

  // Cerrar al hacer clic fuera de la foto
  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove("active");
    }
  });
}

async function inicializarVehiculo() {
  const vehiculoId = obtenerIdDeUrl();

  if (!vehiculoId || vehiculoId === "undefined") {
    alert("ID de vehículo no válido");
    window.location.href = "./marcas.html";
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
