/**
 * projets-loader.js
 * À inclure dans projets.html APRÈS folio.js
 * 
 * Ce script charge les projets depuis Firestore et les AJOUTE
 * à la grille existante de projets.html (projets statiques conservés).
 * 
 * USAGE dans projets.html, avant </body> :
 *   <script src="projets-loader.js"></script>
 */

(function() {
    'use strict';

    // Couleurs de la bande selon la propriété "color" du projet Firestore
    const BAND_CLASSES = {
        orange: '',       // défaut orange via CSS
        blue:   'network',
        green:  'python',
        purple: 'mobile',
        gold:   'ecom',
        pink:   'server',
    };

    // Libellés de catégorie
    const CAT_LABELS = {
        web:     'Développement Web',
        network: 'Réseaux & Systèmes',
        python:  'Python & Data',
        mobile:  'Mobile',
    };

    // ─── Attendre que Firestore soit prêt ────────────────────────────────────
    function waitForFirestore(cb, tries = 0) {
        if (window.db) { cb(); return; }
        if (tries > 40) { console.warn('[projets-loader] Firestore non disponible'); return; }
        setTimeout(() => waitForFirestore(cb, tries + 1), 150);
    }

    // ─── Injecter les cartes Firestore dans la grille ────────────────────────
    function injectFirestoreProjects(projects) {
        const grid = document.querySelector('.projects-grid');
        if (!grid) return;

        // Mettre à jour le compteur dans le hero
        const totalEl = document.querySelector('.stat-number');
        const staticCount = grid.querySelectorAll('.project-card').length;
        const totalCount  = staticCount + projects.length;
        if (totalEl) totalEl.textContent = totalCount;

        projects.forEach((p, idx) => {
            const visualClass = BAND_CLASSES[p.color] || p.cat || 'web';
            const catLabel    = CAT_LABELS[p.cat] || p.cat || 'Projet';
            const icon        = p.icon || 'fa-code';
            const num         = String(staticCount + idx + 1).padStart(2, '0');
            const tagsHtml    = (p.tags || [])
                .map(t => `<span class="tag">${t}</span>`)
                .join('');

            const linkBtn = p.link
                ? `<a href="${p.link}" target="_blank" class="btn-project btn-primary">
                       <i class="fas fa-external-link-alt"></i> Voir le projet
                   </a>`
                : `<span class="btn-project btn-secondary" style="cursor:default">
                       <i class="fas fa-clock"></i> En cours
                   </span>`;

            const delay = (staticCount + idx) * 0.05;

            const card = document.createElement('div');
            card.className = `project-card`;
            card.dataset.cat = p.cat || 'web';
            card.style.animationDelay = `${delay}s`;
            card.innerHTML = `
                <div class="card-visual ${visualClass}">
                    <span class="card-number">${num}</span>
                    <div class="card-icon-wrap"><i class="fas ${icon}"></i></div>
                </div>
                <div class="card-body">
                    <p class="card-category">${catLabel}</p>
                    <h3 class="card-title">${p.title || 'Sans titre'}</h3>
                    <p class="card-tech">${p.tech || ''}</p>
                    <p class="card-desc">${p.desc || ''}</p>
                    <div class="card-tags">${tagsHtml}</div>
                    <div class="card-footer">${linkBtn}</div>
                </div>
            `;
            grid.appendChild(card);
        });

        // ── Brancher les filtres sur les nouvelles cartes ──────────────────────
        rebindFilters();

        // ── Scroll observer pour les nouvelles cartes ─────────────────────────
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity   = '1';
                    e.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        grid.querySelectorAll('.project-card[data-cat]').forEach(c => {
            if (!c.style.opacity || c.style.opacity === '0') {
                c.style.opacity   = '0';
                c.style.transform = 'translateY(50px)';
                c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(c);
            }
        });
    }

    // ─── Re-brancher les filtres (en cas de cartes ajoutées dynamiquement) ───
    function rebindFilters() {
        const filterBtns   = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card[data-cat]');
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            // Supprimer l'ancien listener en clonant (simple)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                newBtn.classList.add('active');
                const filter = newBtn.dataset.filter;
                let idx = 0;
                document.querySelectorAll('.project-card[data-cat]').forEach(card => {
                    const match = filter === 'all' || card.dataset.cat === filter;
                    card.classList.toggle('hidden', !match);
                    if (match) {
                        card.style.animationDelay  = (idx * 0.07) + 's';
                        card.style.animation       = 'none';
                        void card.offsetHeight; // reflow
                        card.style.animation       = 'fadeInUp 0.5s ease both';
                        idx++;
                    }
                });
            });
        });
    }

    // ─── Point d'entrée ──────────────────────────────────────────────────────
    waitForFirestore(() => {
        window.db.collection('projets')
            .where('visible', '!=', false)
            .orderBy('visible')
            .orderBy('order', 'asc')
            .get()
            .then(snapshot => {
                const projects = [];
                snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
                if (projects.length) injectFirestoreProjects(projects);
            })
            .catch(err => console.warn('[projets-loader] Erreur:', err.message));
    });
})();