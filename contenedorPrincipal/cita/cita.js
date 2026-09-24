document.addEventListener("DOMContentLoaded", () => {
  const customSelect = document.getElementById("custom-select");
  const selectTrigger = document.querySelector(".select-trigger");
  const selectedVehicleText = document.getElementById("selected-vehicle");
  const searchInput = document.getElementById("search-input");
  const optionsList = document.querySelectorAll(".options-list li");
  const hiddenVehicleInput = document.getElementById("hidden-vehicle");

  // 1. Abrir/Cerrar el menú desplegable
  selectTrigger.addEventListener("click", () => {
    customSelect.classList.toggle("active");
    if (customSelect.classList.contains("active")) {
      searchInput.focus(); // Enfocar el buscador automáticamente al abrir
    }
  });

  // 2. Filtrar opciones con el buscador
  searchInput.addEventListener("input", (e) => {
    const filterText = e.target.value.toLowerCase();

    optionsList.forEach((option) => {
      const text = option.textContent.toLowerCase();
      // Si el texto de la opción incluye lo que escribimos, se muestra, sino se oculta
      if (text.includes(filterText)) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
  });

  // 3. Seleccionar una opción de la lista
  optionsList.forEach((option) => {
    option.addEventListener("click", () => {
      // Reemplazar el texto del botón por el elegido
      selectedVehicleText.textContent = option.textContent;
      selectedVehicleText.style.color = "#ffffff";

      // Asignar el valor al input oculto para enviarlo al servidor
      hiddenVehicleInput.value = option.getAttribute("data-value");

      // Cerrar el menú y limpiar el buscador
      customSelect.classList.remove("active");
      searchInput.value = "";

      // Restaurar todas las opciones para la próxima vez que se abra
      optionsList.forEach((opt) => (opt.style.display = "block"));
    });
  });

  // 4. Cerrar el desplegable si se hace click fuera de él
  document.addEventListener("click", (e) => {
    if (!customSelect.contains(e.target)) {
      customSelect.classList.remove("active");
    }
  });
});
