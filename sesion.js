// ==========================================
// 1. SELECTORES DEL DOM
// ==========================================
const btnLogin = document.getElementById("btn-login");
const btnRegistro = document.getElementById("btn-registro");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
const btnAdmin = document.getElementById("btn-admin"); // Botón hacia el panel de administración

// Perfil: avatar con iniciales + panel desplegable
const perfil = document.getElementById("perfil");
const btnPerfil = document.getElementById("btn-perfil");
const perfilPanel = document.getElementById("perfil-panel");
const perfilIniciales = document.getElementById("perfil-iniciales");
const perfilAvatar = document.getElementById("perfil-avatar");
const perfilNombre = document.getElementById("perfil-nombre");
const perfilRol = document.getElementById("perfil-rol");
const perfilCorreo = document.getElementById("perfil-correo");
const perfilRegistro = document.getElementById("perfil-registro");

// ==========================================
// 2. UTILIDADES
// ==========================================

/** Toma hasta 2 iniciales de un nombre ("Fabio Espinoza" -> "FE"). */
function obtenerIniciales(nombre) {
  return (nombre || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

/** Nombre presentable del rol. */
function formatearRol(rol) {
  return rol === "admin" ? "Administrador" : "Cliente";
}

/** Fecha de registro en formato largo (ej: 12 de marzo de 2026). */
function formatearFecha(fecha) {
  if (!fecha) return "—";
  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return "—";
  return fechaObj.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ==========================================
// 3. PERFIL (avatar + panel desplegable)
// ==========================================

/** Abre o cierra el panel del perfil. Sin argumento, lo alterna. */
function alternarPerfil(abrir) {
  if (!perfilPanel || !btnPerfil) return;
  const mostrar = typeof abrir === "boolean" ? abrir : perfilPanel.hidden;
  perfilPanel.hidden = !mostrar;
  btnPerfil.setAttribute("aria-expanded", String(mostrar));
}

/** Cierra el panel si el clic fue fuera del bloque de perfil. */
function cerrarPerfilSiEsExterno(evento) {
  if (!perfil || !perfilPanel || perfilPanel.hidden) return;
  if (!perfil.contains(evento.target)) alternarPerfil(false);
}

/**
 * Pide al backend los datos del usuario logueado (correo y fecha de registro,
 * que no se guardan en el navegador) y los pinta en el panel.
 */
async function cargarDatosPerfil() {
  try {
    const respuesta = await fetch("/api/auth/me");
    if (!respuesta.ok) throw new Error("La sesión ya no es válida");

    const datos = await respuesta.json();

    if (perfilNombre) perfilNombre.textContent = datos.name || "—";
    if (perfilRol) perfilRol.textContent = formatearRol(datos.role);
    if (perfilCorreo) perfilCorreo.textContent = datos.email || "—";
    if (perfilRegistro) {
      perfilRegistro.textContent = formatearFecha(datos.createdAt);
    }
  } catch (error) {
    // La cookie venció o el usuario ya no existe: limpiamos la sesión local.
    console.warn("No se pudo cargar el perfil:", error.message);
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("rolUsuario");
    actualizarInterfazSesion();
  }
}

// ==========================================
// 4. SESIÓN
// ==========================================

/**
 * Revisa el estado de la sesión y el rol del usuario en el navegador
 * para mostrar u ocultar elementos del menú (incluyendo el acceso de Admin).
 */
function actualizarInterfazSesion() {
  const usuario = localStorage.getItem("usuarioActivo");
  const rol = localStorage.getItem("rolUsuario");

  if (usuario) {
    // SI EL USUARIO HA INICIADO SESIÓN:
    if (btnLogin) btnLogin.style.display = "none";
    if (btnRegistro) btnRegistro.style.display = "none";
    if (btnAdmin) btnAdmin.style.display = rol === "admin" ? "block" : "none";

    // Pintamos de una lo que ya sabemos (nombre y rol) para que se vea instantáneo
    const iniciales = obtenerIniciales(usuario);
    if (perfilIniciales) perfilIniciales.textContent = iniciales || "?";
    if (perfilAvatar) perfilAvatar.textContent = iniciales || "?";
    if (perfilNombre) perfilNombre.textContent = usuario;
    if (perfilRol) perfilRol.textContent = formatearRol(rol);
    if (perfil) perfil.style.display = "block";

    // Y luego pedimos correo y fecha de registro al backend
    cargarDatosPerfil();
  } else {
    // SI NO HAY SESIÓN ACTIVA (Invitado):
    if (btnLogin) btnLogin.style.display = "inline-block";
    if (btnRegistro) btnRegistro.style.display = "inline-block";
    if (btnAdmin) btnAdmin.style.display = "none"; // Oculta el botón Admin por seguridad visual
    if (perfil) perfil.style.display = "none";
    alternarPerfil(false);
  }
}

/**
 * Realiza la petición al backend para destruir la cookie y limpia el almacenamiento local.
 */
async function manejarCierreSesion() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Error al cerrar sesión en el servidor:", error);
  }

  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("rolUsuario");
  window.location.reload();
}

// ==========================================
// 5. INICIALIZACIÓN Y EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Ejecutar verificación al cargar la página
  actualizarInterfazSesion();

  // 2. Abrir/cerrar el panel desde el avatar
  if (btnPerfil) {
    btnPerfil.addEventListener("click", () => alternarPerfil());
  }
  document.addEventListener("click", cerrarPerfilSiEsExterno);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") alternarPerfil(false);
  });

  // 3. Escuchar el clic del botón de cerrar sesión
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", manejarCierreSesion);
  }
});
