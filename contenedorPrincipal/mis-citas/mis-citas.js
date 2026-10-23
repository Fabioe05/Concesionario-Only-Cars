// ==========================================
// MIS CITAS - LÓGICA DE LA VISTA DEL CLIENTE
// ==========================================

const contenedorMisCitas = document.getElementById("mis-citas-contenido");
const WHATSAPP_CITAS = "https://wa.me/5491176456499";

const ESTADOS_CITA = {
  pendiente: { texto: "Pendiente", clase: "pendiente" },
  confirmada: { texto: "Confirmada", clase: "confirmada" },
  cancelada: { texto: "Cancelada", clase: "cancelada" },
  completada: { texto: "Completada", clase: "completada" },
};

const MESES_CITA = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// ==========================================
// UTILIDADES
// ==========================================

function escaparHtmlCita(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
    const mapa = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return mapa[caracter];
  });
}

function infoEstadoCita(estado) {
  return (
    ESTADOS_CITA[estado] || {
      texto: estado || "Sin estado",
      clase: "pendiente",
    }
  );
}

/**
 * Devuelve las partes visibles de una fecha YYYY-MM-DD sin desplazarla
 * por la zona horaria del navegador.
 */
function obtenerPartesFechaCita(fecha) {
  const coincidencia = String(fecha || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!coincidencia) return null;

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;

  const fechaObjeto = new Date(Date.UTC(anio, mes - 1, dia, 12));

  if (
    Number.isNaN(fechaObjeto.getTime()) ||
    fechaObjeto.getUTCFullYear() !== anio ||
    fechaObjeto.getUTCMonth() !== mes - 1 ||
    fechaObjeto.getUTCDate() !== dia
  ) {
    return null;
  }

  return {
    dia: coincidencia[3],
    mes: MESES_CITA[mes - 1],
    anio: coincidencia[1],
    fechaObjeto,
  };
}

function formatearFechaLargaCita(fecha) {
  const partes = obtenerPartesFechaCita(fecha);
  if (!partes) return "Fecha por confirmar";

  const texto = new Intl.DateTimeFormat("es-VE", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(partes.fechaObjeto);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearSolicitudCita(createdAt) {
  if (!createdAt) return "";

  const fecha = new Date(createdAt);
  if (Number.isNaN(fecha.getTime())) return "";

  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function compararCitas(a, b) {
  const fechaA = `${a.fecha || ""} ${a.hora || ""}`;
  const fechaB = `${b.fecha || ""} ${b.hora || ""}`;
  return fechaA.localeCompare(fechaB);
}

function construirEnlaceWhatsAppCita(cita) {
  const fecha = formatearFechaLargaCita(cita.fecha);
  const referenciaFecha =
    fecha === "Fecha por confirmar"
      ? "en fecha por confirmar"
      : `del ${fecha.charAt(0).toLowerCase()}${fecha.slice(1)}`;
  const referenciaHora = cita.hora
    ? `a las ${cita.hora}`
    : "en el horario por confirmar";
  const vehiculo = String(
    cita.vehiculo || "vehículo por confirmar",
  ).trim();
  const texto = `Hola, quiero consultar sobre mi cita ${referenciaFecha} ${referenciaHora}. Vehículo: ${vehiculo}.`;

  return `${WHATSAPP_CITAS}?text=${encodeURIComponent(texto)}`;
}

// ==========================================
// RENDERIZADO
// ==========================================

function renderizarCita(cita) {
  const estado = infoEstadoCita(cita.estado);
  const partes = obtenerPartesFechaCita(cita.fecha);
  const dia = partes ? partes.dia : "—";
  const mes = partes ? partes.mes : "fecha";
  const anio = partes ? partes.anio : "";
  const fechaLarga = formatearFechaLargaCita(cita.fecha);
  const hora = cita.hora || "Hora por confirmar";
  const vehiculo = String(cita.vehiculo || "Vehículo no indicado").trim();
  const mensaje = String(cita.mensaje || "").trim();
  const solicitada = formatearSolicitudCita(cita.createdAt);
  const enlaceWhatsApp = construirEnlaceWhatsAppCita(cita);
  const fechaPie = cita.hora ? `${fechaLarga} · ${cita.hora}` : fechaLarga;
  const tituloFecha = cita.hora
    ? `${fechaLarga} a las ${cita.hora}`
    : fechaLarga;

  return `
    <article class="cita-card cita-card--${estado.clase}">
      <div class="cita-card-header">
        <span class="cita-estado cita-estado--${estado.clase}">
          ${escaparHtmlCita(estado.texto)}
        </span>
        ${
          solicitada
            ? `<span class="cita-solicitada">Solicitada el ${escaparHtmlCita(solicitada)}</span>`
            : ""
        }
      </div>

      <div class="cita-card-cuerpo">
        <div class="cita-fecha-caja" title="${escaparHtmlCita(tituloFecha)}">
          <span class="cita-dia">${escaparHtmlCita(dia)}</span>
          <div class="cita-fecha-texto">
            <span class="cita-mes">${escaparHtmlCita(`${mes} ${anio}`.trim())}</span>
            <span class="cita-hora">${escaparHtmlCita(hora)}</span>
          </div>
        </div>

        <div class="cita-datos">
          <div class="cita-dato">
            <span class="cita-dato-etiqueta">Vehículo</span>
            <span class="cita-dato-valor">${escaparHtmlCita(vehiculo)}</span>
          </div>
          ${
            mensaje
              ? `<div class="cita-dato">
                  <span class="cita-dato-etiqueta">Tu mensaje</span>
                  <p class="cita-mensaje">${escaparHtmlCita(mensaje)}</p>
                </div>`
              : ""
          }
        </div>
      </div>

      <div class="cita-card-footer">
        <span class="cita-fecha-larga">${escaparHtmlCita(fechaPie)}</span>
        <a class="btn-outline cita-wa" href="${escaparHtmlCita(enlaceWhatsApp)}" target="_blank"
          rel="noopener">Consultar por WhatsApp</a>
      </div>
    </article>
  `;
}

function renderizarGrupo(titulo, citas) {
  return `
    <section class="citas-grupo">
      <div class="citas-grupo-header">
        <h2 class="citas-grupo-titulo">${escaparHtmlCita(titulo)}</h2>
        <span class="citas-grupo-cuenta">${citas.length}</span>
      </div>
      <div class="citas-grid">
        ${citas.map(renderizarCita).join("")}
      </div>
    </section>
  `;
}

function renderizarCitas(citas) {
  if (!contenedorMisCitas) return;

  if (!citas.length) {
    renderizarVacio();
    return;
  }

  const activas = citas
    .filter((cita) => ["pendiente", "confirmada"].includes(cita.estado))
    .sort(compararCitas);

  const historial = citas
    .filter((cita) => !["pendiente", "confirmada"].includes(cita.estado))
    .sort(compararCitas)
    .reverse();

  const bloques = [];

  if (activas.length) {
    bloques.push(renderizarGrupo("Citas activas", activas));
  }

  if (historial.length) {
    bloques.push(renderizarGrupo("Historial", historial));
  }

  contenedorMisCitas.innerHTML = bloques.join("");
}

function renderizarVacio() {
  if (!contenedorMisCitas) return;

  contenedorMisCitas.innerHTML = `
    <div class="mis-citas-estado">
      <span class="mis-citas-estado-etiqueta">Sin citas</span>
      <h2>Todavía no tienes citas</h2>
      <p>Cuando solicites una cita, aparecerá aquí con su estado y los datos del vehículo.</p>
      <div class="mis-citas-estado-acciones">
        <a class="btn-primary" href="../../index.html#contacto">Agendar una cita</a>
      </div>
    </div>
  `;
}

function renderizarLogin() {
  if (!contenedorMisCitas) return;

  contenedorMisCitas.innerHTML = `
    <div class="mis-citas-estado">
      <span class="mis-citas-estado-etiqueta">Sesión requerida</span>
      <h2>Inicia sesión para ver tus citas</h2>
      <p>Aquí podrás revisar el estado de tus solicitudes y los datos de cada cita.</p>
      <div class="mis-citas-estado-acciones">
        <a class="btn-primary"
          href="../login/login.html?redirect=/contenedorPrincipal/mis-citas/mis-citas.html">Iniciar sesión</a>
        <a class="btn-outline" href="../registro/registro.html">Crear cuenta</a>
      </div>
    </div>
  `;
}

function renderizarError() {
  if (!contenedorMisCitas) return;

  contenedorMisCitas.innerHTML = `
    <div class="mis-citas-estado">
      <span class="mis-citas-estado-etiqueta">Error de conexión</span>
      <h2>No pudimos cargar tus citas</h2>
      <p>Revisa tu conexión e inténtalo de nuevo.</p>
      <div class="mis-citas-estado-acciones">
        <button type="button" id="btn-reintentar-citas" class="btn-primary">Reintentar</button>
      </div>
    </div>
  `;

  document
    .getElementById("btn-reintentar-citas")
    ?.addEventListener("click", cargarMisCitas);
}

// ==========================================
// CARGA DE DATOS
// ==========================================

async function cargarMisCitas() {
  if (!contenedorMisCitas) return;

  contenedorMisCitas.setAttribute("aria-busy", "true");
  contenedorMisCitas.innerHTML = `
    <p class="msg-vacio">Cargando tus citas...</p>
  `;

  try {
    const respuesta = await fetch("/api/citas/mias", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
      renderizarLogin();
      return;
    }

    if (!respuesta.ok) {
      throw new Error(`No se pudieron cargar las citas (${respuesta.status})`);
    }

    const datos = await respuesta.json();
    renderizarCitas(Array.isArray(datos) ? datos : []);
  } catch (error) {
    console.error("Error al cargar las citas del cliente:", error);
    renderizarError();
  } finally {
    contenedorMisCitas.removeAttribute("aria-busy");
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  cargarMisCitas();
});
