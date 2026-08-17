// ===================================
// project-details.js - Détail Projet
// ===================================

//const API = window.location.origin + '/api';

// ===================================
// CHARGER LE PROJET
// ===================================
const loadProjectDetail = async () => {
    const container = document.getElementById('projectDetail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');

    if (!id) {
        container.innerHTML = `
            <div style="text-align:center;padding:150px 5%;color:rgba(255,255,255,0.4);">
                <i class="fas fa-exclamation-circle" style="font-size:2rem;"></i>
                <p style="margin-top:15px;">Projet introuvable</p>
                <a href="projects.html" style="color:var(--color-orange-primary);margin-top:20px;display:inline-block;">
                    ← Retour aux projets
                </a>
            </div>`;
        return;
    }

    try {
        const res  = await fetch(`${API}/projects/${id}`);
        const proj = await res.json();

        if (!proj || !proj.title) {
            container.innerHTML = `
                <div style="text-align:center;padding:150px 5%;color:rgba(255,255,255,0.4);">
                    <p>Projet introuvable</p>
                    <a href="projects.html" style="color:var(--color-orange-primary);margin-top:20px;display:inline-block;">
                        ← Retour aux projets
                    </a>
                </div>`;
            return;
        }

        document.title = `${proj.title} — Torf Zoulde`;

        const tags = proj.technologies
            ? proj.technologies.split(',').map(t =>
                `<span class="tag">${t.trim()}</span>`).join('')
            : '';

        const date = proj.date
            ? new Date(proj.date).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })
            : '';

       // Charge les médias — on sépare vidéos et photos dans deux galeries distinctes
        let mediaHtml = '';
        try {
            const mediaRes = await fetch(`${API}/projects/${id}/media`);
            const medias   = await mediaRes.json();

            const videos = medias.filter(m => m.type === 'video');
            const images = medias.filter(m => m.type === 'image');

            if (videos.length > 0) {
                mediaHtml += `
                    <div class="project-detail-section">
                        <h3><i class="fas fa-video"></i> Vidéos</h3>
                        <div class="project-detail-gallery gallery-videos">
                            ${videos.map(m => `<video src="${m.path}" controls class="gallery-item"></video>`).join('')}
                        </div>
                    </div>`;
            }

            if (images.length > 0) {
                mediaHtml += `
                    <div class="project-detail-section">
                        <h3><i class="fas fa-images"></i> Photos</h3>
                        <div class="project-detail-gallery gallery-images">
                            ${images.map(m => `<img src="${m.path}" alt="${proj.title}" class="gallery-item">`).join('')}
                        </div>
                    </div>`;
            }
        } catch (err) {
            console.error('Erreur chargement médias:', err);
        }

        container.innerHTML = `
            <a href="projects.html" class="project-detail-back">
                <i class="fas fa-arrow-left"></i> Retour aux projets
            </a>

            <div class="project-detail-header">
                <div class="project-detail-cat">
                    ${proj.technologies ? proj.technologies.split(',')[0].trim() : 'Web'}
                </div>
                <h1 class="project-detail-title">${proj.title}</h1>
                <div class="project-detail-meta">
                    ${date ? `<span><i class="fas fa-calendar"></i> ${date}</span>` : ''}
                    ${proj.technologies ? `<span><i class="fas fa-code"></i> ${proj.technologies}</span>` : ''}
                </div>
                <div class="project-detail-tags">${tags}</div>
                <div class="project-detail-links">
                    ${proj.demo_url
                        ? `<a href="${proj.demo_url}" target="_blank" class="btn-project primary">
                            <i class="fas fa-external-link-alt"></i> Voir la démo
                           </a>`
                        : ''}
                    ${proj.github_url
                        ? `<a href="${proj.github_url}" target="_blank" class="btn-project secondary">
                            <i class="fab fa-github"></i> Voir le code
                           </a>`
                        : ''}
                </div>
            </div>

            ${mediaHtml}

            ${proj.short_description ? `
            <div class="project-detail-body">
                <h3><i class="fas fa-info-circle"></i> Résumé</h3>
                <p>${proj.short_description}</p>
            </div>` : ''}

            ${proj.full_description ? `
            <div class="project-detail-body">
                <h3><i class="fas fa-align-left"></i> Description complète</h3>
                <p>${proj.full_description}</p>
            </div>` : ''}
        `;

    } catch (err) {
        container.innerHTML = `
            <div style="text-align:center;padding:150px 5%;color:rgba(255,255,255,0.4);">
                <i class="fas fa-exclamation-circle" style="font-size:2rem;"></i>
                <p style="margin-top:15px;">Impossible de charger le projet</p>
                <a href="projects.html" style="color:var(--color-orange-primary);margin-top:20px;display:inline-block;">
                    ← Retour aux projets
                </a>
            </div>`;
    }
};

document.addEventListener('DOMContentLoaded', loadProjectDetail);