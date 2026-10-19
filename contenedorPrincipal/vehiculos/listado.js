// ==========================================
// VISTA LISTADO DE VEHÍCULOS POR MARCA
// ==========================================

const tituloMarca = document.getElementById("titulo-marca");
const vehiculosGrid = document.getElementById("vehiculos-grid");
const selectOrden = document.getElementById("ordenar");

let vehiculosFiltrados = [];

/**
 * Obtiene el valor del parámetro "marca" de la URL (ej. ?marca=Kia).
 */
function obtenerMarcaDeURL() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("marca") || "").trim();
}

/**
 * Convierte un valor a número de forma segura.
 */
function aNumero(valor) {
  return Number(valor) || 0;
}

/**
 * Construye el HTML de la tarjeta horizontal de un vehículo.
 * Solo muestra marca, modelo y precio (el resto va en "Ver Detalle").
 */
function crearTarjetaVehiculo(vehiculo) {
  const vehiculoId = vehiculo.id;
  const imagenes = vehiculo.images || [];
  const imagenHTML =
    imagenes.length > 0
      ? `<img src="${imagenes[0]}" alt="${vehiculo.modelo || "Vehículo"}" />`
      : "Sin imagen";

  const precioFormateado = aNumero(vehiculo.precio).toLocaleString("en-US");
  const nombre = `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim();

  return `
    <a href="./vehiculo.html?id=${vehiculoId}" class="vehiculo-item">
      <div class="vehiculo-item-img">${imagenHTML}</div>
      <div class="vehiculo-item-info">
        <h3 class="vehiculo-item-titulo">${nombre || "Vehículo"}</h3>
        <div class="vehiculo-item-precio">$${precioFormateado}</div>
      </div>
      <span class="btn-primary vehiculo-item-accion">Ver Detalle</span>
    </a>
  `;
}

/**
 * Ordena la lista según el criterio seleccionado.
 */
function ordenarVehiculos(lista) {
  const criterio = selectOrden ? selectOrden.value : "precio-desc";
  const copia = [...lista];
  const anioDe = (v) => aNumero(v.anio);

  switch (criterio) {
    case "precio-desc":
      return copia.sort((a, b) => aNumero(b.precio) - aNumero(a.precio));
    case "anio-desc":
      return copia.sort((a, b) => anioDe(b) - anioDe(a));
    case "anio-asc":
      return copia.sort((a, b) => anioDe(a) - anioDe(b));
    case "precio-asc":
    default:
      return copia.sort((a, b) => aNumero(a.precio) - aNumero(b.precio));
  }
}

/**
 * Pinta en pantalla los vehículos ya ordenados.
 */
function renderizarVehiculos() {
  if (!vehiculosGrid) return;

  if (vehiculosFiltrados.length === 0) {
    vehiculosGrid.innerHTML =
      '<p class="msg-vacio">No hay vehículos para mostrar.</p>';
    return;
  }

  vehiculosGrid.innerHTML = ordenarVehiculos(vehiculosFiltrados)
    .map(crearTarjetaVehiculo)
    .join("");

  // Si la foto de una tarjeta no carga, se deja "Sin imagen" en su hueco
  vehiculosGrid.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.parentElement.textContent = "Sin imagen";
    });
  });
}

/**
 * Carga los vehículos desde la API y los filtra por la marca de la URL.
 */
async function cargarVehiculos() {
  const marca = obtenerMarcaDeURL();

  if (tituloMarca) {
    tituloMarca.textContent = marca ? `Modelos ${marca}` : "Todos los Vehículos";
  }

  try {
    const res = await fetch("/api/vehiculos");
    if (!res.ok) throw new Error("No se pudieron cargar los vehículos");
    const data = await res.json();
    const vehiculos = Array.isArray(data) ? data : [];

    const marcaBuscada = marca.toLowerCase();
    vehiculosFiltrados = marca
      ? vehiculos.filter(
        (v) => (v.marca || "").trim().toLowerCase() === marcaBuscada,
      )
      : vehiculos;

    if (vehiculosFiltrados.length === 0) {
      vehiculosGrid.innerHTML = `<p class="msg-vacio">No hay vehículos registrados${marca ? ` para ${marca}` : ""} actualmente.</p>`;
      return;
    }

    renderizarVehiculos();
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    vehiculosGrid.innerHTML =
      '<p class="msg-vacio">Hubo un error al cargar los vehículos. Intenta de nuevo.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarVehiculos();

  if (selectOrden) {
    selectOrden.addEventListener("change", renderizarVehiculos);
  }
});
