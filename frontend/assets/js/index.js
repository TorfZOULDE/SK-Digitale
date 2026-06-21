// ===================================
// CONFIG API
// ===================================
const API = "http://localhost:3000/api"; 
// ou l’URL de ton backend en ligne

// ===================================
// CHARGER LES RÉGLAGES DU SITE (thème + couleur)
// ===================================
const applySiteSettings = async () => {
    try {
        const res  = await fetch('http://localhost:3000/api/settings');
        const data = await res.json();

        // Applique la couleur principale
        if (data.primary_color) {
            document.documentElement.style.setProperty('--color-orange-primary', data.primary_color);
        }

        // Applique le thème par défaut SEULEMENT si le visiteur n'a jamais choisi
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

menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const open = nav.classList.toggle('active');
    menuBtn.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', open);
});

document.addEventListener('click', function(e) {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
});

nav.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    });
});

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});


// ===================================
// HERO — Effet de frappe
// ===================================
const phrases = [
    'Développeur Web & Mobile',
    'Administrateur Systèmes & Réseaux',
    'Passionné de Cybersécurité',
];

const typedEl   = document.querySelector('.typed-text');
let phraseIndex = 0;
let charIndex   = 0;
let isDeleting  = false;

function type() {
    const current = phrases[phraseIndex];

    typedEl.textContent = isDeleting
        ? current.slice(0, charIndex - 1)
        : current.slice(0, charIndex + 1);

    isDeleting ? charIndex-- : charIndex++;

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === current.length) {
        speed = 1800;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
    }

    setTimeout(type, speed);
}

setTimeout(type, 800);


// ===================================
// TOGGLE — Fonction réutilisable
// ===================================
function initToggle(btnId, moreId, cardSelector) {
    const btn  = document.getElementById(btnId);
    const more = document.getElementById(moreId);
    const card = document.querySelector(cardSelector);

    if (!btn || !more) return;

    btn.addEventListener('click', function () {
        const isOpen = more.classList.toggle('open');
        btn.classList.toggle('active', isOpen);
        btn.setAttribute('aria-expanded', isOpen);

        if (card) {
            card.style.borderRadius = isOpen ? '20px 20px 0 0' : '20px';
            card.style.borderBottom = isOpen ? 'none' : '';
        }
    });
}

initToggle('aproposToggle', 'aproposMore', '.apropos-card');


// ===================================
// PROJETS & TEASER — Chargement API
// ===================================
let allProjects  = [];
let currentSlide = 0;

const renderProjects = async (projects) => {
    const grid = document.getElementById('projects-grid');
    const nav  = document.getElementById('projets-nav');
    if (!grid) return;

    grid.innerHTML = '';
    nav.innerHTML  = '';

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];

        // Charge la première image
        let imageHtml = `<i class="fas fa-folder-open"></i>`;
        try {
            const mediaRes = await fetch(`${API}/projects/${project.id}/media`);
            const medias   = await mediaRes.json();
            const firstImage = medias.find(m => m.type === 'image');
            if (firstImage) {
                const imgPath = `/${firstImage.path.replace(/\\/g, '/')}`;
                imageHtml = `<img src="${imgPath}" alt="${project.title}" style="width:100%;height:100%;object-fit:cover;">`;
            }
        } catch (err) {}

        grid.innerHTML += `
            <div class="projet-card">
                <div class="projet-card-img">
                    ${imageHtml}
                </div>
                <div class="projet-card-body">
                    <h3>${project.title}</h3>
                    <p class="projet-cat">
                        <i class="fas fa-tag"></i>
                        Web Design / ${project.technologies || 'Web'}
                    </p>
                    <a href="pages/project-details.html?id=${project.id}"
                       class="btn-primary"
                       style="font-size:0.85rem;padding:0.6rem 1.2rem;">
                        <i class="fas fa-eye"></i> Voir le projet
                    </a>
                </div>
            </div>
        `;

        const dot = document.createElement('button');
        dot.classList.add('projets-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentSlide = i;
            updateDots();
        });
        nav.appendChild(dot);
    }
};
const updateDots = () => {
    document.querySelectorAll('.projets-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
};

const loadProjects = async () => {
    const grid    = document.getElementById('projects-grid');
    const teaserGrid = document.getElementById('teaser-grid');
    const teaserSub  = document.getElementById('teaser-sub');
    if (!grid) return;

    try {
        const res   = await fetch(`${API}/projects`);
        allProjects = await res.json();

        // Teaser sub
        if (teaserSub) {
            teaserSub.textContent = `${allProjects.length} projet(s) • Filtres par catégorie • Liens vers les démos`;
        }

        // Teaser catégories dynamiques
        if (teaserGrid) {
            const categories = {};
            allProjects.forEach(p => {
                const cat = p.technologies ? p.technologies.split(',')[0].trim() : 'Web';
                categories[cat] = (categories[cat] || 0) + 1;
            });

            const icons = {
                'HTML': 'fas fa-code',
                'CSS': 'fas fa-paint-brush',
                'JavaScript': 'fab fa-js',
                'Node.js': 'fab fa-node-js',
                'React': 'fab fa-react',
                'PHP': 'fab fa-php',
                'Laravel': 'fab fa-laravel',
                'Python': 'fab fa-python',
                'MySQL': 'fas fa-database',
                'Linux': 'fab fa-linux',
            };

            const colors = [
                'var(--gradient-orange)',
                'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                'linear-gradient(135deg, #10b981, #059669)',
                'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            ];

            Object.entries(categories).slice(0, 4).forEach(([cat, count], i) => {
                const icon = icons[cat] || 'fas fa-folder';
                teaserGrid.innerHTML += `
                    <div class="teaser-card">
                        <div class="teaser-icon" style="background: ${colors[i % colors.length]}">
                            <i class="${icon}"></i>
                        </div>
                        <h4>${cat} <span class="teaser-count">${count}</span></h4>
                        <p>Projets réalisés</p>
                    </div>
                `;
            });

            if (Object.keys(categories).length === 0) {
                teaserGrid.innerHTML = '';
            }
        }

        if (allProjects.length === 0) {
            grid.innerHTML = `
                <p style="color:rgba(255,255,255,0.5);
                           text-align:center;
                           grid-column:1/-1;
                           padding:2rem;">
                    Aucun projet pour le moment.
                </p>`;
            return;
        }

        allProjects = allProjects.slice(0, 3);
        renderProjects(allProjects);

        // Carousel automatique
        setInterval(() => {
            currentSlide = (currentSlide + 1) % allProjects.length;
            updateDots();
        }, 3000);

    } catch (err) {
        grid.innerHTML = `
            <p style="color:rgba(255,255,255,0.5);
                       text-align:center;
                       grid-column:1/-1;
                       padding:2rem;">
                <i class="fas fa-exclamation-circle"></i>
                Impossible de charger les projets.
            </p>`;
    }
};

loadProjects();

// ===================================
// COMPÉTENCES — Barres de progression
// ===================================
const initSkillBars = () => {
    const bars = document.querySelectorAll('.skill-progress');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
};

initSkillBars();


// ===================================
// EXPÉRIENCES — Chargement API
// ===================================
const loadExperiences = async () => {
    const grid = document.getElementById('experience-grid');
    if (!grid) return;

    try {
        const res = await fetch(`${API}/experiences`);
        const experiences = await res.json();

        if (experiences.length === 0) return;

        grid.innerHTML = '';
        experiences.forEach(exp => {
            const tasks = typeof exp.tasks === 'string'
                ? JSON.parse(exp.tasks)
                : exp.tasks;

            grid.innerHTML += `
                <div class="experience-card">
                    <div class="exp-header">
                        <i class="${exp.icon}"></i>
                        <h3>${exp.title}</h3>
                    </div>
                    <p class="exp-company">${exp.company}</p>
                    <p class="exp-date">${exp.date_range}</p>
                    <ul class="exp-tasks">
                        ${tasks.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

    } catch (err) {
        console.error('Erreur chargement expériences:', err);
    }
};

loadExperiences();


// ===================================
// CONTACT — Formulaire
// ===================================
const btnShowForm = document.getElementById('btnShowForm');
const formContact = document.getElementById('form-contact');

btnShowForm.addEventListener('click', () => {
    formContact.classList.toggle('active');
    btnShowForm.innerHTML = formContact.classList.contains('active')
        ? '<i class="fas fa-times"></i> Fermer'
        : '<i class="fas fa-paper-plane"></i> Envoyer un message';
});

const btnSubmit = document.getElementById('btnSubmit');

btnSubmit.addEventListener('click', async () => {
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const status  = document.getElementById('contact-status');

    if (!name || !email || !message) {
        status.textContent = '⚠️ Veuillez remplir tous les champs obligatoires.';
        status.style.color = '#ff4444';
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

    try {
        const res = await fetch(`${API}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
        });

        const data = await res.json();

        if (res.ok) {
            status.textContent = '✅ Message envoyé avec succès !';
            status.style.color = '#10b981';
            document.getElementById('contact-name').value    = '';
            document.getElementById('contact-email').value   = '';
            document.getElementById('contact-subject').value = '';
            document.getElementById('contact-message').value = '';
        } else {
            status.textContent = '❌ Erreur : ' + data.message;
            status.style.color = '#ff4444';
        }
    } catch (err) {
        status.textContent = '❌ Impossible de contacter le serveur.';
        status.style.color = '#ff4444';
    }

    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer';
});


// ===================================
// SCROLL TO TOP
// ===================================
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===================================
// THEME TOGGLE — Sombre / Clair
// ===================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('i');

// Charge le thème sauvegardé
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
}

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    themeIcon.classList.replace(
        isLight ? 'fa-sun'  : 'fa-moon',
        isLight ? 'fa-moon' : 'fa-sun'
    );
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});


// ===================================
// BANDEAU ANNONCES DÉFILANT — Style ticker TV
// ===================================
const loadAnnouncements = async () => {
    const track = document.getElementById('announcementTrack');
    const bar   = document.getElementById('announcementBar');
    if (!track) return;

    try {
        const res = await fetch(`${API}/announcements/active`);
        const announcements = await res.json();

        if (announcements.length === 0) {
            if (bar) bar.style.display = 'none';
            return;
        }

        const buildItems = () => announcements.map(a => `
            <div class="announcement-item">
                <i class="${a.icon || 'fas fa-bullhorn'}"></i>
                <span>${a.text}</span>
            </div>
            <span class="announcement-divider"><i class="fas fa-circle"></i></span>
        `).join('');

        track.innerHTML = buildItems() + buildItems();

    } catch (err) {
        console.error('Erreur chargement annonces:', err);
        if (bar) bar.style.display = 'none';
    }
};

loadAnnouncements();