// ==========================================
// 1. SELECTORES DEL DOM
// ==========================================
const formularioLogin = document.querySelector("form");
const inputCorreo = document.querySelector('input[type="email"]');
const inputClave = document.querySelector('input[type="password"]');

// Guarda a dónde quería ir el usuario antes de que el muro lo mandara aquí.
const destinoGuardado = new URLSearchParams(window.location.search).get("redirect");
if (destinoGuardado) {
  sessionStorage.setItem("redirectPendiente", destinoGuardado);
}

// ==========================================
// 2. FUNCIONES PRINCIPALES
// ==========================================
async function manejarLogin(event) {
  event.preventDefault();

  try {
    const respuesta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inputCorreo.value,
        password: inputClave.value,
      }),
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      // Guardamos el nombre y el 'role' correcto que viene del servidor
      localStorage.setItem("usuarioActivo", datos.name);
      localStorage.setItem("rolUsuario", datos.role);

      alert(`¡Bienvenido de nuevo, ${datos.name}!`);

      // Vuelve a la página que el usuario intentaba abrir (si es interna).
      const destino = sessionStorage.getItem("redirectPendiente") || "/";
      sessionStorage.removeItem("redirectPendiente");
      const esRutaInterna = destino.startsWith("/") && !destino.startsWith("//");
      window.location.href = esRutaInterna ? destino : "/";
    } else {
      alert(datos.error || "Credenciales incorrectas");
    }
  } catch (error) {
    console.error("Error de red al intentar iniciar sesión:", error);
    alert("Error al conectar con el servidor.");
  }
}

// ==========================================
// 3. INICIALIZACIÓN Y EVENT LISTENERS
// ==========================================
if (formularioLogin) {
  formularioLogin.addEventListener("submit", manejarLogin);
}
