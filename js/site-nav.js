document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".toggle-button");
    const toggleButtonIcon = document.querySelector(".toggle-button i");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (!toggleButton || !toggleButtonIcon || !dropdownMenu) {
        return;
    }

    toggleButton.addEventListener("click", () => {
        dropdownMenu.classList.toggle("open");
        const isOpen = dropdownMenu.classList.contains("open");
        toggleButtonIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });
});
