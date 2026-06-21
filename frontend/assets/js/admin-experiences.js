let editingExpId  = null;
let deletingExpId = null;
let allExps       = [];

// ===================================
// CHARGER EXPÉRIENCES
// ===================================
const loadExperiences = async () => {
    const tbody = document.getElementById('expTable');
    if (!tbody) return;

    try {
        const res = await fetch(`${API}/experiences`);
        allExps   = await res.json();
        renderExperiences(allExps);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty">
            <i class="fas fa-exclamation-circle"></i> Erreur chargement
        </td></tr>`;
    }
};

const renderExperiences = (exps) => {
    const tbody      = document.getElementById('expTable');
    const mobileList = document.getElementById('expMobileList');

    if (exps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty">
            <i class="fas fa-briefcase"></i> Aucune expérience pour le moment
        </td></tr>`;
        if (mobileList) mobileList.innerHTML = `
            <div style="text-align:center;color:#9ca3af;padding:30px;font-size:0.85rem;">
                <i class="fas fa-briefcase"></i><br>Aucune expérience
            </div>`;
        return;
    }

    // TABLE desktop
    tbody.innerHTML = '';
    exps.forEach(exp => {
        const tasks = typeof exp.tasks === 'string' ? JSON.parse(exp.tasks) : exp.tasks;
        tbody.innerHTML += `
            <tr>
                <td><strong>${exp.title}</strong></td>
                <td>${exp.company}</td>
                <td>${exp.date_range}</td>
                <td><i class="${exp.icon}" style="color:var(--color-orange-primary);font-size:1.2rem;"></i></td>
                <td>
                    <div class="table-actions-btns">
                        <button class="btn-edit" onclick="openEditExp(${exp.id})">
                            <i class="fas fa-pencil-alt"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="openDeleteExp(${exp.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    // CARTES mobile
    if (!mobileList) return;
    mobileList.innerHTML = '';
    exps.forEach(exp => {
        mobileList.innerHTML += `
            <div class="proj-mobile-card">
                <div class="proj-mobile-card-header">
                    <span class="proj-mobile-title">
                        <i class="${exp.icon}" style="color:var(--color-orange-primary);margin-right:6px;"></i>
                        ${exp.title}
                    </span>
                </div>
                <div style="font-size:0.82rem;color:#6b7280;margin-bottom:5px;">${exp.company}</div>
                <div style="font-size:0.78rem;color:#9ca3af;margin-bottom:12px;">${exp.date_range}</div>
                <div class="proj-mobile-actions">
                    <button class="btn-edit" onclick="openEditExp(${exp.id})">
                        <i class="fas fa-pencil-alt"></i> Modifier
                    </button>
                    <button class="btn-delete" onclick="openDeleteExp(${exp.id})">
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
        renderExperiences(allExps.filter(exp =>
            exp.title.toLowerCase().includes(q) ||
            exp.company.toLowerCase().includes(q)
        ));
    });
}

// ===================================
// APERÇU ICÔNE
// ===================================
const expIcon = document.getElementById('expIcon');
if (expIcon) {
    expIcon.addEventListener('input', () => {
        const preview = document.getElementById('iconPreview');
        if (preview) {
            preview.className = expIcon.value || 'fas fa-briefcase';
        }
    });
}

const setIcon = (icon) => {
    const input = document.getElementById('expIcon');
    if (input) {
        input.value = icon;
        const preview = document.getElementById('iconPreview');
        if (preview) preview.className = icon;
    }
};

// ===================================
// MODAL AJOUTER / MODIFIER
// ===================================
const openExpModal = () => {
    document.getElementById('expModal').classList.add('active');
};

const closeExpModal = () => {
    document.getElementById('expModal').classList.remove('active');
    resetExpForm();
    editingExpId = null;
};

const resetExpForm = () => {
    document.getElementById('expTitle').value   = '';
    document.getElementById('expCompany').value = '';
    document.getElementById('expDate').value    = '';
    document.getElementById('expIcon').value    = '';
    document.getElementById('expTasks').value   = '';
    const preview = document.getElementById('iconPreview');
    if (preview) preview.className = 'fas fa-briefcase';
};

const btnAddExp = document.getElementById('btnAddExp');
if (btnAddExp) {
    btnAddExp.addEventListener('click', () => {
        editingExpId = null;
        document.getElementById('expModalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouvelle expérience';
        resetExpForm();
        openExpModal();
    });
}

const closeExpModalBtn = document.getElementById('closeExpModal');
if (closeExpModalBtn) closeExpModalBtn.addEventListener('click', closeExpModal);

const cancelExp = document.getElementById('cancelExp');
if (cancelExp) cancelExp.addEventListener('click', closeExpModal);

const expModal = document.getElementById('expModal');
if (expModal) {
    expModal.addEventListener('click', (e) => {
        if (e.target === expModal) closeExpModal();
    });
}

// ===================================
// OUVRIR MODIFICATION
// ===================================
const openEditExp = (id) => {
    const exp = allExps.find(e => e.id === id);
    if (!exp) return;

    editingExpId = id;
    document.getElementById('expModalTitle').innerHTML = '<i class="fas fa-pencil-alt"></i> Modifier l\'expérience';
    document.getElementById('expTitle').value   = exp.title || '';
    document.getElementById('expCompany').value = exp.company || '';
    document.getElementById('expDate').value    = exp.date_range || '';
    document.getElementById('expIcon').value    = exp.icon || '';

    const tasks = typeof exp.tasks === 'string' ? JSON.parse(exp.tasks) : exp.tasks;
    document.getElementById('expTasks').value = Array.isArray(tasks) ? tasks.join('\n') : '';

    const preview = document.getElementById('iconPreview');
    if (preview) preview.className = exp.icon || 'fas fa-briefcase';

    openExpModal();
};

// ===================================
// SAUVEGARDER EXPÉRIENCE
// ===================================
const saveExp = document.getElementById('saveExp');
if (saveExp) {
    saveExp.addEventListener('click', async () => {
        const title      = document.getElementById('expTitle').value.trim();
        const company    = document.getElementById('expCompany').value.trim();
        const date_range = document.getElementById('expDate').value.trim();
        const icon       = document.getElementById('expIcon').value.trim() || 'fas fa-briefcase';
        const tasksRaw   = document.getElementById('expTasks').value.trim();
        const tasks      = tasksRaw.split('\n').filter(t => t.trim() !== '');

        if (!title || !company || !date_range || tasks.length === 0) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        try {
            const url    = editingExpId ? `${API}/experiences/${editingExpId}` : `${API}/experiences`;
            const method = editingExpId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: window.authHeaders,
                body: JSON.stringify({ title, company, date_range, icon, tasks })
            });

            if (res.ok) {
                closeExpModal();
                loadExperiences();
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
const openDeleteExp = (id) => {
    deletingExpId = id;
    document.getElementById('deleteExpModal').classList.add('active');
};

const closeDeleteExpModal = () => {
    document.getElementById('deleteExpModal').classList.remove('active');
    deletingExpId = null;
};

const closeDeleteExpBtn = document.getElementById('closeDeleteExpModal');
if (closeDeleteExpBtn) closeDeleteExpBtn.addEventListener('click', closeDeleteExpModal);

const cancelDeleteExp = document.getElementById('cancelDeleteExp');
if (cancelDeleteExp) cancelDeleteExp.addEventListener('click', closeDeleteExpModal);

const deleteExpModal = document.getElementById('deleteExpModal');
if (deleteExpModal) {
    deleteExpModal.addEventListener('click', (e) => {
        if (e.target === deleteExpModal) closeDeleteExpModal();
    });
}

const confirmDeleteExp = document.getElementById('confirmDeleteExp');
if (confirmDeleteExp) {
    confirmDeleteExp.addEventListener('click', async () => {
        if (!deletingExpId) return;

        try {
            const res = await fetch(`${API}/experiences/${deletingExpId}`, {
                method: 'DELETE',
                headers: window.authHeaders
            });

            if (res.ok) {
                closeDeleteExpModal();
                loadExperiences();
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
document.addEventListener('DOMContentLoaded', loadExperiences);
