// ===================================
// CANVAS BACKGROUND ANIMATION
// Bleu sur index.html, Orange sur projets.html
// ===================================
const canvas = document.getElementById('creative-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');

    const isProjectsPage = document.body.classList.contains('page-projets');
    const particleColor  = isProjectsPage ? 'rgba(255, 107, 53, 0.5)' : 'rgba(14, 165, 233, 0.6)';
    const lineColorFn    = isProjectsPage
        ? (a) => `rgba(255, 107, 53, ${a * 0.3})`
        : (a) => `rgba(14, 165, 233, ${a})`;

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 50 : 100;

    class Particle {
        constructor() {
            this.x      = Math.random() * canvas.width;
            this.y      = Math.random() * canvas.height;
            this.vx     = (Math.random() - 0.5) * 0.8;
            this.vy     = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = lineColorFn(1 - dist / 120);
                    ctx.lineWidth   = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
}

// ===================================
// MENU MOBILE — CORRECTION
// ===================================
const menuBtn = document.getElementById('menuBtn');
const menu    = document.getElementById('menu');

if (menuBtn && menu) {
    // ✅ FIX : utiliser addEventListener sur le bouton hamburger
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isActive = menu.classList.toggle('active');
        menuBtn.classList.toggle('active', isActive);
    });

    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
            menu.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });

    // Fermer le menu quand on clique sur un lien
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            menuBtn.classList.remove('active');
        });
    });
}

// ===================================
// VOIR PLUS / MOINS PARCOURS
// ===================================
const btnVoirParcours = document.getElementById('btn-voir-parcours');
const parcoursComplet = document.getElementById('parcours-complet');
if (btnVoirParcours && parcoursComplet) {
    btnVoirParcours.addEventListener('click', () => {
        const isHidden = parcoursComplet.style.display === 'none' || parcoursComplet.style.display === '';
        if (isHidden) {
            parcoursComplet.style.display = 'block';
            btnVoirParcours.innerHTML = '<i class="fas fa-chevron-up"></i> Voir moins';
            btnVoirParcours.classList.add('active');
            setTimeout(() => {
                parcoursComplet.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            parcoursComplet.style.display = 'none';
            btnVoirParcours.innerHTML = '<i class="fas fa-chevron-down"></i> Voir plus';
            btnVoirParcours.classList.remove('active');
        }
    });
}

// ===================================
// ANIMATIONS AU SCROLL
// ===================================
const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

document.querySelectorAll(
    '.timeline-item, .experience-card, .skill-category, .soft-skill-card, .teaser-card'
).forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(50px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    scrollObserver.observe(el);
});

// ===================================
// BARRES DE COMPETENCES
// ===================================
const skillBars     = document.querySelectorAll('.skill-progress');
const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar   = entry.target;
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => { bar.style.width = width; }, 100);
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });
skillBars.forEach(bar => skillObserver.observe(bar));

// ===================================
// NOTIFICATIONS
// ===================================
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    const icon = type === 'success' ? 'fa-check-circle'
               : type === 'error'   ? 'fa-exclamation-circle'
               : 'fa-info-circle';
    notif.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
        notif.style.transform = 'translateX(0)';
        notif.style.opacity   = '1';
    });
    setTimeout(() => {
        notif.style.transform = 'translateX(400px)';
        notif.style.opacity   = '0';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

// ===================================
// FORMULAIRE CONTACT → FIRESTORE
// ✅ CORRECTION : attendre que Firebase soit prêt
// ===================================
const btnContact  = document.getElementById('btn-contact');
const formContact = document.getElementById('form-contact');

if (btnContact && formContact) {
    // Afficher / Masquer le formulaire
    btnContact.addEventListener('click', () => {
        formContact.classList.toggle('active');
        btnContact.innerHTML = formContact.classList.contains('active')
            ? '<i class="fas fa-times"></i> Fermer le formulaire'
            : '<i class="fas fa-paper-plane"></i> Envoyer un message';
    });

    // Soumission du formulaire
    formContact.addEventListener('submit', async function(e) {
        e.preventDefault();

        // ✅ FIX : vérifier que window.db est disponible avant d'envoyer
        if (!window.db) {
            showNotification('Erreur : connexion à la base de données impossible.', 'error');
            return;
        }

        const nom     = document.getElementById('nom').value.trim();
        const email   = document.getElementById('email').value.trim();
        const sujet   = document.getElementById('sujet').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!nom || !email || !sujet || !message) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }

        const submitBtn    = formContact.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled  = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

        try {
            // ✅ FIX : utiliser window.firebaseFirestore.FieldValue pour le timestamp
            await window.db.collection('messages').add({
                nom,
                email,
                sujet,
                message,
                lu: false,
                createdAt: window.firebaseFirestore.FieldValue.serverTimestamp()
            });

            showNotification('Message envoyé avec succès ! 🎉', 'success');
            formContact.reset();
            formContact.classList.remove('active');
            btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';

        } catch (err) {
            console.error('Erreur Firestore :', err);
            showNotification("Impossible d'envoyer le message. Réessayez.", 'error');
        } finally {
            submitBtn.disabled  = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}

// ===================================
// FILTRES PROJETS (projets.html)
// ===================================
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-cat]');

if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            let visibleIndex = 0;

            projectCards.forEach(card => {
                const cat = card.dataset.cat;
                if (filter === 'all' || cat === filter) {
                    card.classList.remove('hidden');
                    card.style.animation      = 'none';
                    card.style.animationDelay = (visibleIndex * 0.07) + 's';
                    card.offsetHeight;
                    card.style.animation = 'fadeInUp 0.5s ease both';
                    visibleIndex++;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// ===================================
// LOGIN ADMIN FIREBASE
// ===================================
const loginForm        = document.getElementById('login-form');
const errorMessage     = document.getElementById('error-message');
const errorText        = document.getElementById('error-text');
const loadingIndicator = document.getElementById('loading-indicator');
const togglePassword   = document.getElementById('toggle-password');

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = togglePassword.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
}

if (loginForm) {
    // Redirection automatique si déjà connecté
    window.auth.onAuthStateChanged(user => {
        if (user) {
            window.location.href = 'Messages.html';
        }
    });

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();

        if (errorMessage)     errorMessage.style.display = 'none';
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        const submitBtn = loginForm.querySelector('.btn-login');
        if (submitBtn) submitBtn.style.display = 'none';

        const usernameVal = document.getElementById('username').value.trim();
        const passwordVal = document.getElementById('password').value;

        // Firebase Auth nécessite un email valide
        const email = usernameVal.includes('@') ? usernameVal : usernameVal + '@skdigitale.com';

        try {
            await window.auth.signInWithEmailAndPassword(email, passwordVal);
            window.location.href = 'Messages.html';
        } catch (err) {
            console.error('Erreur login :', err.code);
            const erreurs = {
                'auth/user-not-found':         'Aucun compte trouvé avec cet identifiant.',
                'auth/wrong-password':         'Mot de passe incorrect.',
                'auth/invalid-email':          "Format d'email invalide.",
                'auth/too-many-requests':      'Trop de tentatives. Réessayez plus tard.',
                'auth/user-disabled':          'Ce compte a été désactivé.',
                'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',
                'auth/invalid-credential':     'Identifiant ou mot de passe incorrect.',
            };
            if (errorText)    errorText.textContent = erreurs[err.code] || 'Erreur de connexion.';
            if (errorMessage) errorMessage.style.display = 'flex';
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'flex';
        }
    });
}

// ===================================
// SCROLL TO TOP
// ===================================
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===================================
// SMOOTH SCROLL (ancres #)
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===================================
// HEADER OMBRE AU SCROLL
// ===================================
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.pageYOffset > 100
            ? '0 4px 20px rgba(0,0,0,0.5)'
            : '0 4px 16px rgba(0,0,0,0.4)';
    });
}

// ===================================
// PHOTO HERO HOVER
// ===================================
const photoFrame = document.querySelector('.photo-frame');
if (photoFrame) {
    photoFrame.addEventListener('mouseenter', () => {
        photoFrame.style.transform = 'scale(1.05) rotate(5deg)';
    });
    photoFrame.addEventListener('mouseleave', () => {
        photoFrame.style.transform = 'scale(1) rotate(0deg)';
    });
}

// ===================================
// PAGE LOADED
// ===================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    if (photoFrame) {
        setTimeout(() => {
            photoFrame.style.opacity   = '1';
            photoFrame.style.transform = 'scale(1)';
        }, 500);
    }
});

// ===================================
// DETECTION MOBILE
// ===================================
if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    document.body.classList.add('mobile');
}