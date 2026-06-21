let allProjects  = [];
let currentFilter = 'all';

// ===================================
// CHARGER PROJETS
// ===================================
const loadProjects = async () => {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    try {
        const res   = await fetch(`${API}/projects`);
        allProjects = await res.json();

        // Stats
        const techs = new Set();
        allProjects.forEach(p => {
            if (p.technologies) {
                p.technologies.split(',').forEach(t => techs.add(t.trim()));
            }
        });

        const statTotal = document.getElementById('statTotal');
        const statTechs = document.getElementById('statTechs');
        if (statTotal) statTotal.textContent = allProjects.length;
        if (statTechs) statTechs.textContent  = techs.size;

        // Filtres dynamiques
        buildFilters();
        renderProjects(allProjects);

    } catch (err) {
        const grid = document.getElementById('projectsGrid');
        if (grid) grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.4);padding:50px;">
                <i class="fas fa-exclamation-circle" style="font-size:2rem;"></i>
                <p style="margin-top:15px;">Impossible de charger les projets</p>
            </div>`;
    }
};

// ===================================
// FILTRES
// ===================================
const buildFilters = () => {
    const section = document.getElementById('filtersSection');
    if (!section) return;

    const techs = new Set();
    allProjects.forEach(p => {
        if (p.technologies) {
            p.technologies.split(',').forEach(t => techs.add(t.trim()));
        }
    });

    section.innerHTML = '<button class="filter-btn active" data-filter="all">Tous</button>';
    techs.forEach(tech => {
        section.innerHTML += `<button class="filter-btn" data-filter="${tech}">${tech}</button>`;
    });

    section.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;

            const filtered = currentFilter === 'all'
                ? allProjects
                : allProjects.filter(p => p.technologies && p.technologies.includes(currentFilter));

            renderProjects(filtered);
        });
    });
};

// ===================================
// AFFICHER PROJETS
// ===================================
const renderProjects = async (projects) => {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (projects.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.4);padding:50px;">
                <i class="fas fa-folder-open" style="font-size:2rem;"></i>
                <p style="margin-top:15px;">Aucun projet dans cette catégorie</p>
            </div>`;
        return;
    }

    grid.innerHTML = '';

    for (let i = 0; i < projects.length; i++) {
        const proj = projects[i];
        const tags = proj.technologies
            ? proj.technologies.split(',').slice(0, 4).map(t =>
                `<span class="tag">${t.trim()}</span>`).join('')
            : '';

        const num = String(i + 1).padStart(2, '0');

        // Charge la première image du projet
        let imageHtml = `<div class="card-icon-wrap"><i class="fas fa-folder-open"></i></div>`;
        try {
            const mediaRes = await fetch(`${API}/projects/${proj.id}/media`);
            const medias   = await mediaRes.json();
            const firstImage = medias.find(m => m.type === 'image');
            if (firstImage) {
                const imgPath = `/${firstImage.path.replace(/\\/g, '/')}`;
                imageHtml = `<img src="${imgPath}" alt="${proj.title}" class="card-cover-img">`;
            }
        } catch (err) {}

        grid.innerHTML += `
            <div class="project-card">
                <div class="card-visual">
                    ${imageHtml}
                    <span class="card-number">${num}</span>
                </div>
                <div class="card-body">
                    <div class="card-category">
                        ${proj.technologies ? proj.technologies.split(',')[0].trim() : 'Web'}
                    </div>
                    <h3 class="card-title">${proj.title}</h3>
                    <p class="card-desc">
                        ${proj.short_description || proj.full_description || 'Projet réalisé par Torf Zoulde.'}
                    </p>
                    <div class="card-tags">${tags}</div>
                   <div class="card-footer">
    <a href="project-details.html?id=${proj.id}" class="btn-project primary">
        <i class="fas fa-eye"></i> Voir détails
    </a>
    ${proj.demo_url
        ? `<a href="${proj.demo_url}" target="_blank" class="btn-project secondary">
            <i class="fas fa-external-link-alt"></i> Démo
           </a>`
        : ''
    }
</div>
                </div>
            </div>
        `;
    }
};
// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadProjects);
