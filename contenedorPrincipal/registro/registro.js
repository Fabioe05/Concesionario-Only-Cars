const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,26}$/;
const NAME_REGEX =
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,18}(\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,18})+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_REGEX = /^\d{7,15}$/;

// Selectores
const nameInput = document.querySelector("#name");
const lastnameInput = document.querySelector("#lastname");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");
const boton = document.querySelector("#boton");
const form = document.querySelector("#form");

//Validation
let nameValidation = false;
let lastnameValidation = false;
let emailValidation = false;
let passwordValidation = false;
let confirmPasswordValidation = false;

// Function

// ajustar los estilos
const validador = (event, validation, element) => {
  const information = event.target.parentElement.children[2];
  boton.disabled =
    nameValidation &&
    lastnameValidation &&
    emailValidation &&
    passwordValidation &&
    confirmPasswordValidation
      ? false
      : true;
  if (validation) {
    element.classList.add("true");
    element.classList.remove("false");
    information.classList.remove("show-information");
  } else {
    element.classList.add("false");
    element.classList.remove("true");
    information.classList.add("show-information");
  }
};

// recibir la informacion del input y validar
nameInput.addEventListener("input", (event) => {
  nameValidation = NAME_REGEX.test(event.target.value);
  validador(event, nameValidation, nameInput);
});

lastnameInput.addEventListener("input", (event) => {
  lastnameValidation = NAME_REGEX.test(event.target.value);
  validador(event, lastnameValidation, lastnameInput);
});

emailInput.addEventListener("input", (event) => {
  emailValidation = EMAIL_REGEX.test(event.target.value);
  validador(event, emailValidation, emailInput);
});

passwordInput.addEventListener("input", (event) => {
  passwordValidation = PASSWORD_REGEX.test(event.target.value);
  validador(event, passwordValidation, passwordInput);
});

confirmPasswordInput.addEventListener("input", (event) => {
  confirmPasswordValidation = passwordInput.value === event.target.value;
  validador(event, confirmPasswordValidation, confirmPasswordInput);
  return;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = {
    name: nameInput.value,
    lastname: lastnameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
  };
  alert(
    `Usuario creado exitosamente: \n Nombre: ${user.name} \n Apellido: ${user.lastname} \n Correo: ${user.email}`,
  );
});
