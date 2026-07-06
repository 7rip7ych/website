/**
 * @module responsive
 */

// toggle nav
const menuToggle = document.getElementById('menu-toggle')
const navLinks = document.getElementById('nav-links')
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show')
    })
}
