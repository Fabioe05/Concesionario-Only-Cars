// ==========================================
// 1. SELECTORES DEL DOM (Globales de la Landing)
// ==========================================
// Selectores para el formulario de citas
const formCita = document.getElementById("form-cita");
const inputNombre = document.getElementById("cita-nombre");
const inputEmail = document.getElementById("cita-email");
const inputTelefono = document.getElementById("cita-telefono");
const selectVehiculo = document.getElementById("cita-vehiculo");
const inputVehiculoOtro = document.getElementById("cita-vehiculo-otro");
const inputFecha = document.getElementById("cita-fecha");
const inputHora = document.getElementById("cita-hora");
const contenedorHoras = document.getElementById("cita-horas");
const inputMensaje = document.getElementById("cita-mensaje");
const estadoCita = document.getElementById("cita-estado");
const btnAgendar = document.getElementById("btn-agendar");
const btnWhatsapp = document.getElementById("btn-enviar-whatsapp");

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
      ? `<img src="${imagenes[0]}" alt="${nombre || "Vehículo"}" loading="lazy" />`
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

  // Si la foto de una tarjeta no carga, se deja "Sin imagen" en su hueco
  mejoresOfertas.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.parentElement.textContent = "Sin imagen";
    });
  });

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
    cargarVehiculosEnFormulario(vehiculos);
  } catch (error) {
    console.error("Error al cargar los vehículos de la portada:", error);
    if (mejoresOfertas) {
      mejoresOfertas.innerHTML =
        '<p class="msg-vacio">No se pudieron cargar las ofertas.</p>';
    }
    // Si falla la conexión se dejan las 16 marcas tal cual:
    // es preferible eso a mostrar la sección de marcas vacía.
    cargarVehiculosEnFormulario([]);
  } finally {
    // Al llegar desde el detalle del vehículo con #contacto, el navegador
    // salta antes de que se pinten las ofertas y luego lanza su propio
    // desplazamiento suave. Se corrige al terminar y se reafirma un momento
    // después para que el título quede debajo del navbar.
    if (window.location.hash === "#contacto") {
      const irAlContacto = () => {
        document.getElementById("contacto")?.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      };

      requestAnimationFrame(irAlContacto);
      setTimeout(irAlContacto, 700);
    }
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
  document.documentElement.style.setProperty(
    "--navbar-alto",
    `${navbar.offsetHeight}px`,
  );
  hero.style.setProperty("--hero-offset", `${navbar.offsetHeight}px`);
}

// --- SECCIÓN CITA ---
const MAX_DIAS_CITA = 60;

function hoyEnCaracas() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function sumarDias(fecha, dias) {
  const fechaBase = new Date(`${fecha}T12:00:00Z`);
  fechaBase.setUTCDate(fechaBase.getUTCDate() + dias);
  return fechaBase.toISOString().slice(0, 10);
}

function esDomingo(fecha) {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay() === 0;
}

function configurarFechaCita() {
  if (!inputFecha) return;
  const hoy = hoyEnCaracas();
  inputFecha.min = hoy;
  inputFecha.max = sumarDias(hoy, MAX_DIAS_CITA);
}

function mostrarEstadoCita(mensaje, tipo = "info") {
  if (!estadoCita) return;
  estadoCita.textContent = mensaje;
  estadoCita.className = `cita-estado ${tipo}`;
  estadoCita.hidden = false;
}

function limpiarEstadoCita() {
  if (!estadoCita) return;
  estadoCita.hidden = true;
  estadoCita.textContent = "";
  estadoCita.className = "cita-estado";
}

function mostrarMensajeHoras(mensaje) {
  if (!contenedorHoras) return;
  contenedorHoras.innerHTML = "";

  const parrafo = document.createElement("p");
  parrafo.className = "slots-msg";
  parrafo.textContent = mensaje;
  contenedorHoras.appendChild(parrafo);

  if (inputHora) inputHora.value = "";
}

function actualizarVehiculoOtro() {
  if (!selectVehiculo || !inputVehiculoOtro) return;

  const esOtro = selectVehiculo.value === "otro";
  inputVehiculoOtro.hidden = !esOtro;
  inputVehiculoOtro.required = esOtro;

  if (!esOtro) inputVehiculoOtro.value = "";
}

function cargarVehiculosEnFormulario(vehiculos) {
  if (!selectVehiculo) return;

  const lista = [...(vehiculos || [])].sort((a, b) =>
    `${a.marca || ""} ${a.modelo || ""}`.localeCompare(
      `${b.marca || ""} ${b.modelo || ""}`,
      "es",
    ),
  );

  selectVehiculo.innerHTML = "";

  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = lista.length
    ? "Selecciona un vehículo"
    : "No hay vehículos cargados";
  selectVehiculo.appendChild(inicial);

  lista.forEach((vehiculo) => {
    const opcion = document.createElement("option");
    const nombre =
      `${vehiculo.marca || ""} ${vehiculo.modelo || ""} ${vehiculo.anio || ""}`.trim();
    const estado = (vehiculo.status || "").toLowerCase();

    opcion.value = vehiculo.id;
    opcion.dataset.nombre = nombre;
    opcion.textContent =
      estado && estado !== "disponible"
        ? `${nombre} · ${estado}`
        : nombre;
    selectVehiculo.appendChild(opcion);
  });

  const otro = document.createElement("option");
  otro.value = "otro";
  otro.textContent = "Otro vehículo / asesoría";
  selectVehiculo.appendChild(otro);

  const idUrl = new URLSearchParams(window.location.search).get("vehiculo");

  if (idUrl && idUrl !== "undefined") {
    let opcionUrl = [...selectVehiculo.options].find(
      (opcion) => opcion.value === idUrl,
    );

    if (!opcionUrl) {
      opcionUrl = document.createElement("option");
      opcionUrl.value = idUrl;
      opcionUrl.textContent = "Vehículo seleccionado";
      selectVehiculo.appendChild(opcionUrl);
    }

    selectVehiculo.value = idUrl;
  } else if (lista.length === 0) {
    selectVehiculo.value = "otro";
  }

  actualizarVehiculoOtro();
}

function obtenerVehiculoSeleccionado() {
  if (!selectVehiculo) return { id: null, texto: "" };

  if (selectVehiculo.value === "otro") {
    return {
      id: null,
      texto: (inputVehiculoOtro?.value || "").trim(),
    };
  }

  if (!selectVehiculo.value) return { id: null, texto: "" };

  const opcion = selectVehiculo.selectedOptions[0];
  return {
    id: selectVehiculo.value,
    texto: opcion?.dataset.nombre || opcion?.textContent.trim() || "",
  };
}

function seleccionarHora(boton) {
  if (!contenedorHoras) return;

  contenedorHoras
    .querySelectorAll(".slot[aria-pressed='true']")
    .forEach((otro) => otro.setAttribute("aria-pressed", "false"));

  boton.setAttribute("aria-pressed", "true");
  if (inputHora) inputHora.value = boton.dataset.hora || "";
  limpiarEstadoCita();
}

async function cargarDisponibilidad(fecha) {
  if (!contenedorHoras) return;

  if (!fecha) {
    mostrarMensajeHoras("Elige una fecha para ver los horarios.");
    return;
  }

  if (esDomingo(fecha)) {
    mostrarMensajeHoras("No atendemos los domingos. Elige otro día.");
    return;
  }

  mostrarMensajeHoras("Cargando horarios...");

  try {
    const respuesta = await fetch(
      `/api/citas/disponibilidad?fecha=${encodeURIComponent(fecha)}`,
    );
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      mostrarMensajeHoras(
        datos.error || "No se pudieron cargar los horarios.",
      );
      return;
    }

    const ocupadas = new Set(datos.ocupadas || []);
    const disponibles = new Set(datos.disponibles || []);

    contenedorHoras.innerHTML = "";

    (datos.horas || []).forEach((hora) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "slot";
      boton.dataset.hora = hora;
      boton.textContent = hora;
      boton.setAttribute("aria-pressed", "false");

      if (ocupadas.has(hora)) {
        boton.disabled = true;
        boton.classList.add("slot-ocupado");
        boton.title = "Horario ocupado";
      } else if (!disponibles.has(hora)) {
        boton.disabled = true;
        boton.classList.add("slot-pasado");
        boton.title = "Horario no disponible";
      } else {
        boton.addEventListener("click", () => seleccionarHora(boton));
      }

      contenedorHoras.appendChild(boton);
    });

    if (!(datos.disponibles || []).length) {
      const aviso = document.createElement("p");
      aviso.className = "slots-msg";
      aviso.textContent =
        "No quedan horarios disponibles para este día. Prueba otra fecha.";
      contenedorHoras.appendChild(aviso);
    }
  } catch (error) {
    console.error("Error al cargar la disponibilidad:", error);
    mostrarMensajeHoras(
      "No se pudieron cargar los horarios. Intenta de nuevo.",
    );
  }
}

function validarFormularioCita() {
  const nombre = (inputNombre?.value || "").trim();
  const email = (inputEmail?.value || "").trim();
  const telefono = (inputTelefono?.value || "").trim();
  const fecha = (inputFecha?.value || "").trim();
  const hora = (inputHora?.value || "").trim();
  const mensaje = (inputMensaje?.value || "").trim();

  if (nombre.length < 2) {
    mostrarEstadoCita("Escribe tu nombre completo.", "error");
    inputNombre?.focus();
    return null;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    mostrarEstadoCita("Escribe un correo válido.", "error");
    inputEmail?.focus();
    return null;
  }

  if (!/^[+()\d\s.-]{7,30}$/.test(telefono)) {
    mostrarEstadoCita("Escribe un teléfono válido.", "error");
    inputTelefono?.focus();
    return null;
  }

  const vehiculo = obtenerVehiculoSeleccionado();

  if (!vehiculo.id && !vehiculo.texto) {
    mostrarEstadoCita(
      "Selecciona un vehículo o escribe cuál te interesa.",
      "error",
    );

    if (selectVehiculo?.value === "otro") {
      inputVehiculoOtro?.focus();
    } else {
      selectVehiculo?.focus();
    }

    return null;
  }

  if (!fecha) {
    mostrarEstadoCita("Elige la fecha de la cita.", "error");
    inputFecha?.focus();
    return null;
  }

  if (esDomingo(fecha)) {
    mostrarEstadoCita(
      "No atendemos los domingos. Elige otro día.",
      "error",
    );
    inputFecha?.focus();
    return null;
  }

  const hoy = hoyEnCaracas();
  if (fecha < hoy || fecha > sumarDias(hoy, MAX_DIAS_CITA)) {
    mostrarEstadoCita(
      `Elige una fecha entre hoy y ${MAX_DIAS_CITA} días.`,
      "error",
    );
    inputFecha?.focus();
    return null;
  }

  if (!hora) {
    mostrarEstadoCita(
      "Selecciona un horario disponible.",
      "error",
    );
    contenedorHoras?.querySelector(".slot:not(:disabled)")?.focus();
    return null;
  }

  return {
    nombre,
    email,
    telefono,
    fecha,
    hora,
    mensaje,
    vehiculo,
  };
}

async function manejarEnvioCita(evento) {
  evento.preventDefault();

  const datos = validarFormularioCita();
  if (!datos) return;

  if (btnAgendar) {
    btnAgendar.disabled = true;
    btnAgendar.textContent = "Enviando...";
  }

  const payload = {
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    fecha: datos.fecha,
    hora: datos.hora,
    mensaje: datos.mensaje,
  };

  if (datos.vehiculo.id) {
    payload.vehiculo_id = datos.vehiculo.id;
  } else {
    payload.vehiculo = datos.vehiculo.texto;
  }

  try {
    const respuesta = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resultado = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      mostrarEstadoCita(
        resultado.error ||
          "No se pudo registrar la cita. Intenta de nuevo.",
        "error",
      );

      if (respuesta.status === 409 && inputFecha?.value) {
        await cargarDisponibilidad(inputFecha.value);
      }

      return;
    }

    const avisoCorreo =
      resultado.correo?.cliente === false
        ? " No pudimos enviarte el correo de confirmación, pero la cita quedó registrada."
        : "";

    mostrarEstadoCita(
      `${resultado.mensaje || "Solicitud enviada. Te contactaremos para confirmar."}${avisoCorreo}`,
      "exito",
    );

    formCita?.reset();
    if (selectVehiculo) selectVehiculo.value = "";
    actualizarVehiculoOtro();
    mostrarMensajeHoras("Elige una fecha para ver los horarios.");
  } catch (error) {
    console.error("Error al registrar la cita:", error);
    mostrarEstadoCita(
      "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
      "error",
    );
  } finally {
    if (btnAgendar) {
      btnAgendar.disabled = false;
      btnAgendar.textContent = "Solicitar cita";
    }
  }
}

function enviarPorWhatsApp() {
  const nombre = (inputNombre?.value || "").trim();
  const vehiculo = obtenerVehiculoSeleccionado().texto;
  const fecha = (inputFecha?.value || "").trim();
  const hora = (inputHora?.value || "").trim();

  let texto = "Hola, quiero agendar una cita en Only Cars.";
  if (nombre) texto += ` Soy ${nombre}.`;
  if (vehiculo) texto += ` Me interesa el vehículo ${vehiculo}.`;
  if (fecha) texto += ` Fecha: ${fecha}.`;
  if (hora) texto += ` Hora: ${hora}.`;

  window.open(
    `https://wa.me/5491176456499?text=${encodeURIComponent(texto)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

async function prefillDatosUsuario() {
  // La cookie de sesión puede seguir viva aunque localStorage se haya borrado.
  // Por eso consultamos /me siempre; un 401 solo significa que es invitado.
  try {
    const respuesta = await fetch("/api/auth/me");
    if (!respuesta.ok) return;

    const datos = await respuesta.json();

    if (inputNombre && !inputNombre.value) {
      inputNombre.value = datos.name || "";
    }

    if (inputEmail && !inputEmail.value) {
      inputEmail.value = datos.email || "";
    }
  } catch (error) {
    // Es un visitante sin sesión: no hay nada que rellenar.
  }
}

function configurarEventosCita() {
  if (formCita) {
    formCita.addEventListener("submit", manejarEnvioCita);
  }

  if (inputFecha) {
    inputFecha.addEventListener("change", () => {
      limpiarEstadoCita();

      const fecha = inputFecha.value;
      if (!fecha) {
        mostrarMensajeHoras("Elige una fecha para ver los horarios.");
        return;
      }

      if (esDomingo(fecha)) {
        mostrarEstadoCita(
          "No atendemos los domingos. Elige otro día.",
          "error",
        );
        mostrarMensajeHoras("Elige otro día para ver los horarios.");
        return;
      }

      cargarDisponibilidad(fecha);
    });
  }

  if (selectVehiculo) {
    selectVehiculo.addEventListener("change", () => {
      actualizarVehiculoOtro();
      limpiarEstadoCita();
    });
  }

  if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", enviarPorWhatsApp);
  }

  [inputNombre, inputEmail, inputTelefono, inputMensaje].forEach((campo) => {
    campo?.addEventListener("input", limpiarEstadoCita);
  });
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

  // Preparar el formulario de citas
  configurarFechaCita();
  mostrarMensajeHoras("Elige una fecha para ver los horarios.");
  configurarEventosCita();
  prefillDatosUsuario();

  // Cargar los vehículos de la portada (ofertas, marcas y formulario)
  cargarDatosDeLaPortada();
});
