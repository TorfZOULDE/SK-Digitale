let editingId  = null;
let deletingId = null;
let allProjects = [];
let selectedImages = [];
let selectedVideos = [];

// ===================================
// CHARGER PROJETS
// ===================================

console.log("loadProjects called", new Date().toISOString());

const loadProjects = async () => {
    const tbody = document.getElementById('projectsTable');
    if (!tbody) return;

    try {
        const res   = await fetch(`${API}/projects`);
        allProjects = await res.json();
        renderProjects(allProjects);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty">
            <i class="fas fa-exclamation-circle"></i> Erreur chargement
        </td></tr>`;
    }
};

const renderProjects = (projects) => {
    const tbody = document.getElementById('projectsTable');
    const isMobile = window.innerWidth <= 768;
    console.log("Rendering projects:", projects.length);

    if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty">
            <i class="fas fa-folder-open"></i> Aucun projet pour le moment
        </td></tr>`;

        // Vide aussi la liste mobile
        const mobileList = document.getElementById('projMobileList');
        if (mobileList) mobileList.innerHTML = `
            <div style="text-align:center;color:#9ca3af;padding:30px;font-size:0.85rem;">
                <i class="fas fa-folder-open"></i><br>Aucun projet pour le moment
            </div>`;
        return;
    }

    // TABLE desktop
    tbody.innerHTML = '';
    projects.forEach(proj => {
        const techs = proj.technologies
            ? proj.technologies.split(',').map(t =>
                `<span class="tech-badge">${t.trim()}</span>`).join('')
            : '—';

        const date = proj.date
            ? new Date(proj.date).toLocaleDateString('fr-FR')
            : '—';

        tbody.innerHTML += `
            <tr>
                <td><strong>${proj.title}</strong></td>
                <td>${techs}</td>
                <td>${date}</td>
                <td>
                    <span style="font-size:0.78rem;color:#6b7280;">
                        <i class="fas fa-images"></i> Photos/Vidéos
                    </span>
                </td>
                <td>
                    ${proj.github_url ? `<a href="${proj.github_url}" target="_blank" class="btn-link"><i class="fab fa-github"></i> GitHub</a>` : '—'}
                    ${proj.demo_url   ? `<a href="${proj.demo_url}"   target="_blank" class="btn-link"><i class="fas fa-external-link-alt"></i> Démo</a>` : ''}
                </td>
                <td>
                    <div class="table-actions-btns">
                        <button class="btn-edit" onclick="openEdit(${proj.id})">
                            <i class="fas fa-pencil-alt"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="openDelete(${proj.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    // CARTES mobile
    const mobileList = document.getElementById('projMobileList');
    if (!mobileList) return;

    mobileList.innerHTML = '';
    projects.forEach(proj => {
        const techs = proj.technologies
            ? proj.technologies.split(',').map(t =>
                `<span class="tech-badge">${t.trim()}</span>`).join('')
            : '';

        const date = proj.date
            ? new Date(proj.date).toLocaleDateString('fr-FR')
            : '';

        mobileList.innerHTML += `
            <div class="proj-mobile-card">
                <div class="proj-mobile-card-header">
                    <span class="proj-mobile-title">${proj.title}</span>
                    <span class="proj-mobile-date">${date}</span>
                </div>
                <div class="proj-mobile-techs">${techs}</div>
                <div class="proj-mobile-links">
                    ${proj.github_url ? `<a href="${proj.github_url}" target="_blank" class="btn-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
                    ${proj.demo_url   ? `<a href="${proj.demo_url}"   target="_blank" class="btn-link"><i class="fas fa-external-link-alt"></i> Démo</a>` : ''}
                </div>
                <div class="proj-mobile-actions">
                    <button class="btn-edit" onclick="openEdit(${proj.id})">
                        <i class="fas fa-pencil-alt"></i> Modifier
                    </button>
                    <button class="btn-delete" onclick="openDelete(${proj.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    });
};

// ===================================
// RECHERCHE
// ===================================
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = allProjects.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.technologies && p.technologies.toLowerCase().includes(q))
        );
        renderProjects(filtered);
    });
}

// ===================================
// ONGLETS
// ===================================
document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
});

// ===================================
// UPLOAD IMAGES
// ===================================
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

if (imageInput) {
    imageInput.addEventListener('change', () => {
        Array.from(imageInput.files).forEach(file => {
            selectedImages.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML += `
                    <div class="media-thumb" id="img-${selectedImages.length - 1}">
                        <img src="${e.target.result}" alt="${file.name}">
                        <button class="media-thumb-remove" onclick="removeImage(${selectedImages.length - 1})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        });
    });
}

const removeImage = (index) => {
    selectedImages.splice(index, 1);
    const thumb = document.getElementById(`img-${index}`);
    if (thumb) thumb.remove();
};

// Drag & Drop images
const imageZone = document.getElementById('imageUploadZone');
if (imageZone) {
    imageZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageZone.classList.add('drag-over');
    });
    imageZone.addEventListener('dragleave', () => imageZone.classList.remove('drag-over'));
    imageZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageZone.classList.remove('drag-over');
        imageInput.files = e.dataTransfer.files;
        imageInput.dispatchEvent(new Event('change'));
    });
}

// ===================================
// UPLOAD VIDÉOS
// ===================================
const videoInput = document.getElementById('videoInput');
const videoPreview = document.getElementById('videoPreview');

if (videoInput) {
    videoInput.addEventListener('change', () => {
        Array.from(videoInput.files).forEach(file => {
            selectedVideos.push(file);
            videoPreview.innerHTML += `
                <div class="media-thumb">
                    <video src="${URL.createObjectURL(file)}"></video>
                    <button class="media-thumb-remove" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
    });
}

// Drag & Drop vidéos
const videoZone = document.getElementById('videoUploadZone');
if (videoZone) {
    videoZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        videoZone.classList.add('drag-over');
    });
    videoZone.addEventListener('dragleave', () => videoZone.classList.remove('drag-over'));
    videoZone.addEventListener('drop', (e) => {
        e.preventDefault();
        videoZone.classList.remove('drag-over');
        videoInput.files = e.dataTransfer.files;
        videoInput.dispatchEvent(new Event('change'));
    });
}

// ===================================
// MODAL AJOUTER / MODIFIER
// ===================================
const openModal = () => {
    document.getElementById('projectModal').classList.add('active');
    // Reset onglets
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.modal-tab').classList.add('active');
    document.getElementById('tab-infos').classList.add('active');
};

const closeModal = () => {
    document.getElementById('projectModal').classList.remove('active');
    resetForm();
    editingId = null;
};

const resetForm = () => {
    document.getElementById('projTitle').value     = '';
    document.getElementById('projTech').value      = '';
    document.getElementById('projShortDesc').value = '';
    document.getElementById('projFullDesc').value  = '';
    document.getElementById('projGithub').value    = '';
    document.getElementById('projDemo').value      = '';
    document.getElementById('projDate').value      = '';
    if (imagePreview) imagePreview.innerHTML = '';
    if (videoPreview) videoPreview.innerHTML = '';
    selectedImages = [];
    selectedVideos = [];
};

const btnAddProject = document.getElementById('btnAddProject');
if (btnAddProject) {
    btnAddProject.addEventListener('click', () => {
        editingId = null;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouveau projet';
        resetForm();
        openModal();
    });
}

const closeProjectModal = document.getElementById('closeProjectModal');
if (closeProjectModal) closeProjectModal.addEventListener('click', closeModal);

const cancelProject = document.getElementById('cancelProject');
if (cancelProject) cancelProject.addEventListener('click', closeModal);

const projectModal = document.getElementById('projectModal');
if (projectModal) {
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) closeModal();
    });
}

const openEdit = async (id) => {
    const proj = allProjects.find(p => p.id === id);
    if (!proj) return;

    editingId = id;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-pencil-alt"></i> Modifier le projet';
    document.getElementById('projTitle').value     = proj.title || '';
    document.getElementById('projTech').value      = proj.technologies || '';
    document.getElementById('projShortDesc').value = proj.short_description || '';
    document.getElementById('projFullDesc').value  = proj.full_description || '';
    document.getElementById('projGithub').value    = proj.github_url || '';
    document.getElementById('projDemo').value      = proj.demo_url || '';
    document.getElementById('projDate').value      = proj.date ? proj.date.split('T')[0] : '';

    // Réinitialise les médias sélectionnés
    selectedImages = [];
    selectedVideos = [];
    imagePreview.innerHTML = '';
    videoPreview.innerHTML = '';

    // Charge les médias existants
    try {
        const res    = await fetch(`${API}/projects/${id}/media`);
        const medias = await res.json();

        medias.forEach(media => {
            const filePath = `/${media.path.replace(/\\/g, '/')}`;
            if (media.type === 'image') {
                imagePreview.innerHTML += `
                    <div class="media-thumb" id="existing-img-${media.id}">
                        <img src="${filePath}" alt="média">
                        <button class="media-thumb-remove" onclick="removeExistingMedia(${media.id}, 'existing-img-${media.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            } else {
                videoPreview.innerHTML += `
                    <div class="media-thumb" id="existing-vid-${media.id}">
                        <video src="${filePath}"></video>
                        <button class="media-thumb-remove" onclick="removeExistingMedia(${media.id}, 'existing-vid-${media.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }
        });
    } catch (err) {
        console.error('Erreur chargement médias:', err);
    }

    openModal();
};

// ===================================
// SUPPRIMER MÉDIA EXISTANT
// ===================================
const removeExistingMedia = async (mediaId, elementId) => {
    if (!editingId) return;
    try {
        await fetch(`${API}/projects/${editingId}/media/${mediaId}`, {
            method: 'DELETE',
            headers: window.authHeaders
        });
        const el = document.getElementById(elementId);
        if (el) el.remove();
    } catch (err) {
        alert('Erreur lors de la suppression du média.');
    }
};

// ===================================
// SAUVEGARDER PROJET
// ===================================
const saveProject = document.getElementById('saveProject');
if (saveProject) {
    saveProject.addEventListener('click', async () => {
        const title             = document.getElementById('projTitle').value.trim();
        const technologies      = document.getElementById('projTech').value.trim();
        const short_description = document.getElementById('projShortDesc').value.trim();
        const full_description  = document.getElementById('projFullDesc').value.trim();
        const github_url        = document.getElementById('projGithub').value.trim();
        const demo_url          = document.getElementById('projDemo').value.trim();
        const date              = document.getElementById('projDate').value;

        if (!title) {
            alert('Le titre est obligatoire.');
            return;
        }

        try {
            const url    = editingId ? `${API}/projects/${editingId}` : `${API}/projects`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: window.authHeaders,
                body: JSON.stringify({ title, technologies, short_description, full_description, github_url, demo_url, date })
            });

            if (res.ok) {
                const data = await res.json();
                const projectId = editingId || data.id;

                // Upload images
                if (selectedImages.length > 0) {
                    for (const img of selectedImages) {
                        const formData = new FormData();
                        formData.append('file', img);
                        formData.append('project_id', projectId);
                        formData.append('type', 'image');
                        await fetch(`${API}/projects/${projectId}/media`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
                            body: formData
                        });
                    }
                }

                // Upload vidéos
                if (selectedVideos.length > 0) {
                    for (const vid of selectedVideos) {
                        const formData = new FormData();
                        formData.append('file', vid);
                        formData.append('project_id', projectId);
                        formData.append('type', 'video');
                        await fetch(`${API}/projects/${projectId}/media`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
                            body: formData
                        });
                    }
                }

                closeModal();
                loadProjects();
            } else {
                alert('Erreur lors de la sauvegarde.');
            }
        } catch (err) {
            alert('Impossible de contacter le serveur.');
        }
    });
}

// ===================================
// MODAL SUPPRESSION
// ===================================
const openDelete = (id) => {
    deletingId = id;
    document.getElementById('deleteModal').classList.add('active');
};

const closeDeleteModal = () => {
    document.getElementById('deleteModal').classList.remove('active');
    deletingId = null;
};

const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);

const cancelDelete = document.getElementById('cancelDelete');
if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteModal);

const deleteModal = document.getElementById('deleteModal');
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

const confirmDelete = document.getElementById('confirmDelete');
if (confirmDelete) {
    confirmDelete.addEventListener('click', async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`${API}/projects/${deletingId}`, {
                method: 'DELETE',
                headers: window.authHeaders
            });

            if (res.ok) {
                closeDeleteModal();
                loadProjects();
            } else {
                alert('Erreur lors de la suppression.');
            }
        } catch (err) {
            alert('Impossible de contacter le serveur.');
        }
    });
}

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadProjects);