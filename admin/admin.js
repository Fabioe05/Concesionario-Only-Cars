// Secciones de vista
const seccionLista = document.getElementById("seccion-lista");
const seccionFormulario = document.getElementById("seccion-formulario");
const tablaVehiculosBody = document.getElementById("tabla-vehiculos-body");
// Filtros de inventario
const filtroMarca = document.getElementById("filtro-marca");
const filtroNombre = document.getElementById("filtro-nombre");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");
// Botones de navegación entre vistas
const btnCrearNuevo = document.getElementById("btn-crear-nuevo");
const btnVolverLista = document.getElementById("btn-volver-lista");
const formTitulo = document.getElementById("form-titulo");
// Formulario y campos
const formVehiculo = document.getElementById("form-vehiculo");
const inputVehiculoId = document.getElementById("vehiculo-id");
const inputMarca = document.getElementById("marca");
const inputModelo = document.getElementById("modelo");
const inputAño = document.getElementById("año");
const inputKilometraje = document.getElementById("kilometraje");
const inputMotor = document.getElementById("motor");
const inputPrecio = document.getElementById("precio");
const inputTransmision = document.getElementById("transmision");
const inputOwners = document.getElementById("owners");
const inputStatus = document.getElementById("status");
const inputDescription = document.getElementById("description");
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
const inputImages = document.getElementById("images");
const btnLimpiarImagenes = document.getElementById("btn-limpiar-imagenes");
const divVistaPrevia = document.getElementById("vista-previa");
// Botones de acción del formulario
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");

let todosLosVehiculos = [];
let vehiculoActualDetalle = null;
let archivosNuevos = [];
let imagenesExistentes = [];
let modoFormulario = "POST";

// CAMBIO DE VISTAS (LISTA <-> FORMULARIO)
function mostrarSeccionLista() {
  if (seccionLista) seccionLista.style.display = "block";
  if (seccionFormulario) seccionFormulario.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarSeccionFormulario() {
  if (seccionLista) seccionLista.style.display = "none";
  if (seccionFormulario) seccionFormulario.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// CARGA, FILTRADO Y RENDERIZADO DEL INVENTARIO
async function cargarVehiculos() {
  if (!tablaVehiculosBody) return;

  try {
    tablaVehiculosBody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center" style="padding: 30px; color: #888; text-align: center;">
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
    tablaVehiculosBody.innerHTML = `
      <tr>
        <td colspan="10" style="padding: 30px; text-align: center; color: #f87171;">
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
          .map((m) => m.name || m.nombre || m)
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
      const marcaIdVehiculo = (vehiculo.marca_id || "")
        .toString()
        .trim()
        .toLowerCase();
      if (marcaVehiculo !== marcaFiltro && marcaIdVehiculo !== marcaFiltro) {
        return false;
      }
    }

    // 2. Filtro por texto (modelo, marca, descripción, motor, año)
    if (textoFiltro) {
      const marca = (vehiculo.marca || "").toLowerCase();
      const modelo = (vehiculo.modelo || "").toLowerCase();
      const descripcion = (
        vehiculo.description ||
        vehiculo.descripcion ||
        ""
      ).toLowerCase();
      const año = (vehiculo.año || vehiculo.anio || "")
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
  if (!tablaVehiculosBody) return;

  if (todosLosVehiculos.length === 0) {
    tablaVehiculosBody.innerHTML = `
      <tr>
        <td colspan="10" style="padding: 40px 20px; text-align: center; color: #aaa;">
          <p style="font-size: 16px; margin-bottom: 12px;">No hay vehículos registrados en el catálogo actualmente.</p>
          <button type="button" class="btn-nuevo-vehiculo" onclick="abrirFormularioCrear()" style="margin: 0 auto;">
            Crear el primer vehículo
          </button>
        </td>
      </tr>
    `;
    return;
  }

  if (vehiculos.length === 0) {
    tablaVehiculosBody.innerHTML = `
      <tr>
        <td colspan="10" style="padding: 35px 20px; text-align: center; color: #8e8e93;">
          <p style="font-size: 15px; margin-bottom: 8px;">No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
          <button type="button" class="btn-limpiar-filtros" onclick="resetearFiltros()" style="margin-top: 10px;">
            Limpiar filtros de búsqueda
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tablaVehiculosBody.innerHTML = "";

  vehiculos.forEach((vehiculo) => {
    const fila = document.createElement("tr");

    // ID normalizado
    const vehiculoId = vehiculo.id || vehiculo._id;

    // Imágenes
    const imagenes = vehiculo.images || vehiculo.imagenes || [];
    const imagenHTML =
      imagenes.length > 0
        ? `<img src="${imagenes[0]}" alt="${vehiculo.modelo}" class="vehiculo-img-thumb" onerror="this.outerHTML='<div class=\\'vehiculo-no-img\\'>Sin foto</div>'" />`
        : `<div class="vehiculo-no-img">Sin foto</div>`;

    // Formato de Precio y Kilometraje
    const precioFormateado = Number(vehiculo.precio || 0).toLocaleString(
      "en-US",
    );
    const kmFormateado = Number(
      vehiculo.kilometraje !== undefined ? vehiculo.kilometraje : 0,
    ).toLocaleString("en-US");

    // Estatus y badge
    const rawStatus = (
      vehiculo.status ||
      vehiculo.estatus ||
      "disponible"
    ).toLowerCase();
    let statusClass = "disponible";
    if (rawStatus.includes("vend")) statusClass = "vendido";
    else if (rawStatus.includes("reser")) statusClass = "reservado";

    // Transmisión
    const rawTrans = (vehiculo.transmision || "automatica").toLowerCase();
    const transmisionTexto = rawTrans.includes("auto")
      ? "Automática"
      : "Manual";

    fila.innerHTML = `
      <td>${imagenHTML}</td>
      <td><strong>${vehiculo.marca || "N/A"}</strong></td>
      <td>${vehiculo.modelo || "N/A"}</td>
      <td>${vehiculo.año || vehiculo.anio || "N/A"}</td>
      <td>${kmFormateado} km</td>
      <td>${vehiculo.motor || "N/A"}</td>
      <td><strong style="color: #ffffff;">$${precioFormateado}</strong></td>
      <td>${transmisionTexto}</td>
      <td><span class="status-badge ${statusClass}">${rawStatus}</span></td>
      <td style="text-align: center;">
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

    tablaVehiculosBody.appendChild(fila);
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
      option.dataset.id = m.id || m._id;
      option.textContent = m.name;
      if (
        marcaSeleccionada &&
        (m.name.toLowerCase() === marcaSeleccionada.toString().toLowerCase() ||
          (m.id && m.id.toString() === marcaSeleccionada.toString()) ||
          (m._id && m._id.toString() === marcaSeleccionada.toString()))
      ) {
        option.selected = true;
      }
      inputMarca.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar marcas:", error);
    inputMarca.innerHTML = `
      <option value="">Seleccione una marca...</option>
      <option value="Kia">Kia</option>
      <option value="Chevrolet">Chevrolet</option>
      <option value="Toyota">Toyota</option>
      <option value="Honda">Honda</option>
      <option value="Fiat">Fiat</option>
      <option value="Hyundai">Hyundai</option>
      <option value="BMW">BMW</option>
      <option value="Renault">Renault</option>
      <option value="Volkswagen">Volkswagen</option>
    `;
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
      sincronizarInputFiles();
      actualizarVistaPrevia();
    });

    card.appendChild(img);
    card.appendChild(btnQuitar);
    divVistaPrevia.appendChild(card);
  });
}

function sincronizarInputFiles() {
  const dataTransfer = new DataTransfer();
  archivosNuevos.forEach((file) => dataTransfer.items.add(file));
  if (inputImages) {
    inputImages.files = dataTransfer.files;
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
  if (inputImages) {
    inputImages.value = "";
  }
  divVistaPrevia.innerHTML = "";
}

// ==========================================
// 7. ABRIR FORMULARIO PARA CREAR
// ==========================================
function abrirFormularioCrear() {
  modoFormulario = "POST";
  limpiarFormulario();
  if (formTitulo) formTitulo.textContent = "Registrar Nuevo Vehículo";
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

  const vehiculoId = vehiculo.id || vehiculo._id;
  if (inputVehiculoId) inputVehiculoId.value = vehiculoId;

  const nombreVehiculo =
    `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim();
  if (formTitulo) {
    formTitulo.textContent = `Editar Vehículo: ${nombreVehiculo || vehiculoId}`;
  }
  if (btnGuardar) {
    btnGuardar.textContent = "Actualizar Vehículo";
  }

  // Rellenar campos del formulario
  if (inputModelo) inputModelo.value = vehiculo.modelo || "";
  if (inputAño) inputAño.value = vehiculo.año || vehiculo.anio || "";
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
  if (inputOwners) {
    inputOwners.value = vehiculo.owners || vehiculo.dueños || 1;
  }

  // Normalizar Estatus
  if (inputStatus && (vehiculo.status || vehiculo.estatus)) {
    inputStatus.value = (vehiculo.status || vehiculo.estatus).toLowerCase();
  }

  // Normalizar Descripción
  if (inputDescription) {
    inputDescription.value = vehiculo.description || vehiculo.descripcion || "";
  }

  // Cargar lista de marcas seleccionando la marca del vehículo
  const marcaValor = vehiculo.marca || vehiculo.marca_id;
  await cargarMarcas(marcaValor);

  // Cargar imágenes existentes
  imagenesExistentes = Array.isArray(vehiculo.images)
    ? [...vehiculo.images]
    : Array.isArray(vehiculo.imagenes)
      ? [...vehiculo.imagenes]
      : [];
  archivosNuevos = [];
  if (inputImages) inputImages.value = "";
  actualizarVistaPrevia();

  mostrarSeccionFormulario();
}

// ==========================================
// 9. VER DETALLES DEL VEHÍCULO (MODAL)
// ==========================================
function abrirModalDetalle(vehiculo) {
  if (!vehiculo) return;
  vehiculoActualDetalle = vehiculo;

  const vehiculoId = vehiculo.id || vehiculo._id;
  const nombreVehiculo =
    `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim() || "Vehículo";
  const añoVehiculo = vehiculo.año || vehiculo.anio || "";

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
      : Array.isArray(vehiculo.imagenes) && vehiculo.imagenes.length > 0
        ? vehiculo.imagenes
        : [];

  const precioFormateado = Number(vehiculo.precio || 0).toLocaleString("en-US");
  const kmFormateado = Number(
    vehiculo.kilometraje !== undefined ? vehiculo.kilometraje : 0,
  ).toLocaleString("en-US");

  const rawStatus = (
    vehiculo.status ||
    vehiculo.estatus ||
    "disponible"
  ).toLowerCase();
  let statusClass = "disponible";
  if (rawStatus.includes("vend")) statusClass = "vendido";
  else if (rawStatus.includes("reser")) statusClass = "reservado";

  const rawTrans = (vehiculo.transmision || "automatica").toLowerCase();
  const transmisionTexto = rawTrans.includes("auto") ? "Automática" : "Manual";

  let imagenesHTML = "";
  if (imagenes.length > 0) {
    const principalImg = imagenes[0];
    const miniaturasHTML =
      imagenes.length > 1
        ? `<div class="detalle-thumbnails">
          ${imagenes
            .map(
              (img, idx) => `
            <img src="${img}" alt="Foto ${idx + 1}" class="detalle-thumb ${idx === 0 ? "active" : ""}" onclick="window.cambiarImagenPrincipalDetalle('${img}', this)" />
          `,
            )
            .join("")}
        </div>`
        : "";

    imagenesHTML = `
      <div class="detalle-galeria">
        <div class="detalle-imagen-principal-wrapper">
          <img id="detalle-img-principal" src="${principalImg}" alt="${nombreVehiculo}" class="detalle-imagen-principal" onerror="this.outerHTML='<div class=\\'detalle-no-img\\'>Imagen no disponible</div>'" />
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
          <span class="detalle-valor">${vehiculo.año || vehiculo.anio || "N/A"}</span>
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
          <span class="detalle-valor">${vehiculo.owners || vehiculo.dueños || 1}</span>
        </div>
        <div class="detalle-card">
          <span class="detalle-label">Estatus</span>
          <span class="status-badge ${statusClass}">${rawStatus}</span>
        </div>
      </div>

      <div class="detalle-seccion-descripcion">
        <h4 class="detalle-seccion-titulo">Descripción</h4>
        <div class="detalle-descripcion-texto">
          ${vehiculo.description || vehiculo.descripcion || "Sin descripción proporcionada."}
        </div>
      </div>
    `;
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
window.cambiarImagenPrincipalDetalle = cambiarImagenPrincipalDetalle;

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
  const vehiculoId = vehiculo.id || vehiculo._id;
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

  if (!inputDescription.value.trim()) {
    alert("Por favor ingresa una descripción para el vehículo.");
    inputDescription.focus();
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
  formData.append("año", inputAño.value.trim());
  formData.append("anio", inputAño.value.trim());
  formData.append("kilometraje", inputKilometraje.value.trim() || "0");
  formData.append("motor", inputMotor.value.trim());
  formData.append("precio", inputPrecio.value.trim());
  formData.append("transmision", inputTransmision.value);
  formData.append("owners", inputOwners.value.trim() || "1");
  formData.append("dueños", inputOwners.value.trim() || "1");
  formData.append("status", inputStatus.value);
  formData.append("estatus", inputStatus.value);
  formData.append("description", inputDescription.value.trim());
  formData.append("descripcion", inputDescription.value.trim());

  // Mantener imágenes existentes si estamos modificando
  formData.append("keepExistingImages", JSON.stringify(imagenesExistentes));

  // Agregar nuevos archivos de imagen
  archivosNuevos.forEach((file) => {
    formData.append("images", file);
    formData.append("imagenes", file);
  });

  try {
    const res = await fetch(url, {
      method: metodo,
      body: formData,
    });

    const data = await res.json();

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
  if (formVehiculo) formVehiculo.reset();
  if (inputVehiculoId) inputVehiculoId.value = "";
  limpiarImagenes();
  cargarMarcas();
}

// ==========================================
// 12. INICIALIZACIÓN Y EVENT LISTENERS
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
  if (inputImages) {
    inputImages.addEventListener("change", (e) => {
      const nuevosArchivos = Array.from(e.target.files);
      archivosNuevos = [...archivosNuevos, ...nuevosArchivos];
      sincronizarInputFiles();
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

  if (modalDetalleVehiculo) {
    modalDetalleVehiculo.addEventListener("click", (e) => {
      if (e.target === modalDetalleVehiculo) {
        cerrarModalDetalle();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      modalDetalleVehiculo &&
      modalDetalleVehiculo.style.display === "flex"
    ) {
      cerrarModalDetalle();
    }
  });
});
