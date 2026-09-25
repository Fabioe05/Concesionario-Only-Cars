const seccionMarcas = document.getElementById("seccion-marcas");
const seccionModelos = document.getElementById("seccion-modelos");
const brandTitle = document.getElementById("brand-title");
const vehiculosGrid = document.getElementById("vehicles-grid");

// Obtiene la marca desde los parámetros de la URL (?brand=...)
function obtenerMarcaURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("brand"); // Retorna null si la URL es solo marcas.html
}

// Crea la estructura HTML para la tarjeta de un vehículo
function crearTarjetaVehiculo(vehiculo) {
  // 1. Obtenemos la marca directamente de la URL usando la función que ya tienes
  const nombreMarca = obtenerMarcaURL();

  const card = document.createElement("div");
  card.className = "card";

  // 2. Usamos 'nombreMarca' en la línea del título en lugar de 'vehiculo.marca'
  card.innerHTML = `
        <div class="card-img">Imagen de ${vehiculo.modelo}</div>
        <div class="card-body">
            <h3 class="card-title">${nombreMarca} ${vehiculo.modelo}</h3>
            <div class="card-price">$${vehiculo.precio}</div>
            <p class="card-text">${vehiculo.transmision} - ${vehiculo.motor}</p>
            <a href="vehiculo.html?id=${vehiculo._id}" class="btn-primary" style="width:100%;">Ver Detalles</a>
        </div>
    `;

  return card;
}

// Muestra las tarjetas en la cuadrícula o un mensaje si está vacío
function renderizarVehiculos(vehiculos) {
  vehiculosGrid.innerHTML = "";

  if (!vehiculos || vehiculos.length === 0) {
    vehiculosGrid.innerHTML =
      "<p>No hay vehículos registrados para esta marca actualmente.</p>";
    return;
  }

  vehiculos.forEach((v) => {
    const tarjeta = crearTarjetaVehiculo(v);
    vehiculosGrid.appendChild(tarjeta);
  });
}

// Realiza la petición a la API para obtener vehículos de la marca seleccionada
async function cargarVehiculosPorMarca(brand) {
  const response = await fetch(`/api/vehiculos/marca/${brand}`);
  const vehiculos = await response.json();

  vehiculosGrid.innerHTML = "";

  // 1. Validar si el backend devolvió un error (ej. status 404 o 500)
  if (!response.ok) {
    vehiculosGrid.innerHTML = `<p style="color: white; text-align: center;">${vehiculos.mensaje}</p>`;
    return;
  }

  // 2. Validar si el arreglo está vacío
  if (vehiculos.length === 0) {
    vehiculosGrid.innerHTML =
      '<p style="color: white; text-align: center;">No hay vehículos registrados para esta marca actualmente.</p>';
    return;
  }

  // 3. Iterar sobre el arreglo de vehículos si todo está correcto
  vehiculos.forEach((vehiculo) => {
    const tarjeta = crearTarjetaVehiculo(vehiculo);
    vehiculosGrid.appendChild(tarjeta);
  });
}

// Controla qué vista mostrar según si hay un parámetro de marca en la URL
function inicializarPagina() {
  const brand = obtenerMarcaURL();

  if (!brand) {
    // VISTA 1: Usuario entra a marcas.html (Muestra la grilla con Kia, Chevrolet, etc.)
    seccionMarcas.style.display = "block";
    seccionModelos.style.display = "none";
  } else {
    // VISTA 2: Usuario entra a marcas.html?brand=Kia (Muestra los modelos de Kia)
    seccionMarcas.style.display = "none";
    seccionModelos.style.display = "block";

    if (brandTitle) {
      brandTitle.textContent = `MODELOS ${brand.toUpperCase()}`;
    }

    cargarVehiculosPorMarca(brand);
  }
}

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", inicializarPagina);
