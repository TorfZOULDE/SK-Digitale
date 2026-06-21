let allAnnouncements = [];
let deletingAnnId = null;

// ===================================
// CHARGER ANNONCES
// ===================================
const loadAnnouncementsAdmin = async () => {
    const list = document.getElementById('announcementsList');
    if (!list) return;

    try {
        const res = await fetch(`${API}/announcements`, { headers: window.authHeaders });
        allAnnouncements = await res.json();
        renderAnnouncementsAdmin();
    } catch (err) {
        list.innerHTML = '<div class="activity-loading">Erreur chargement</div>';
    }
};

const renderAnnouncementsAdmin = () => {
    const list = document.getElementById('announcementsList');
    if (!list) return;

    if (allAnnouncements.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;color:#9ca3af;padding:30px;font-size:0.85rem;">
                <i class="fas fa-bullhorn"></i><br>Aucune annonce pour le moment
            </div>`;
        return;
    }

    list.innerHTML = '';
    allAnnouncements.forEach(a => {
        list.innerHTML += `
            <div class="knowledge-item">
                <div class="knowledge-item-header">
                    <span class="knowledge-cat-badge ${a.is_active ? 'cat-experience' : 'cat-faq'}">
                        <i class="${a.icon}"></i> ${a.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                    <div class="knowledge-actions">
                        <button class="btn-edit" onclick="toggleAnnouncement(${a.id})" title="${a.is_active ? 'Désactiver' : 'Activer'}">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button class="btn-delete" onclick="openDeleteAnnouncement(${a.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="knowledge-question">${a.text}</div>
            </div>
        `;
    });
};

// ===================================
// MODAL AJOUTER
// ===================================
const announcementModal = document.getElementById('announcementModal');

const openAnnouncementModal = () => {
    announcementModal.classList.add('active');
};

const closeAnnouncementModal = () => {
    announcementModal.classList.remove('active');
    document.getElementById('annText').value = '';
    document.getElementById('annIcon').value = 'fas fa-bullhorn';
};

const btnAddAnnouncement = document.getElementById('btnAddAnnouncement');
if (btnAddAnnouncement) {
    btnAddAnnouncement.addEventListener('click', openAnnouncementModal);
}

const closeAnnouncementModalBtn = document.getElementById('closeAnnouncementModal');
if (closeAnnouncementModalBtn) closeAnnouncementModalBtn.addEventListener('click', closeAnnouncementModal);

const cancelAnnouncement = document.getElementById('cancelAnnouncement');
if (cancelAnnouncement) cancelAnnouncement.addEventListener('click', closeAnnouncementModal);

if (announcementModal) {
    announcementModal.addEventListener('click', (e) => {
        if (e.target === announcementModal) closeAnnouncementModal();
    });
}

// ===================================
// SAUVEGARDER
// ===================================
const saveAnnouncement = document.getElementById('saveAnnouncement');
if (saveAnnouncement) {
    saveAnnouncement.addEventListener('click', async () => {
        const text = document.getElementById('annText').value.trim();
        const icon = document.getElementById('annIcon').value.trim() || 'fas fa-bullhorn';

        if (!text) {
            alert('Le texte est obligatoire.');
            return;
        }

        try {
            const res = await fetch(`${API}/announcements`, {
                method: 'POST',
                headers: window.authHeaders,
                body: JSON.stringify({ text, icon })
            });

            if (res.ok) {
                closeAnnouncementModal();
                loadAnnouncementsAdmin();
            } else {
                alert('Erreur lors de la sauvegarde.');
            }
        } catch (err) {
            alert('Impossible de contacter le serveur.');
        }
    });
}

// ===================================
// ACTIVER / DÉSACTIVER
// ===================================
const toggleAnnouncement = async (id) => {
    try {
        await fetch(`${API}/announcements/${id}/toggle`, {
            method: 'PUT',
            headers: window.authHeaders
        });
        loadAnnouncementsAdmin();
    } catch (err) {
        alert('Erreur lors de la modification.');
    }
};

// ===================================
// SUPPRIMER
// ===================================
const deleteAnnouncementModal = document.getElementById('deleteAnnouncementModal');

const openDeleteAnnouncement = (id) => {
    deletingAnnId = id;
    deleteAnnouncementModal.classList.add('active');
};

const closeDeleteAnnouncementModal = () => {
    deleteAnnouncementModal.classList.remove('active');
    deletingAnnId = null;
};

const closeDeleteAnnBtn = document.getElementById('closeDeleteAnnModal');
if (closeDeleteAnnBtn) closeDeleteAnnBtn.addEventListener('click', closeDeleteAnnouncementModal);

const cancelDeleteAnn = document.getElementById('cancelDeleteAnn');
if (cancelDeleteAnn) cancelDeleteAnn.addEventListener('click', closeDeleteAnnouncementModal);

if (deleteAnnouncementModal) {
    deleteAnnouncementModal.addEventListener('click', (e) => {
        if (e.target === deleteAnnouncementModal) closeDeleteAnnouncementModal();
    });
}

const confirmDeleteAnn = document.getElementById('confirmDeleteAnn');
if (confirmDeleteAnn) {
    confirmDeleteAnn.addEventListener('click', async () => {
        if (!deletingAnnId) return;

        try {
            const res = await fetch(`${API}/announcements/${deletingAnnId}`, {
                method: 'DELETE',
                headers: window.authHeaders
            });

            if (res.ok) {
                closeDeleteAnnouncementModal();
                loadAnnouncementsAdmin();
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
document.addEventListener('DOMContentLoaded', loadAnnouncementsAdmin);
