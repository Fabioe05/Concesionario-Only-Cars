// ==========================================
// 1. SELECTORES DEL DOM (Globales de la Landing)
// ==========================================
// Selectores para la zona de contacto
const inputNombre = document.getElementById("contacto-nombre");
const inputTelefono = document.getElementById("contacto-telefono");
const inputVehiculo = document.getElementById("contacto-vehiculo");
const btnWhatsapp = document.getElementById("btn-enviar-whatsapp");
const btnCorreo = document.getElementById("btn-enviar-correo");

// Selectores para la sección de mejores ofertas
const mejoresOfertas = document.getElementById("mejores-ofertas");

// Selectores para la sección de marcas
const gridMarcas = document.getElementById("grid-marcas");
const tituloMarcas = document.getElementById("marcas");

// ==========================================
// 2. DATOS Y FUNCIONES PRINCIPALES
// ==========================================

// --- SECCIÓN MEJORES OFERTAS ---
/**
 * Construye el HTML de la tarjeta de una oferta.
 */
function crearTarjetaOferta(vehiculo, indice) {
  const vehiculoId = vehiculo.id;
  const imagenes = vehiculo.images || [];
  const nombre = `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim();

  const imagenHTML =
    imagenes.length > 0
      ? `<img src="${imagenes[0]}" alt="${nombre || "Vehículo"}" loading="lazy" onerror="this.parentElement.textContent = 'Sin imagen';" />`
      : "Sin imagen";

  const precioFormateado = Number(vehiculo.precio || 0).toLocaleString("en-US");

  return `
    <div class="card reveal" data-delay="${(indice % 3) + 1}">
      <div class="card-img">${imagenHTML}</div>
      <div class="card-body">
        <div class="card-price">$${precioFormateado}</div>
        <h4 class="card-title">${nombre || "Vehículo"}</h4>
        <a href="./contenedorPrincipal/vehiculos/vehiculo.html?id=${vehiculoId}" class="btn-primary">Ver Detalle</a>
      </div>
    </div>
  `;
}

/**
 * Pinta las 3 ofertas de menor precio (sin distinción de marca).
 */
function renderizarMejoresOfertas(vehiculos) {
  if (!mejoresOfertas) return;

  const ofertas = [...vehiculos]
    .sort((a, b) => Number(a.precio || 0) - Number(b.precio || 0))
    .slice(0, 3);

  if (ofertas.length === 0) {
    mejoresOfertas.innerHTML =
      '<p class="msg-vacio">No hay vehículos disponibles por ahora.</p>';
    return;
  }

  mejoresOfertas.innerHTML = ofertas.map(crearTarjetaOferta).join("");
  activarAnimaciones();
}

// --- SECCIÓN MARCAS ---
/**
 * Deja en la parrilla solo las marcas que tienen vehículos registrados.
 * Los 16 bloques del HTML son el "catálogo" de logos: aquí solo se quitan
 * los que no tienen stock. Al registrar un vehículo de una marca oculta,
 * vuelve a aparecer sola en la siguiente carga de la página.
 */
function filtrarMarcasConStock(vehiculos) {
  if (!gridMarcas) return;

  const marcasConStock = new Set(
    vehiculos.map((v) => (v.marca || "").trim().toLowerCase()).filter(Boolean),
  );

  gridMarcas.querySelectorAll(".brand-item").forEach((marcaItem) => {
    const nombre = (marcaItem.getAttribute("aria-label") || "")
      .trim()
      .toLowerCase();
    if (!marcasConStock.has(nombre)) marcaItem.remove();
  });

  const visibles = gridMarcas.querySelectorAll(".brand-item");

  // Si no queda ninguna marca, se oculta también el título de la sección.
  if (visibles.length === 0) {
    if (tituloMarcas) tituloMarcas.classList.add("oculto");
    gridMarcas.classList.add("oculto");
    return;
  }

  // Renumera el escalonado de la animación (1, 2, 3, 1, 2, 3...).
  visibles.forEach((item, indice) => {
    item.setAttribute("data-delay", String((indice % 3) + 1));
  });
}

/**
 * Descarga los vehículos una sola vez y alimenta las secciones que dependen
 * de ellos: mejores ofertas y marcas con stock.
 */
async function cargarDatosDeLaPortada() {
  try {
    const res = await fetch("/api/vehiculos");
    if (!res.ok) throw new Error("No se pudieron cargar los vehículos");
    const data = await res.json();
    const vehiculos = Array.isArray(data) ? data : [];

    renderizarMejoresOfertas(vehiculos);
    filtrarMarcasConStock(vehiculos);
  } catch (error) {
    console.error("Error al cargar los vehículos de la portada:", error);
    if (mejoresOfertas) {
      mejoresOfertas.innerHTML =
        '<p class="msg-vacio">No se pudieron cargar las ofertas.</p>';
    }
    // Si falla la conexión se dejan las 16 marcas tal cual:
    // es preferible eso a mostrar la sección de marcas vacía.
  }
}

// --- ANIMACIONES AL HACER SCROLL ---
let observadorReveal = null;

/**
 * Hace que los elementos con la clase .reveal aparezcan (fade + subida)
 * cuando entran en el viewport. Respeta "prefers-reduced-motion".
 */
function activarAnimaciones() {
  const elementos = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!elementos.length) return;

  const sinMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (sinMovimiento || !("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!observadorReveal) {
    observadorReveal = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observadorReveal.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );
  }

  elementos.forEach((el) => observadorReveal.observe(el));
}

// --- ALTURA DEL HERO ---
/**
 * Ajusta el hero para que ocupe el resto de la pantalla descontando el
 * navbar, así la sección siguiente queda por debajo del pliegue inicial.
 */
function ajustarAlturaHero() {
  const navbar = document.querySelector(".navbar");
  const hero = document.querySelector(".hero");
  if (!navbar || !hero) return;
  hero.style.setProperty("--hero-offset", `${navbar.offsetHeight}px`);
}

// --- SECCIÓN CONTACTO ---
/**
 * Valida que los campos requeridos no estén vacíos antes de generar el mensaje.
 */
function validarCamposContacto() {
  if (
    !inputNombre.value.trim() ||
    !inputTelefono.value.trim() ||
    !inputVehiculo.value.trim()
  ) {
    alert(
      "Por favor, completa todos los campos (Nombre, Teléfono y Vehículo de interés).",
    );
    return false;
  }
  return true;
}

/**
 * Recopila los datos del formulario y abre WhatsApp con un mensaje prellenado.
 */
function enviarPorWhatsApp() {
  if (!validarCamposContacto()) return;

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const vehiculo = inputVehiculo.value.trim();
  const numeroDestino = "+584241667681"; // Número de WhatsApp del concesionario

  const textoMensaje = `Hola, mi nombre es ${nombre}. Mi teléfono es ${telefono} y estoy interesado(a) en el vehículo: ${vehiculo}.`;
  const urlWhatsApp = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(textoMensaje)}`;

  window.open(urlWhatsApp, "_blank");
}

/**
 * Recopila los datos y abre el cliente de correo prellenando el asunto y el cuerpo.
 */
function enviarPorCorreo() {
  if (!validarCamposContacto()) return;

  const nombre = inputNombre.value.trim();
  const telefono = inputTelefono.value.trim();
  const vehiculo = inputVehiculo.value.trim();
  const correoDestino = "fabio.enrique14@gmail.com";

  const asunto = encodeURIComponent(`Interés en vehículo: ${vehiculo}`);
  const cuerpo = encodeURIComponent(
    `Hola, me gustaría recibir más información.\n\n` +
      `Nombre: ${nombre}\n` +
      `Teléfono/WhatsApp: ${telefono}\n` +
      `Vehículo de interés: ${vehiculo}`,
  );

  const urlMailto = `mailto:${correoDestino}?subject=${asunto}&body=${cuerpo}`;
  window.location.href = urlMailto;
}

// ==========================================
// 3. INICIALIZACIÓN Y EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Animar la aparición de las secciones al hacer scroll
  activarAnimaciones();

  // Ajustar la altura del hero al alto real del navbar
  ajustarAlturaHero();
  window.addEventListener("resize", ajustarAlturaHero);

  // Cargar los vehículos de la portada (ofertas + marcas con stock)
  cargarDatosDeLaPortada();

  // Activar los eventos de los botones de contacto
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", enviarPorWhatsApp);
  }

  if (btnCorreo) {
    btnCorreo.addEventListener("click", enviarPorCorreo);
  }
});
