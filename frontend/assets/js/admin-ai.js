let allKnowledge   = [];
let editingKnowId  = null;
let currentCatFilter = 'all';

// ===================================
// CHARGER CONNAISSANCES
// ===================================
const loadKnowledge = async () => {
    const list = document.getElementById('knowledgeList');
    if (!list) return;

    try {
        const res    = await fetch(`${API}/ai/knowledge`, { headers: window.authHeaders });
        allKnowledge = await res.json();
        renderKnowledge(allKnowledge);
    } catch (err) {
        list.innerHTML = '<div class="activity-loading">Aucune connaissance pour le moment</div>';
    }
};

const renderKnowledge = (items) => {
    const list = document.getElementById('knowledgeList');
    if (!list) return;

    const filtered = currentCatFilter === 'all'
        ? items
        : items.filter(k => k.category === currentCatFilter);

    if (filtered.length === 0) {
        list.innerHTML = `
            <div style="text-align:center;color:#9ca3af;padding:30px;font-size:0.85rem;">
                <i class="fas fa-brain"></i><br>Aucune connaissance dans cette catégorie
            </div>`;
        return;
    }

    const catLabels = {
        info:       { label: 'Infos perso',  icon: 'fas fa-user',           class: 'cat-info' },
        competence: { label: 'Compétences',  icon: 'fas fa-code',           class: 'cat-competence' },
        experience: { label: 'Expériences',  icon: 'fas fa-briefcase',      class: 'cat-experience' },
        faq:        { label: 'FAQ',          icon: 'fas fa-question-circle', class: 'cat-faq' },
    };

    list.innerHTML = '';
    filtered.forEach(k => {
        const cat = catLabels[k.category] || { label: k.category, icon: 'fas fa-tag', class: 'cat-faq' };
        list.innerHTML += `
            <div class="knowledge-item">
                <div class="knowledge-item-header">
                    <span class="knowledge-cat-badge ${cat.class}">
                        <i class="${cat.icon}"></i> ${cat.label}
                    </span>
                    <div class="knowledge-actions">
                        <button class="btn-edit" onclick="openEditKnowledge(${k.id})">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteKnowledge(${k.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="knowledge-question">${k.question}</div>
                <div class="knowledge-answer">${k.answer}</div>
            </div>
        `;
    });
};

// ===================================
// FILTRES CATÉGORIES
// ===================================
document.querySelectorAll('.ia-cat').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.ia-cat').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCatFilter = btn.dataset.cat;
        renderKnowledge(allKnowledge);
    });
});

// ===================================
// MODAL AJOUTER / MODIFIER
// ===================================
const openKnowledgeModal = () => {
    document.getElementById('knowledgeModal').classList.add('active');
};

const closeKnowledgeModal = () => {
    document.getElementById('knowledgeModal').classList.remove('active');
    document.getElementById('kQuestion').value = '';
    document.getElementById('kAnswer').value   = '';
    editingKnowId = null;
};

const btnAddKnowledge = document.getElementById('btnAddKnowledge');
if (btnAddKnowledge) {
    btnAddKnowledge.addEventListener('click', () => {
        editingKnowId = null;
        document.getElementById('knowledgeModalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouvelle connaissance';
        document.getElementById('kQuestion').value = '';
        document.getElementById('kAnswer').value   = '';
        openKnowledgeModal();
    });
}

const closeKnowledgeModalBtn = document.getElementById('closeKnowledgeModal');
if (closeKnowledgeModalBtn) closeKnowledgeModalBtn.addEventListener('click', closeKnowledgeModal);

const cancelKnowledge = document.getElementById('cancelKnowledge');
if (cancelKnowledge) cancelKnowledge.addEventListener('click', closeKnowledgeModal);

const knowledgeModal = document.getElementById('knowledgeModal');
if (knowledgeModal) {
    knowledgeModal.addEventListener('click', (e) => {
        if (e.target === knowledgeModal) closeKnowledgeModal();
    });
}

// ===================================
// MODIFIER CONNAISSANCE
// ===================================
const openEditKnowledge = (id) => {
    const k = allKnowledge.find(k => k.id === id);
    if (!k) return;

    editingKnowId = id;
    document.getElementById('knowledgeModalTitle').innerHTML = '<i class="fas fa-pencil-alt"></i> Modifier la connaissance';
    document.getElementById('kCategory').value = k.category || 'faq';
    document.getElementById('kQuestion').value = k.question || '';
    document.getElementById('kAnswer').value   = k.answer   || '';
    openKnowledgeModal();
};

// ===================================
// SAUVEGARDER
// ===================================
const saveKnowledge = document.getElementById('saveKnowledge');
if (saveKnowledge) {
    saveKnowledge.addEventListener('click', async () => {
        const category = document.getElementById('kCategory').value;
        const question = document.getElementById('kQuestion').value.trim();
        const answer   = document.getElementById('kAnswer').value.trim();

        if (!question || !answer) {
            alert('Veuillez remplir tous les champs.');
            return;
        }

        try {
            const url    = editingKnowId ? `${API}/ai/knowledge/${editingKnowId}` : `${API}/ai/knowledge`;
            const method = editingKnowId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: window.authHeaders,
                body: JSON.stringify({ category, question, answer })
            });

            if (res.ok) {
                closeKnowledgeModal();
                loadKnowledge();
            } else {
                alert('Erreur lors de la sauvegarde.');
            }
        } catch (err) {
            alert('Impossible de contacter le serveur.');
        }
    });
}

// ===================================
// SUPPRIMER
// ===================================
const deleteKnowledge = async (id) => {
    if (!confirm('Supprimer cette connaissance ?')) return;

    try {
        const res = await fetch(`${API}/ai/knowledge/${id}`, {
            method: 'DELETE',
            headers: window.authHeaders
        });

        if (res.ok) loadKnowledge();
        else alert('Erreur lors de la suppression.');
    } catch (err) {}
};

// ===================================
// PLAYGROUND IA
// ===================================
const iaChatBox  = document.getElementById('iaChatBox');
const iaQuestion = document.getElementById('iaQuestion');
const iaSendBtn  = document.getElementById('iaSendBtn');

const addMessage = (text, type) => {
    const welcome = iaChatBox.querySelector('.ia-chat-welcome');
    if (welcome) welcome.remove();

    const icon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    iaChatBox.innerHTML += `
        <div class="ia-msg ${type}">
            <div class="ia-msg-avatar"><i class="${icon}"></i></div>
            <div class="ia-msg-bubble">${text}</div>
        </div>
    `;
    iaChatBox.scrollTop = iaChatBox.scrollHeight;
};

const sendQuestion = async () => {
    const q = iaQuestion.value.trim();
    if (!q) return;

    addMessage(q, 'user');
    iaQuestion.value = '';

    // Recherche dans la base de connaissances
    const found = allKnowledge.find(k =>
        k.question.toLowerCase().includes(q.toLowerCase()) ||
        q.toLowerCase().includes(k.question.toLowerCase().split(' ').slice(0, 3).join(' '))
    );

    setTimeout(() => {
        if (found) {
            addMessage(found.answer, 'bot');
        } else {
            addMessage('Je n\'ai pas de réponse précise à cette question. Essayez d\'ajouter cette connaissance dans la base.', 'bot');
        }
    }, 600);
};

if (iaSendBtn) iaSendBtn.addEventListener('click', sendQuestion);
if (iaQuestion) {
    iaQuestion.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendQuestion();
    });
}

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadKnowledge);
