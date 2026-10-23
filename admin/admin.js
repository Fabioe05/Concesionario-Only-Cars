// Secciones de vista
const seccionLista = document.getElementById("seccion-lista");
const seccionFormulario = document.getElementById("seccion-formulario");
const seccionMarcas = document.getElementById("seccion-marcas");
const seccionCitas = document.getElementById("seccion-citas");
const cuerpoTablaVehiculos = document.getElementById("tabla-vehiculos-body");
// Filtros de inventario
const filtroMarca = document.getElementById("filtro-marca");
const filtroNombre = document.getElementById("filtro-nombre");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");
// Botones de navegación entre vistas
const btnCrearNuevo = document.getElementById("btn-crear-nuevo");
const btnVolverLista = document.getElementById("btn-volver-lista");
const tituloFormulario = document.getElementById("form-titulo");
const btnVolverInicio = document.getElementById("btn-volver-inicio");
// Gestión de marcas (vista aparte)
const btnGestionarMarcas = document.getElementById("btn-gestionar-marcas");
const btnVolverListaMarcas = document.getElementById("btn-volver-lista-marcas");
const btnAgregarMarca = document.getElementById("btn-agregar-marca");
const inputNuevaMarca = document.getElementById("nueva-marca");
const cuerpoMarcasCon = document.getElementById("tabla-marcas-con-body");
const cuerpoMarcasSin = document.getElementById("tabla-marcas-sin-body");
const cuentaMarcasCon = document.getElementById("cuenta-con-marcas");
const cuentaMarcasSin = document.getElementById("cuenta-sin-marcas");
// Gestión de citas (vista aparte)
const btnGestionarCitas = document.getElementById("btn-gestionar-citas");
const btnVolverListaCitas = document.getElementById("btn-volver-lista-citas");
const cuerpoTablaCitas = document.getElementById("tabla-citas-body");
const filtroCitaEstado = document.getElementById("filtro-cita-estado");
const filtroCitaFecha = document.getElementById("filtro-cita-fecha");
const btnActualizarCitas = document.getElementById("btn-actualizar-citas");
const btnLimpiarFiltrosCitas = document.getElementById("btn-limpiar-filtros-citas");
// Formulario y campos
const formularioVehiculo = document.getElementById("form-vehiculo");
const inputVehiculoId = document.getElementById("vehiculo-id");
const inputMarca = document.getElementById("marca");
const inputModelo = document.getElementById("modelo");
const inputAño = document.getElementById("año");
const inputKilometraje = document.getElementById("kilometraje");
const inputMotor = document.getElementById("motor");
const inputPrecio = document.getElementById("precio");
const inputTransmision = document.getElementById("transmision");
const inputPropietarios = document.getElementById("owners");
const inputEstatus = document.getElementById("status");
const inputDescripcion = document.getElementById("description");
// Modal de detalles
const modalDetalleVehiculo = document.getElementById("modal-detalle-vehiculo");
const modalDetalleTitulo = document.getElementById("modal-detalle-titulo");
const modalDetalleSubtitulo = document.getElementById(
  "modal-detalle-subtitulo",
);
const modalDetalleContenido = document.getElementById(
  "modal-detalle-contenido",
);
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnModalEditar = document.getElementById("btn-modal-editar");
const btnModalEliminar = document.getElementById("btn-modal-eliminar");
const btnModalCerrar = document.getElementById("btn-modal-cerrar");
// Manejo de imágenes
const inputImagenes = document.getElementById("images");
const btnLimpiarImagenes = document.getElementById("btn-limpiar-imagenes");
const infoImagenes = document.getElementById("upload-info");
const divVistaPrevia = document.getElementById("vista-previa");
// Botones de acción del formulario
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
// Modal de gestión de citas
const modalCita = document.getElementById("modal-cita");
const modalCitaTitulo = document.getElementById("modal-cita-titulo");
const modalCitaSubtitulo = document.getElementById("modal-cita-subtitulo");
const btnCerrarModalCita = document.getElementById("btn-cerrar-modal-cita");
const btnCerrarModalCitaPie = document.getElementById("btn-cerrar-modal-cita-pie");
const citaDetalleNombre = document.getElementById("cita-detalle-nombre");
const citaDetalleEmail = document.getElementById("cita-detalle-email");
const citaDetalleTelefono = document.getElementById("cita-detalle-telefono");
const citaDetalleVehiculo = document.getElementById("cita-detalle-vehiculo");
const citaDetalleFecha = document.getElementById("cita-detalle-fecha");
const citaDetalleEstado = document.getElementById("cita-detalle-estado");
const citaDetalleMensaje = document.getElementById("cita-detalle-mensaje");
const citaGestionEstado = document.getElementById("cita-gestion-estado");
const citaGestionFecha = document.getElementById("cita-gestion-fecha");
const citaGestionHora = document.getElementById("cita-gestion-hora");
const citaGestionNotas = document.getElementById("cita-gestion-notas");
const citaGestionMensaje = document.getElementById("cita-gestion-mensaje");
const btnCitaConfirmar = document.getElementById("btn-cita-confirmar");
const btnCitaCancelar = document.getElementById("btn-cita-cancelar");
const btnCitaGuardar = document.getElementById("btn-cita-guardar");

let todosLosVehiculos = [];
let vehiculoActualDetalle = null;
let archivosNuevos = [];
let imagenesExistentes = [];
let modoFormulario = "POST";
const MAX_IMAGENES = 10;
const HORAS_CITA = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];
const ESTADOS_CITA = {
  pendiente: { texto: "Pendiente", clase: "pendiente" },
  confirmada: { texto: "Confirmada", clase: "confirmada" },
  cancelada: { texto: "Cancelada", clase: "cancelada" },
  completada: { texto: "Completada", clase: "completada" },
};
let todasLasCitas = [];
let citaActual = null;

// UTILIDADES (formato y normalización de datos)
/** Precio con separador de miles. */
function formatearPrecio(valor) {
  return Number(valor || 0).toLocaleString("en-US");
}

/** Kilometraje con separador de miles. */
function formatearKilometraje(valor) {
  return Number(valor !== undefined ? valor : 0).toLocaleString("en-US");
}

/** Estatus del vehículo: texto original y clase CSS del badge. */
function normalizarStatus(valor) {
  const texto = (valor || "disponible").toString().toLowerCase();
  if (texto.includes("vend")) return { texto, clase: "vendido" };
  if (texto.includes("reser")) return { texto, clase: "reservado" };
  return { texto, clase: "disponible" };
}

/** Transmisión en texto legible. */
function formatearTransmision(valor) {
  return (valor || "automatica").toString().toLowerCase().includes("auto")
    ? "Automática"
    : "Manual";
}

/** Escapa texto que viene de la base antes de insertarlo con innerHTML. */
function escaparHtml(valor) {
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

/** Convierte YYYY-MM-DD en DD/MM/YYYY sin tocar la zona horaria. */
function formatearFechaCita(fecha) {
  const partes = String(fecha || "").split("-");
  if (partes.length !== 3) return fecha || "N/A";
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function infoEstadoCita(estado) {
  return (
    ESTADOS_CITA[estado] || {
      texto: estado || "Sin estado",
      clase: "pendiente",
    }
  );
}

function hoyEnCaracasAdmin() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function sumarDiasAdmin(fecha, dias) {
  const fechaBase = new Date(`${fecha}T12:00:00Z`);
  fechaBase.setUTCDate(fechaBase.getUTCDate() + dias);
  return fechaBase.toISOString().slice(0, 10);
}

// CAMBIO DE VISTAS (LISTA <-> FORMULARIO <-> MARCAS <-> CITAS)
/**
 * Muestra una vista del panel y oculta las demás.
 */
function mostrarSeccion(seccionActiva) {
  [seccionLista, seccionFormulario, seccionMarcas, seccionCitas].forEach(
    (seccion) => {
      if (seccion) {
        seccion.style.display = seccion === seccionActiva ? "block" : "none";
      }
    },
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarSeccionLista() {
  mostrarSeccion(seccionLista);
}

function mostrarSeccionFormulario() {
  mostrarSeccion(seccionFormulario);
}

function mostrarSeccionMarcas() {
  mostrarSeccion(seccionMarcas);
}

function mostrarSeccionCitas() {
  mostrarSeccion(seccionCitas);
}

// CARGA, FILTRADO Y RENDERIZADO DEL INVENTARIO
async function cargarVehiculos() {
  if (!cuerpoTablaVehiculos) return;

  try {
    cuerpoTablaVehiculos.innerHTML = `
      <tr>
        <td colspan="10" class="tabla-mensaje">
          Cargando inventario de vehículos...
        </td>
      </tr>
    `;

    const res = await fetch("/api/vehiculos");
    if (!res.ok) throw new Error("Error al obtener la lista de vehículos");
    const vehiculos = await res.json();

    todosLosVehiculos = Array.isArray(vehiculos) ? vehiculos : [];
    await poblarFiltroMarcas(todosLosVehiculos);
    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    cuerpoTablaVehiculos.innerHTML = `
      <tr>
        <td colspan="10" class="tabla-mensaje tabla-mensaje--error">
          Error de conexión al cargar los vehículos. Por favor, recarga la página.
        </td>
      </tr>
    `;
  }
}

async function poblarFiltroMarcas(vehiculos = []) {
  if (!filtroMarca) return;

  const valorActual = filtroMarca.value;

  try {
    let marcasList = [];
    try {
      const res = await fetch("/api/marcas");
      if (res.ok) {
        const marcasData = await res.json();
        marcasList = marcasData
          .map((m) => m.name)
          .filter(Boolean);
      }
    } catch (e) {
      console.warn("No se pudieron cargar marcas desde API para el filtro:", e);
    }

    vehiculos.forEach((v) => {
      if (
        v.marca &&
        !marcasList.some((m) => m.toLowerCase() === v.marca.toLowerCase())
      ) {
        marcasList.push(v.marca);
      }
    });

    marcasList.sort((a, b) => a.localeCompare(b));

    filtroMarca.innerHTML = '<option value="">Todas las marcas</option>';
    marcasList.forEach((marca) => {
      const option = document.createElement("option");
      option.value = marca;
      option.textContent = marca;
      if (valorActual && valorActual.toLowerCase() === marca.toLowerCase()) {
        option.selected = true;
      }
      filtroMarca.appendChild(option);
    });
  } catch (err) {
    console.error("Error al poblar selector de filtro de marcas:", err);
  }
}

function aplicarFiltros() {
  const marcaFiltro = (filtroMarca ? filtroMarca.value : "")
    .trim()
    .toLowerCase();
  const textoFiltro = (filtroNombre ? filtroNombre.value : "")
    .trim()
    .toLowerCase();

  const vehiculosFiltrados = todosLosVehiculos.filter((vehiculo) => {
    // 1. Filtro por marca
    if (marcaFiltro) {
      const marcaVehiculo = (vehiculo.marca || "").trim().toLowerCase();
      if (marcaVehiculo !== marcaFiltro) {
        return false;
      }
    }

    // 2. Filtro por texto (modelo, marca, descripción, motor, año)
    if (textoFiltro) {
      const marca = (vehiculo.marca || "").toLowerCase();
      const modelo = (vehiculo.modelo || "").toLowerCase();
      const descripcion = (vehiculo.description || "").toLowerCase();
      const año = (vehiculo.anio || "")
        .toString()
        .toLowerCase();
      const motor = (vehiculo.motor || "").toLowerCase();
      const combinacion = `${marca} ${modelo} ${año} ${motor} ${descripcion}`;

      if (!combinacion.includes(textoFiltro)) {
        return false;
      }
    }

    return true;
  });

  renderizarTablaVehiculos(vehiculosFiltrados);
}

function resetearFiltros() {
  if (filtroMarca) filtroMarca.value = "";
  if (filtroNombre) filtroNombre.value = "";
  aplicarFiltros();
}

function renderizarTablaVehiculos(vehiculos) {
  if (!cuerpoTablaVehiculos) return;

  if (todosLosVehiculos.length === 0) {
    cuerpoTablaVehiculos.innerHTML = `
      <tr>
        <td colspan="10" class="tabla-mensaje tabla-mensaje--catalogo">
          <p class="tabla-mensaje__titulo">No hay vehículos registrados en el catálogo actualmente.</p>
          <button type="button" class="btn-nuevo-vehiculo">
            Crear el primer vehículo
          </button>
        </td>
      </tr>
    `;
    cuerpoTablaVehiculos
      .querySelector(".btn-nuevo-vehiculo")
      .addEventListener("click", abrirFormularioCrear);
    return;
  }

  if (vehiculos.length === 0) {
    cuerpoTablaVehiculos.innerHTML = `
      <tr>
        <td colspan="10" class="tabla-mensaje tabla-mensaje--filtros">
          <p class="tabla-mensaje__titulo">No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
          <button type="button" class="btn-limpiar-filtros">
            Limpiar filtros de búsqueda
          </button>
        </td>
      </tr>
    `;
    cuerpoTablaVehiculos
      .querySelector(".btn-limpiar-filtros")
      .addEventListener("click", resetearFiltros);
    return;
  }

  cuerpoTablaVehiculos.innerHTML = "";

  vehiculos.forEach((vehiculo) => {
    const fila = document.createElement("tr");

    // ID normalizado
    const vehiculoId = vehiculo.id;

    // Imágenes
    const imagenes = vehiculo.images || [];
    const imagenHTML =
      imagenes.length > 0
        ? `<img src="${imagenes[0]}" alt="${vehiculo.modelo}" class="vehiculo-img-thumb" />`
        : `<div class="vehiculo-no-img">Sin foto</div>`;

    // Datos formateados y normalizados
    const precioFormateado = formatearPrecio(vehiculo.precio);
    const kmFormateado = formatearKilometraje(vehiculo.kilometraje);
    const { texto: rawStatus, clase: statusClass } = normalizarStatus(
      vehiculo.status,
    );
    const transmisionTexto = formatearTransmision(vehiculo.transmision);

    fila.innerHTML = `
      <td class="td-img" data-label="Foto">${imagenHTML}</td>
      <td data-label="Marca"><strong>${vehiculo.marca || "N/A"}</strong></td>
      <td data-label="Modelo">${vehiculo.modelo || "N/A"}</td>
      <td data-label="Año">${vehiculo.anio || "N/A"}</td>
      <td data-label="Kilometraje">${kmFormateado} km</td>
      <td data-label="Motor">${vehiculo.motor || "N/A"}</td>
      <td data-label="Precio"><strong class="celda-precio">$${precioFormateado}</strong></td>
      <td data-label="Transmisión">${transmisionTexto}</td>
      <td data-label="Estatus"><span class="status-badge ${statusClass}">${rawStatus}</span></td>
      <td class="td-acciones">
        <div class="actions-cell">
          <button type="button" class="btn-action btn-view" title="Ver detalles de este vehículo">
            Ver
          </button>
          <button type="button" class="btn-action btn-edit" title="Editar este vehículo">
            Editar
          </button>
          <button type="button" class="btn-action btn-delete" title="Eliminar este vehículo">
            Eliminar
          </button>
        </div>
      </td>
    `;

    // Si la foto de la miniatura no carga, se deja el recuadro "Sin foto"
    const imgMiniatura = fila.querySelector(".vehiculo-img-thumb");
    if (imgMiniatura) {
      imgMiniatura.addEventListener("error", () => {
        imgMiniatura.outerHTML = '<div class="vehiculo-no-img">Sin foto</div>';
      });
    }

    // Event listener para Ver
    const btnView = fila.querySelector(".btn-view");
    btnView.addEventListener("click", () => {
      abrirModalDetalle(vehiculo);
    });

    // Event listener para Editar
    const btnEdit = fila.querySelector(".btn-edit");
    btnEdit.addEventListener("click", () => {
      abrirFormularioEditar(vehiculo);
    });

    // Event listener para Eliminar
    const btnDelete = fila.querySelector(".btn-delete");
    btnDelete.addEventListener("click", () => {
      confirmarYEliminarVehiculo(vehiculo);
    });

    cuerpoTablaVehiculos.appendChild(fila);
  });
}

// ==========================================
// 5. CARGA DINÁMICA DE MARCAS DESDE LA BD
// ==========================================
async function cargarMarcas(marcaSeleccionada = "") {
  try {
    const res = await fetch("/api/marcas");
    if (!res.ok) throw new Error("No se pudo cargar la lista de marcas");
    const marcas = await res.json();

    inputMarca.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione una marca...";
    inputMarca.appendChild(defaultOption);

    marcas.forEach((m) => {
      const option = document.createElement("option");
      option.value = m.name;
      option.dataset.id = m.id;
      option.textContent = m.name;
      if (
        marcaSeleccionada &&
        (m.name.toLowerCase() === marcaSeleccionada.toString().toLowerCase() ||
          (m.id && m.id.toString() === marcaSeleccionada.toString()))
      ) {
        option.selected = true;
      }
      inputMarca.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar marcas:", error);
    inputMarca.innerHTML = `<option value="">Seleccione una marca...</option>`;
  }
}

// ==========================================
// GESTIÓN DE MARCAS (CREAR / ELIMINAR)
// ==========================================
/**
 * Refresca los tres sitios donde se usan las marcas:
 * la tabla de gestión, el desplegable del formulario y el filtro del inventario.
 */
async function refrescarMarcas() {
  await Promise.all([
    cargarTablaMarcas(),
    cargarMarcas(inputMarca ? inputMarca.value : ""),
    poblarFiltroMarcas(todosLosVehiculos),
  ]);
}

/**
 * Pinta las dos listas de marcas: las que tienen vehículos y las que no.
 */
async function cargarTablaMarcas() {
  // Los dos grupos de la vista, con lo que necesita cada uno.
  const grupos = [
    {
      cuerpo: cuerpoMarcasCon,
      cuenta: cuentaMarcasCon,
      columnas: 3,
      conConteo: true,
      vacio: "Ninguna marca tiene vehículos todavía.",
    },
    {
      cuerpo: cuerpoMarcasSin,
      cuenta: cuentaMarcasSin,
      columnas: 2,
      conConteo: false,
      vacio: "Todas las marcas tienen vehículos.",
    },
  ];

  if (grupos.some((grupo) => !grupo.cuerpo)) return;

  /** Deja un grupo con su lista (o con el aviso de que no hay marcas en él). */
  const pintarGrupo = (grupo, lista) => {
    if (lista.length === 0) {
      grupo.cuerpo.innerHTML = `
        <tr>
          <td colspan="${grupo.columnas}" class="tabla-mensaje tabla-mensaje--vacio">
            ${grupo.vacio}
          </td>
        </tr>
      `;
    } else {
      grupo.cuerpo.innerHTML = "";
      lista.forEach((marca) => {
        grupo.cuerpo.appendChild(crearFilaMarca(marca, grupo.conConteo));
      });
    }

    if (grupo.cuenta) grupo.cuenta.textContent = lista.length;
  };

  /** Pone el mismo mensaje en los dos grupos (cargando, error...). */
  const mostrarMensaje = (texto, esError = false) => {
    const clase = esError ? "tabla-mensaje tabla-mensaje--error" : "tabla-mensaje";
    grupos.forEach((grupo) => {
      grupo.cuerpo.innerHTML = `
        <tr>
          <td colspan="${grupo.columnas}" class="${clase}">
            ${texto}
          </td>
        </tr>
      `;
    });
  };

  try {
    mostrarMensaje("Cargando marcas...");

    const res = await fetch("/api/marcas");
    if (!res.ok) throw new Error("No se pudieron cargar las marcas");
    const data = await res.json();

    // Cuento los vehículos de cada marca; dentro de cada grupo va por nombre.
    const marcas = (Array.isArray(data) ? data : [])
      .map((marca) => ({
        ...marca,
        enUso: todosLosVehiculos.filter(
          (vehiculo) => String(vehiculo.marca_id) === String(marca.id),
        ).length,
      }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (marcas.length === 0) {
      mostrarMensaje("No hay marcas registradas.");
      if (cuentaMarcasCon) cuentaMarcasCon.textContent = "0";
      if (cuentaMarcasSin) cuentaMarcasSin.textContent = "0";
      return;
    }

    pintarGrupo(grupos[0], marcas.filter((marca) => marca.enUso > 0));
    pintarGrupo(grupos[1], marcas.filter((marca) => marca.enUso === 0));
  } catch (error) {
    console.error("Error al cargar la tabla de marcas:", error);
    mostrarMensaje("Error de conexión al cargar las marcas. Recarga la página.", true);
  }
}

/**
 * Crea la fila de una marca en la lista de gestión.
 * `conConteo` añade la columna con los vehículos que la usan.
 */
function crearFilaMarca(marca, conConteo) {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td data-label="Marca"><strong>${marca.name}</strong></td>
    ${conConteo ? `<td data-label="Vehículos">${marca.enUso}</td>` : ""}
    <td class="td-acciones">
      <div class="actions-cell">
        <button type="button" class="btn-action btn-delete"
          title="${marca.enUso > 0 ? "Tiene vehículos asociados" : "Eliminar esta marca"}">
          Eliminar
        </button>
      </div>
    </td>
  `;

  fila
    .querySelector(".btn-delete")
    .addEventListener("click", () => eliminarMarca(marca, marca.enUso));

  return fila;
}

/**
 * Crea una marca con el nombre escrito en el campo.
 */
async function agregarMarca() {
  const nombre = (inputNuevaMarca ? inputNuevaMarca.value : "").trim();

  if (!nombre) {
    alert("Escribe el nombre de la marca.");
    if (inputNuevaMarca) inputNuevaMarca.focus();
    return;
  }

  try {
    const res = await fetch("/api/marcas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nombre }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(
        data.error ||
          data.mensaje ||
          `No se pudo crear la marca (${res.status}).`,
      );
      return;
    }

    if (inputNuevaMarca) inputNuevaMarca.value = "";
    await refrescarMarcas();
  } catch (error) {
    console.error("Error al crear la marca:", error);
    alert("Hubo un error de conexión al crear la marca.");
  }
}

/**
 * Elimina una marca, avisando antes si tiene vehículos asociados.
 */
async function eliminarMarca(marca, vehiculosEnUso) {
  if (vehiculosEnUso > 0) {
    alert(
      `No se puede eliminar "${marca.name}": ${vehiculosEnUso} vehículo(s) la usan.`,
    );
    return;
  }

  if (
    !confirm(
      `¿Eliminar la marca "${marca.name}"? Esta acción no se puede deshacer.`,
    )
  ) {
    return;
  }

  try {
    const res = await fetch(`/api/marcas/${marca.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(
        data.error ||
          data.mensaje ||
          `No se pudo eliminar la marca (${res.status}).`,
      );
      return;
    }

    await refrescarMarcas();
  } catch (error) {
    console.error("Error al eliminar la marca:", error);
    alert("Hubo un error de conexión al eliminar la marca.");
  }
}

// ==========================================
// 6. GESTIÓN Y PREVISUALIZACIÓN DE IMÁGENES
// ==========================================
function actualizarVistaPrevia() {
  divVistaPrevia.innerHTML = "";

  // 1. Mostrar imágenes existentes de la BD
  imagenesExistentes.forEach((url, index) => {
    const card = document.createElement("div");
    card.className = "preview-card existente";
    card.title = "Imagen actual en el servidor";

    const img = document.createElement("img");
    img.src = url;
    img.alt = `Imagen guardada ${index + 1}`;

    const btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.className = "btn-quitar-imagen";
    btnQuitar.innerHTML = "&times;";
    btnQuitar.title = "Eliminar esta imagen";
    btnQuitar.addEventListener("click", () => {
      imagenesExistentes.splice(index, 1);
      actualizarVistaPrevia();
    });

    card.appendChild(img);
    card.appendChild(btnQuitar);
    divVistaPrevia.appendChild(card);
  });

  // 2. Mostrar imágenes nuevas cargadas desde el input file
  archivosNuevos.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "preview-card";
    card.title = `Nueva: ${file.name}`;

    const img = document.createElement("img");
    if (!file._previewUrl) {
      file._previewUrl = URL.createObjectURL(file);
    }
    img.src = file._previewUrl;
    img.alt = file.name;

    const btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.className = "btn-quitar-imagen";
    btnQuitar.innerHTML = "&times;";
    btnQuitar.title = "Quitar esta imagen";
    btnQuitar.addEventListener("click", () => {
      const f = archivosNuevos[index];
      if (f && f._previewUrl) {
        URL.revokeObjectURL(f._previewUrl);
      }
      archivosNuevos.splice(index, 1);
      sincronizarArchivos();
      actualizarVistaPrevia();
    });

    card.appendChild(img);
    card.appendChild(btnQuitar);
    divVistaPrevia.appendChild(card);
  });

  // 3. Contador de imágenes (existentes + nuevas)
  const total = imagenesExistentes.length + archivosNuevos.length;
  if (infoImagenes) {
    infoImagenes.textContent =
      total === 0
        ? "Hasta 10 imágenes · 5 MB cada una"
        : `${total} de ${MAX_IMAGENES} imágenes seleccionadas`;
  }
}

function sincronizarArchivos() {
  const dataTransfer = new DataTransfer();
  archivosNuevos.forEach((file) => dataTransfer.items.add(file));
  if (inputImagenes) {
    inputImagenes.files = dataTransfer.files;
  }
}

function limpiarImagenes() {
  archivosNuevos.forEach((file) => {
    if (file && file._previewUrl) {
      URL.revokeObjectURL(file._previewUrl);
    }
  });
  archivosNuevos = [];
  imagenesExistentes = [];
  if (inputImagenes) {
    inputImagenes.value = "";
  }
  actualizarVistaPrevia();
}

// ==========================================
// 7. ABRIR FORMULARIO PARA CREAR
// ==========================================
function abrirFormularioCrear() {
  modoFormulario = "POST";
  limpiarFormulario();
  if (tituloFormulario) tituloFormulario.textContent = "Registrar Nuevo Vehículo";
  if (btnGuardar) btnGuardar.textContent = "Guardar Vehículo";
  mostrarSeccionFormulario();
}

// ==========================================
// 8. ABRIR FORMULARIO PARA EDITAR
// ==========================================
async function abrirFormularioEditar(vehiculo) {
  if (!vehiculo) return;

  modoFormulario = "PUT";
  limpiarImagenes();

  const vehiculoId = vehiculo.id;
  if (inputVehiculoId) inputVehiculoId.value = vehiculoId;

  const nombreVehiculo =
    `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim();
  if (tituloFormulario) {
    tituloFormulario.textContent = `Editar Vehículo: ${nombreVehiculo || vehiculoId}`;
  }
  if (btnGuardar) {
    btnGuardar.textContent = "Actualizar Vehículo";
  }

  // Rellenar campos del formulario
  if (inputModelo) inputModelo.value = vehiculo.modelo || "";
  if (inputAño) inputAño.value = vehiculo.anio || "";
  if (inputKilometraje) {
    inputKilometraje.value =
      vehiculo.kilometraje !== undefined ? vehiculo.kilometraje : 0;
  }
  if (inputMotor) inputMotor.value = vehiculo.motor || "";
  if (inputPrecio) inputPrecio.value = vehiculo.precio || "";

  // Normalizar Transmisión
  if (inputTransmision && vehiculo.transmision) {
    const trans = vehiculo.transmision.toLowerCase();
    inputTransmision.value = trans.includes("auto") ? "automatica" : "manual";
  }

  // Normalizar Dueños
  if (inputPropietarios) {
    inputPropietarios.value = vehiculo.owners || 1;
  }

  // Normalizar Estatus
  if (inputEstatus && vehiculo.status) {
    inputEstatus.value = vehiculo.status.toLowerCase();
  }

  // Normalizar Descripción
  if (inputDescripcion) {
    inputDescripcion.value = vehiculo.description || "";
  }

  // Cargar lista de marcas seleccionando la marca del vehículo
  const marcaValor = vehiculo.marca;
  await cargarMarcas(marcaValor);

  // Cargar imágenes existentes
  imagenesExistentes = Array.isArray(vehiculo.images)
    ? [...vehiculo.images]
    : [];
  archivosNuevos = [];
  if (inputImagenes) inputImagenes.value = "";
  actualizarVistaPrevia();

  mostrarSeccionFormulario();
}

// ==========================================
// 9. VER DETALLES DEL VEHÍCULO (MODAL)
// ==========================================
function abrirModalDetalle(vehiculo) {
  if (!vehiculo) return;
  vehiculoActualDetalle = vehiculo;

  const vehiculoId = vehiculo.id;
  const nombreVehiculo =
    `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim() || "Vehículo";
  const añoVehiculo = vehiculo.anio || "";

  if (modalDetalleTitulo) {
    modalDetalleTitulo.textContent = `${nombreVehiculo} ${añoVehiculo ? `(${añoVehiculo})` : ""}`;
  }
  if (modalDetalleSubtitulo) {
    modalDetalleSubtitulo.textContent = `ID de registro: ${vehiculoId || "N/A"}`;
  }

  // Imágenes
  const imagenes =
    Array.isArray(vehiculo.images) && vehiculo.images.length > 0
      ? vehiculo.images
      : [];

  const precioFormateado = formatearPrecio(vehiculo.precio);
  const kmFormateado = formatearKilometraje(vehiculo.kilometraje);
  const { texto: rawStatus, clase: statusClass } = normalizarStatus(
    vehiculo.status,
  );
  const transmisionTexto = formatearTransmision(vehiculo.transmision);

  let imagenesHTML = "";
  if (imagenes.length > 0) {
    const principalImg = imagenes[0];
    const miniaturasHTML =
      imagenes.length > 1
        ? `<div class="detalle-thumbnails">
          ${imagenes
            .map(
              (img, idx) => `
            <img src="${img}" alt="Foto ${idx + 1}" class="detalle-thumb ${idx === 0 ? "active" : ""}" />
          `,
            )
            .join("")}
        </div>`
        : "";

    imagenesHTML = `
      <div class="detalle-galeria">
        <div class="detalle-imagen-principal-wrapper">
          <img id="detalle-img-principal" src="${principalImg}" alt="${nombreVehiculo}" class="detalle-imagen-principal" />
        </div>
        ${miniaturasHTML}
      </div>
    `;
  } else {
    imagenesHTML = `
      <div class="detalle-no-img-box">
        <span>Sin imágenes registradas para este vehículo</span>
      </div>
    `;
  }

  if (modalDetalleContenido) {
    modalDetalleContenido.innerHTML = `
      ${imagenesHTML}

      <div class="detalle-grid">
        <div class="detalle-card">
          <span class="detalle-label">Marca</span>
          <span class="detalle-valor">${vehiculo.marca || "N/A"}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Modelo</span>
          <span class="detalle-valor">${vehiculo.modelo || "N/A"}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Año</span>
          <span class="detalle-valor">${vehiculo.anio || "N/A"}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Precio</span>
          <span class="detalle-valor detalle-destacado">$${precioFormateado}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Kilometraje</span>
          <span class="detalle-valor">${kmFormateado} km</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Motor</span>
          <span class="detalle-valor">${vehiculo.motor || "N/A"}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Transmisión</span>
          <span class="detalle-valor">${transmisionTexto}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Número de Dueños</span>
          <span class="detalle-valor">${vehiculo.owners || 1}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Estatus</span>
          <span class="status-badge ${statusClass}">${rawStatus}</span>
        </div>
      </div>

      <div class="detalle-seccion-descripcion">
        <h4 class="detalle-seccion-titulo">Descripción</h4>
        <div class="detalle-descripcion-texto">
          ${vehiculo.description || "Sin descripción proporcionada."}
        </div>
      </div>
    `;

    // Clic en una miniatura para cambiar la foto principal
    modalDetalleContenido
      .querySelectorAll(".detalle-thumb")
      .forEach((miniatura) => {
        miniatura.addEventListener("click", () => {
          cambiarImagenPrincipalDetalle(
            miniatura.getAttribute("src"),
            miniatura,
          );
        });
      });

    // Si la foto principal no carga, se avisa en su hueco
    const imgPrincipalDetalle = modalDetalleContenido.querySelector(
      "#detalle-img-principal",
    );
    if (imgPrincipalDetalle) {
      imgPrincipalDetalle.addEventListener("error", () => {
        imgPrincipalDetalle.outerHTML =
          '<div class="detalle-no-img">Imagen no disponible</div>';
      });
    }
  }

  if (modalDetalleVehiculo) {
    modalDetalleVehiculo.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function cambiarImagenPrincipalDetalle(url, thumbElem) {
  const principal = document.getElementById("detalle-img-principal");
  if (principal) {
    principal.src = url;
  }
  const thumbs = document.querySelectorAll(".detalle-thumb");
  thumbs.forEach((t) => t.classList.remove("active"));
  if (thumbElem) {
    thumbElem.classList.add("active");
  }
}

function cerrarModalDetalle() {
  if (modalDetalleVehiculo) {
    modalDetalleVehiculo.style.display = "none";
    document.body.style.overflow = "";
  }
  vehiculoActualDetalle = null;
}

// ==========================================
// 10. ELIMINAR VEHÍCULO CON CONFIRMACIÓN
// ==========================================
async function confirmarYEliminarVehiculo(vehiculo) {
  const vehiculoId = vehiculo.id;
  const nombre =
    `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim() || vehiculoId;

  if (
    !confirm(
      `¿Estás seguro de que deseas eliminar permanentemente el vehículo "${nombre}"?`,
    )
  ) {
    return;
  }

  try {
    const res = await fetch(`/api/vehiculos/${vehiculoId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Vehículo "${nombre}" eliminado exitosamente.`);
      await cargarVehiculos();
    } else {
      alert(
        data.mensaje || data.error || "Error al intentar eliminar el vehículo.",
      );
    }
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    alert("Hubo un error de conexión al eliminar el vehículo.");
  }
}

// ==========================================
// 10. GUARDAR VEHÍCULO (POST o PUT)
// ==========================================
async function guardarVehiculo() {
  const selectedMarcaOption = inputMarca.options[inputMarca.selectedIndex];
  const marcaNombre = inputMarca.value;
  const marcaId = selectedMarcaOption ? selectedMarcaOption.dataset.id : "";

  if (!marcaNombre) {
    alert("Por favor selecciona una marca.");
    inputMarca.focus();
    return;
  }

  if (!inputModelo.value.trim()) {
    alert("Por favor ingresa el modelo del vehículo.");
    inputModelo.focus();
    return;
  }

  if (!inputAño.value.trim()) {
    alert("Por favor ingresa el año del vehículo.");
    inputAño.focus();
    return;
  }

  if (!inputMotor.value.trim()) {
    alert("Por favor ingresa el motor del vehículo.");
    inputMotor.focus();
    return;
  }

  if (!inputPrecio.value.trim() || Number(inputPrecio.value) < 0) {
    alert("Por favor ingresa un precio válido para el vehículo.");
    inputPrecio.focus();
    return;
  }

  if (!inputDescripcion.value.trim()) {
    alert("Por favor ingresa una descripción para el vehículo.");
    inputDescripcion.focus();
    return;
  }

  const id = inputVehiculoId ? inputVehiculoId.value.trim() : "";
  const metodo = modoFormulario === "PUT" && id ? "PUT" : "POST";
  const url = metodo === "PUT" ? `/api/vehiculos/${id}` : "/api/vehiculos";

  const formData = new FormData();
  formData.append("marca", marcaNombre);
  if (marcaId) {
    formData.append("marca_id", marcaId);
  }
  formData.append("modelo", inputModelo.value.trim());
  formData.append("anio", inputAño.value.trim());
  formData.append("kilometraje", inputKilometraje.value.trim() || "0");
  formData.append("motor", inputMotor.value.trim());
  formData.append("precio", inputPrecio.value.trim());
  formData.append("transmision", inputTransmision.value);
  formData.append("owners", inputPropietarios.value.trim() || "1");
  formData.append("status", inputEstatus.value);
  formData.append("description", inputDescripcion.value.trim());

  // Mantener imágenes existentes si estamos modificando
  formData.append("keepExistingImages", JSON.stringify(imagenesExistentes));

  // Agregar nuevos archivos de imagen
  archivosNuevos.forEach((file) => {
    formData.append("imagenes", file);
  });

  try {
    const res = await fetch(url, {
      method: metodo,
      body: formData,
    });

    // La respuesta puede no ser JSON (p. ej. un 500 en HTML de Express).
    const texto = await res.text();
    let data = {};
    try {
      data = texto ? JSON.parse(texto) : {};
    } catch {
      data = { error: `Error del servidor (${res.status}).` };
    }

    if (res.ok) {
      alert(
        `Vehículo ${metodo === "PUT" ? "actualizado" : "registrado"} con éxito.`,
      );
      limpiarFormulario();
      await cargarVehiculos();
      mostrarSeccionLista();
    } else {
      let mensajeError = "Error al guardar el vehículo:\n";
      if (data && data.detalles && Array.isArray(data.detalles)) {
        mensajeError += data.detalles.join("\n");
      } else if (data && data.error) {
        mensajeError += data.error;
      } else if (data && data.mensaje) {
        mensajeError += data.mensaje;
      } else {
        mensajeError += JSON.stringify(data);
      }
      alert(mensajeError);
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Hubo un error de conexión con el servidor.");
  }
}

// ==========================================
// 11. LIMPIAR FORMULARIO
// ==========================================
function limpiarFormulario() {
  if (formularioVehiculo) formularioVehiculo.reset();
  if (inputVehiculoId) inputVehiculoId.value = "";
  limpiarImagenes();
  cargarMarcas();
}

// ==========================================
// 12. GESTIÓN DE CITAS
// ==========================================
async function cargarCitas() {
  if (!cuerpoTablaCitas) return;

  cuerpoTablaCitas.innerHTML = `
    <tr>
      <td colspan="7" class="tabla-mensaje">Cargando citas...</td>
    </tr>
  `;

  try {
    const parametros = new URLSearchParams();
    if (filtroCitaEstado?.value) {
      parametros.set("estado", filtroCitaEstado.value);
    }
    if (filtroCitaFecha?.value) {
      parametros.set("fecha", filtroCitaFecha.value);
    }

    const consulta = parametros.toString();
    const res = await fetch(`/api/citas${consulta ? `?${consulta}` : ""}`);

    if (res.status === 401 || res.status === 403) {
      cuerpoTablaCitas.innerHTML = `
        <tr>
          <td colspan="7" class="tabla-mensaje tabla-mensaje--error">
            <p class="tabla-mensaje__titulo">Necesitas una sesión de administrador.</p>
            <a class="btn-limpiar-filtros" href="/contenedorPrincipal/login/login.html?redirect=/admin/admin.html">
              Iniciar sesión
            </a>
          </td>
        </tr>
      `;
      return;
    }

    if (!res.ok) throw new Error("No se pudieron cargar las citas");

    const data = await res.json();
    todasLasCitas = Array.isArray(data) ? data : [];
    renderizarTablaCitas(todasLasCitas);
  } catch (error) {
    console.error("Error al cargar citas:", error);
    cuerpoTablaCitas.innerHTML = `
      <tr>
        <td colspan="7" class="tabla-mensaje tabla-mensaje--error">
          Error de conexión al cargar las citas. Recarga la página.
        </td>
      </tr>
    `;
  }
}

function renderizarTablaCitas(citas) {
  if (!cuerpoTablaCitas) return;

  if (!citas.length) {
    const hayFiltros = Boolean(
      filtroCitaEstado?.value || filtroCitaFecha?.value,
    );
    cuerpoTablaCitas.innerHTML = `
      <tr>
        <td colspan="7" class="tabla-mensaje">
          ${
            hayFiltros
              ? "No hay citas que coincidan con los filtros."
              : "Todavía no hay citas registradas."
          }
        </td>
      </tr>
    `;
    return;
  }

  cuerpoTablaCitas.innerHTML = "";

  citas.forEach((cita) => {
    const estado = infoEstadoCita(cita.estado);
    const fecha = formatearFechaCita(cita.fecha);
    const mensaje = String(cita.mensaje || "").trim();
    const mensajeCorto =
      mensaje.length > 80 ? `${mensaje.slice(0, 80)}…` : mensaje;
    const email = String(cita.email || "").trim();
    const telefono = String(cita.telefono || "").trim();
    const emailHref = email ? `mailto:${encodeURI(email)}` : "";
    const telefonoHref = telefono
      ? `tel:${encodeURI(telefono.replace(/[^\d+]/g, ""))}`
      : "";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-label="Fecha / Hora" class="cita-fecha">
        <strong>${escaparHtml(fecha)}</strong><br>
        <span>${escaparHtml(cita.hora || "N/A")}</span>
      </td>
      <td data-label="Cliente">
        <strong>${escaparHtml(cita.nombre || "N/A")}</strong>
      </td>
      <td data-label="Contacto">
        <div class="cita-contacto">
          ${
            email
              ? `<a href="${escaparHtml(emailHref)}">${escaparHtml(email)}</a>`
              : "<span>Sin correo</span>"
          }
          ${
            telefono
              ? `<a href="${escaparHtml(telefonoHref)}">${escaparHtml(telefono)}</a>`
              : "<span>Sin teléfono</span>"
          }
        </div>
      </td>
      <td data-label="Vehículo">${escaparHtml(cita.vehiculo || "N/A")}</td>
      <td data-label="Mensaje">
        <div class="cita-mensaje">
          ${
            mensajeCorto
              ? escaparHtml(mensajeCorto)
              : '<span class="cita-mensaje--vacio">Sin mensaje</span>'
          }
        </div>
      </td>
      <td data-label="Estado">
        <span class="status-badge ${estado.clase}">${escaparHtml(estado.texto)}</span>
      </td>
      <td class="td-acciones">
        <div class="actions-cell">
          <button type="button" class="btn-action btn-view" title="Gestionar esta cita">
            Gestionar
          </button>
        </div>
      </td>
    `;

    fila
      .querySelector(".btn-view")
      .addEventListener("click", () => abrirModalCita(cita));

    cuerpoTablaCitas.appendChild(fila);
  });
}

function abrirModalCita(cita) {
  if (!cita || !modalCita) return;

  citaActual = cita;
  const estado = infoEstadoCita(cita.estado);
  const hoy = hoyEnCaracasAdmin();

  if (modalCitaTitulo) {
    modalCitaTitulo.textContent = `Cita de ${cita.nombre || "cliente"}`;
  }
  if (modalCitaSubtitulo) {
    modalCitaSubtitulo.textContent = `${formatearFechaCita(cita.fecha)} a las ${
      cita.hora || "N/A"
    } · ID ${cita.id || "N/A"}`;
  }
  if (citaDetalleNombre) citaDetalleNombre.textContent = cita.nombre || "N/A";
  if (citaDetalleEmail) citaDetalleEmail.textContent = cita.email || "N/A";
  if (citaDetalleTelefono) {
    citaDetalleTelefono.textContent = cita.telefono || "N/A";
  }
  if (citaDetalleVehiculo) {
    citaDetalleVehiculo.textContent = cita.vehiculo || "N/A";
  }
  if (citaDetalleFecha) {
    citaDetalleFecha.textContent = `${formatearFechaCita(cita.fecha)} a las ${
      cita.hora || "N/A"
    }`;
  }
  if (citaDetalleEstado) {
    citaDetalleEstado.className = `status-badge ${estado.clase}`;
    citaDetalleEstado.textContent = estado.texto;
  }
  if (citaDetalleMensaje) {
    citaDetalleMensaje.textContent =
      String(cita.mensaje || "").trim() || "Sin mensaje.";
  }

  if (citaGestionEstado) {
    citaGestionEstado.value = ESTADOS_CITA[cita.estado]
      ? cita.estado
      : "pendiente";
  }
  if (citaGestionFecha) {
    citaGestionFecha.value = cita.fecha || "";
    citaGestionFecha.min = hoy;
    citaGestionFecha.max = sumarDiasAdmin(hoy, 60);
  }
  if (citaGestionHora) {
    const horas = [...HORAS_CITA];
    if (cita.hora && !horas.includes(cita.hora)) horas.push(cita.hora);
    citaGestionHora.innerHTML = horas
      .map((hora) => `<option value="${hora}">${hora}</option>`)
      .join("");
    citaGestionHora.value = cita.hora || HORAS_CITA[0];
  }
  if (citaGestionNotas) {
    citaGestionNotas.value = cita.notasAdmin || "";
  }
  if (citaGestionMensaje) {
    citaGestionMensaje.hidden = true;
    citaGestionMensaje.textContent = "";
    citaGestionMensaje.className = "cita-gestion-mensaje";
  }

  modalCita.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarModalCita() {
  if (modalCita) modalCita.style.display = "none";
  document.body.style.overflow = "";
  citaActual = null;
}

function mostrarMensajeCita(texto, tipo = "error") {
  if (!citaGestionMensaje) return;
  citaGestionMensaje.textContent = texto;
  citaGestionMensaje.className = `cita-gestion-mensaje ${tipo}`;
  citaGestionMensaje.hidden = false;
}

async function guardarCita(estadoForzado = null) {
  if (!citaActual) return;
  if (!citaActual.id) {
    mostrarMensajeCita("No se encontró el ID de la cita.");
    return;
  }

  const estado = estadoForzado || citaGestionEstado?.value || "";
  const fecha = (citaGestionFecha?.value || "").trim();
  const hora = (citaGestionHora?.value || "").trim();
  const notasAdmin = (citaGestionNotas?.value || "").trim();

  if (!ESTADOS_CITA[estado]) {
    mostrarMensajeCita("Selecciona un estado válido.");
    return;
  }
  if (!fecha) {
    mostrarMensajeCita("Selecciona la fecha de la cita.");
    citaGestionFecha?.focus();
    return;
  }
  if (!hora) {
    mostrarMensajeCita("Selecciona la hora de la cita.");
    citaGestionHora?.focus();
    return;
  }

  if (estado === "cancelada" && citaActual.estado !== "cancelada") {
    const nombre = citaActual.nombre || "este cliente";
    if (!confirm(`¿Cancelar la cita de ${nombre}?`)) return;
  }

  if (citaGestionEstado) citaGestionEstado.value = estado;

  const botones = [btnCitaConfirmar, btnCitaCancelar, btnCitaGuardar];
  botones.forEach((boton) => {
    if (boton) boton.disabled = true;
  });
  if (citaGestionMensaje) citaGestionMensaje.hidden = true;

  try {
    const res = await fetch(`/api/citas/${citaActual.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, fecha, hora, notasAdmin }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        mostrarMensajeCita(
          "Tu sesión de administrador expiró. Vuelve a iniciar sesión.",
        );
      } else {
        mostrarMensajeCita(
          data.error || data.mensaje || "No se pudo actualizar la cita.",
        );
      }
      return;
    }

    let mensaje = "Cita actualizada correctamente.";
    if (data?.correo?.cliente === true) {
      mensaje = "Cita actualizada y correo enviado al cliente.";
    } else if (data?.correo?.cliente === false) {
      mensaje =
        "Cita actualizada, pero no se pudo enviar el correo al cliente. Revisa la configuración SMTP.";
    }

    cerrarModalCita();
    await cargarCitas();
    alert(mensaje);
  } catch (error) {
    console.error("Error al actualizar la cita:", error);
    mostrarMensajeCita("No se pudo conectar con el servidor.");
  } finally {
    botones.forEach((boton) => {
      if (boton) boton.disabled = false;
    });
  }
}

function limpiarFiltrosCitas() {
  if (filtroCitaEstado) filtroCitaEstado.value = "";
  if (filtroCitaFecha) filtroCitaFecha.value = "";
  cargarCitas();
}

// ==========================================
// 13. INICIALIZACIÓN Y EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Cargar lista inicial de vehículos e inicializar marcas
  cargarVehiculos();
  cargarMarcas();

  // Filtros del inventario
  if (filtroMarca) {
    filtroMarca.addEventListener("change", () => {
      aplicarFiltros();
    });
  }

  if (filtroNombre) {
    filtroNombre.addEventListener("input", () => {
      aplicarFiltros();
    });
  }

  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener("click", () => {
      resetearFiltros();
    });
  }

  // Botón para crear nuevo vehículo
  if (btnCrearNuevo) {
    btnCrearNuevo.addEventListener("click", () => {
      abrirFormularioCrear();
    });
  }

  // Gestión de marcas
  if (btnGestionarMarcas) {
    btnGestionarMarcas.addEventListener("click", () => {
      cargarTablaMarcas();
      mostrarSeccionMarcas();
    });
  }

  if (btnVolverListaMarcas) {
    btnVolverListaMarcas.addEventListener("click", () => {
      mostrarSeccionLista();
    });
  }

  if (btnAgregarMarca) {
    btnAgregarMarca.addEventListener("click", () => {
      agregarMarca();
    });
  }

  // Permitir crear con Enter (el campo no está dentro de un <form>)
  if (inputNuevaMarca) {
    inputNuevaMarca.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        agregarMarca();
      }
    });
  }

  // Gestión de citas
  if (btnGestionarCitas) {
    btnGestionarCitas.addEventListener("click", () => {
      cargarCitas();
      mostrarSeccionCitas();
    });
  }

  if (btnVolverListaCitas) {
    btnVolverListaCitas.addEventListener("click", () => {
      mostrarSeccionLista();
    });
  }

  if (filtroCitaEstado) {
    filtroCitaEstado.addEventListener("change", () => {
      cargarCitas();
    });
  }

  if (filtroCitaFecha) {
    filtroCitaFecha.addEventListener("change", () => {
      cargarCitas();
    });
  }

  if (btnActualizarCitas) {
    btnActualizarCitas.addEventListener("click", () => {
      cargarCitas();
    });
  }

  if (btnLimpiarFiltrosCitas) {
    btnLimpiarFiltrosCitas.addEventListener("click", () => {
      limpiarFiltrosCitas();
    });
  }

  // Botón para volver al listado desde el formulario
  if (btnVolverLista) {
    btnVolverLista.addEventListener("click", () => {
      mostrarSeccionLista();
    });
  }

  // Botón Cancelar del formulario
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      limpiarFormulario();
      mostrarSeccionLista();
    });
  }

  // Botón Guardar del formulario
  if (btnGuardar) {
    btnGuardar.addEventListener("click", (e) => {
      e.preventDefault();
      guardarVehiculo();
    });
  }

  // Manejador de selección de imágenes
  if (inputImagenes) {
    inputImagenes.addEventListener("change", (e) => {
      const nuevosArchivos = Array.from(e.target.files);
      const espacio = Math.max(0, MAX_IMAGENES - archivosNuevos.length);

      if (nuevosArchivos.length > espacio) {
        alert(
          `Puedes subir un máximo de ${MAX_IMAGENES} imágenes por vehículo.`,
        );
      }

      archivosNuevos = [...archivosNuevos, ...nuevosArchivos.slice(0, espacio)];
      sincronizarArchivos();
      actualizarVistaPrevia();
    });
  }

  // Botón para limpiar imágenes
  if (btnLimpiarImagenes) {
    btnLimpiarImagenes.addEventListener("click", () => {
      limpiarImagenes();
    });
  }

  // Eventos del modal de detalles
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", () => {
      cerrarModalDetalle();
    });
  }

  if (btnModalCerrar) {
    btnModalCerrar.addEventListener("click", () => {
      cerrarModalDetalle();
    });
  }

  if (btnModalEditar) {
    btnModalEditar.addEventListener("click", () => {
      if (vehiculoActualDetalle) {
        const vehiculo = vehiculoActualDetalle;
        cerrarModalDetalle();
        abrirFormularioEditar(vehiculo);
      }
    });
  }

  if (btnModalEliminar) {
    btnModalEliminar.addEventListener("click", async () => {
      if (vehiculoActualDetalle) {
        const vehiculo = vehiculoActualDetalle;
        cerrarModalDetalle();
        await confirmarYEliminarVehiculo(vehiculo);
      }
    });
  }

  if (btnVolverInicio) {
    btnVolverInicio.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }

  if (modalDetalleVehiculo) {
    modalDetalleVehiculo.addEventListener("click", (e) => {
      if (e.target === modalDetalleVehiculo) {
        cerrarModalDetalle();
      }
    });
  }

  // Eventos del modal de citas
  if (btnCerrarModalCita) {
    btnCerrarModalCita.addEventListener("click", () => {
      cerrarModalCita();
    });
  }

  if (btnCerrarModalCitaPie) {
    btnCerrarModalCitaPie.addEventListener("click", () => {
      cerrarModalCita();
    });
  }

  if (modalCita) {
    modalCita.addEventListener("click", (e) => {
      if (e.target === modalCita) {
        cerrarModalCita();
      }
    });
  }

  if (btnCitaConfirmar) {
    btnCitaConfirmar.addEventListener("click", () => {
      guardarCita("confirmada");
    });
  }

  if (btnCitaCancelar) {
    btnCitaCancelar.addEventListener("click", () => {
      guardarCita("cancelada");
    });
  }

  if (btnCitaGuardar) {
    btnCitaGuardar.addEventListener("click", () => {
      guardarCita();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (modalCita && modalCita.style.display === "flex") {
      cerrarModalCita();
      return;
    }

    if (
      modalDetalleVehiculo &&
      modalDetalleVehiculo.style.display === "flex"
    ) {
      cerrarModalDetalle();
    }
  });
});
