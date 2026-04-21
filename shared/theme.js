/* Theme Toggle – dark mode is default */
function toggleTheme() {
    document.documentElement.classList.toggle('light-mode');
    var isLight = document.documentElement.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeUI();
}

function updateThemeUI() {
    var isLight = document.documentElement.classList.contains('light-mode');
    var label = document.getElementById('themeLabel');
    if (label) {
        label.textContent = isLight ? 'Dark' : 'Light';
    }
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    }
    document.querySelectorAll('.logo-img').forEach(function(img) {
        img.src = isLight ? 'shared/AB logo.png' : 'shared/AB logo light.png';
    });
}

document.addEventListener('DOMContentLoaded', updateThemeUI);
