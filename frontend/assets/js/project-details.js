// ===================================
// project-details.js - Détail Projet
// ===================================

//const API = 'http://localhost:3000/api';

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

        // Charge les médias (images + vidéos)
        let mediaHtml = '';
        try {
            const mediaRes = await fetch(`${API}/projects/${id}/media`);
            const medias   = await mediaRes.json();

            if (medias.length > 0) {
                mediaHtml = `<div class="project-detail-gallery">`;
                medias.forEach(m => {
                    const filePath = `/${m.path.replace(/\\/g, '/')}`;
                    if (m.type === 'image') {
                        mediaHtml += `<img src="${filePath}" alt="${proj.title}" class="gallery-item">`;
                    } else {
                        mediaHtml += `<video src="${filePath}" controls class="gallery-item"></video>`;
                    }
                });
                mediaHtml += `</div>`;
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

// ===================================
// AFFICHER LE PROJET
// ===================================
const renderProjectDetail = (container, project) => {
    // Nettoyer les technologies
    const technologies = project.technologies 
        ? project.technologies.split(',').map(t => t.trim()) 
        : [];

    // Date formatée
    const date = project.date 
        ? new Date(project.date).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
          })
        : 'Date non spécifiée';

    container.innerHTML = `
        <a href="projects.html" class="project-detail-back">
            <i class="fas fa-arrow-left"></i> Retour aux projets
        </a>

        <div class="project-detail-header">
            <div class="project-detail-cat">${project.category || 'Projet'}</div>
            <h1 class="project-detail-title">${project.title}</h1>
            <div class="project-detail-meta">
                <span><i class="fas fa-calendar"></i> ${date}</span>
                ${project.github_url ? `<span><i class="fab fa-github"></i> <a href="${project.github_url}" target="_blank" style="color:var(--color-orange-light);text-decoration:none;">GitHub</a></span>` : ''}
                ${project.demo_url ? `<span><i class="fas fa-external-link-alt"></i> <a href="${project.demo_url}" target="_blank" style="color:var(--color-orange-light);text-decoration:none;">Démo</a></span>` : ''}
            </div>
            ${technologies.length > 0 ? `
                <div class="project-detail-tags">
                    ${technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
            ` : ''}
            <div class="project-detail-links">
                ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="btn-project primary"><i class="fab fa-github"></i> Voir sur GitHub</a>` : ''}
                ${project.demo_url ? `<a href="${project.demo_url}" target="_blank" class="btn-project primary"><i class="fas fa-external-link-alt"></i> Voir la démo</a>` : ''}
            </div>
        </div>

        ${project.full_description ? `
            <div class="project-detail-body">
                <h3><i class="fas fa-align-left"></i> Description complète</h3>
                <p>${project.full_description}</p>
            </div>
        ` : ''}

        ${project.short_description ? `
            <div class="project-detail-body">
                <h3><i class="fas fa-file-alt"></i> Résumé</h3>
                <p>${project.short_description}</p>
            </div>
        ` : ''}

        <!-- Affichage des médias -->
        <div id="projectMedia" style="margin-top:30px;">
            <h3 style="font-family:var(--font-display);color:var(--color-white);margin-bottom:20px;">
                <i class="fas fa-images" style="color:var(--color-orange-primary);"></i> Médias du projet
            </h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;" id="mediaGrid">
                <div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.3);padding:30px;">
                    <i class="fas fa-spinner fa-spin"></i> Chargement des médias...
                </div>
            </div>
        </div>
    `;

    // Charger les médias
    loadProjectMedia(project.id);
};

// ===================================
// CHARGER LES MÉDIAS DU PROJET
// ===================================
const loadProjectMedia = async (projectId) => {
    const mediaGrid = document.getElementById('mediaGrid');
    if (!mediaGrid) return;

    try {
        const res = await fetch(`${API}/projects/${projectId}/media`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const media = await res.json();
        console.log('📷 Médias reçus:', media);

        if (media.length === 0) {
            mediaGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.3);padding:20px;">
                    <i class="fas fa-image" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
                    Aucun média associé à ce projet
                </div>
            `;
            return;
        }

        mediaGrid.innerHTML = '';
        media.forEach(item => {
            if (item.type === 'image') {
                mediaGrid.innerHTML += `
                    <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                        <img src="${item.url}" alt="Image du projet" style="width:100%;height:200px;object-fit:cover;">
                    </div>
                `;
            } else if (item.type === 'video') {
                mediaGrid.innerHTML += `
                    <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                        <video src="${item.url}" style="width:100%;height:200px;object-fit:cover;" controls></video>
                    </div>
                `;
            }
        });

    } catch (err) {
        console.error('❌ Erreur chargement médias:', err);
        mediaGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.3);padding:20px;">
                <i class="fas fa-exclamation-circle" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
                Erreur chargement des médias
            </div>
        `;
    }
};

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadProjectDetail);