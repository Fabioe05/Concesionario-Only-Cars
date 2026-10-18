const REGEX_CLAVE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,26}$/;
const REGEX_NOMBRE =
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,18}(\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,18})+$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Selectores
const inputNombre = document.querySelector("#name");
const inputCorreo = document.querySelector("#email");
const inputClave = document.querySelector("#password");
const inputConfirmarClave = document.querySelector("#confirm-password");
const btnEnviar = document.querySelector("#boton");
const formulario = document.querySelector("#form");

// Validación
let nombreValido = false;
let correoValido = false;
let claveValida = false;
let confirmacionValida = false;

// Funciones

// Ajusta los estilos del campo según si el valor es válido o no
const validarCampo = (event, esValido, element) => {
  const aviso = event.target.parentElement.children[2];
  btnEnviar.disabled =
    nombreValido && correoValido && claveValida && confirmacionValida
      ? false
      : true;

  if (esValido) {
    element.classList.add("true");
    element.classList.remove("false");
    aviso.classList.remove("show-information");
  } else {
    element.classList.add("false");
    element.classList.remove("true");
    aviso.classList.add("show-information");
  }
};

// Recibe la información del input y la valida
inputNombre.addEventListener("input", (event) => {
  nombreValido = REGEX_NOMBRE.test(event.target.value);
  validarCampo(event, nombreValido, inputNombre);
});

inputCorreo.addEventListener("input", (event) => {
  correoValido = REGEX_CORREO.test(event.target.value);
  validarCampo(event, correoValido, inputCorreo);
});

inputClave.addEventListener("input", (event) => {
  claveValida = REGEX_CLAVE.test(event.target.value);
  validarCampo(event, claveValida, inputClave);
});

inputConfirmarClave.addEventListener("input", (event) => {
  confirmacionValida = inputClave.value === event.target.value;
  validarCampo(event, confirmacionValida, inputConfirmarClave);
});

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  // 1. Verificamos que todos los REGEX hayan dado 'true'
  if (nombreValido && correoValido && claveValida && confirmacionValida) {
    const nombre = inputNombre.value;
    const correo = inputCorreo.value;
    const clave = inputClave.value;

    try {
      // 2. Hacemos la petición al backend
      const respuesta = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre, email: correo, password: clave }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert("Usuario creado exitosamente. Ahora puedes iniciar sesión.");
        window.location.href = "../login/login.html"; // Redirigir al login
      } else {
        alert(datos.error || "Error al registrar el usuario");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error al conectar con el servidor.");
    }
  } else {
    alert(
      "Por favor, completa correctamente todos los campos en rojo antes de enviar.",
    );
  }
});
