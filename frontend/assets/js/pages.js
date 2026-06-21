// ===================================
// CHARGER LES RÉGLAGES DU SITE (thème + couleur)
// ===================================
const applySiteSettings = async () => {
    try {
const res  = await fetch(`${API}/settings`);
        const data = await res.json();

        if (data.primary_color) {
            document.documentElement.style.setProperty('--color-orange-primary', data.primary_color);
        }

        const userTheme = localStorage.getItem('theme');
        if (!userTheme && data.default_theme === 'light') {
            document.body.classList.add('light-mode');
        }

    } catch (err) {
        console.error('Erreur chargement réglages site:', err);
    }
};

applySiteSettings();

// ===================================
// HEADER — Menu mobile + scroll
// ===================================
const menuBtn = document.getElementById('menuBtn');
const nav     = document.getElementById('mainNav');
const header  = document.getElementById('header');

if (menuBtn) {
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const open = nav.classList.toggle('active');
        menuBtn.classList.toggle('active', open);
    });
}

document.addEventListener('click', function(e) {
    if (nav && menuBtn && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('active');
        menuBtn.classList.remove('active');
    }
});

if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ===================================
// SCROLL TO TOP
// ===================================
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===================================
// THEME TOGGLE DANS LE HEADER
// ===================================
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    // Vérifier le thème sauvegardé
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Changer le thème au clic
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// ✅ Supprimer l'ancien theme-toggle flottant s'il existe
const floatingThemeToggle = document.querySelector('.theme-toggle:not(.logo .theme-toggle)');
if (floatingThemeToggle) {
    floatingThemeToggle.remove();
}

// ===================================
// TRACKER VISITEUR
// ===================================
const API = window.location.origin + '/api';

const trackVisitor = async () => {
    try {
        await fetch(`${API}/visitors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: window.location.pathname })
        });
    } catch (err) {}
};

trackVisitor();