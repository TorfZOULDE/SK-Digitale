// ===================================
// admin-messages.js - Page Messages
// ===================================

let allMessages = [];
let currentFilter = 'all';
let currentMsgId = null;
let currentReplyMsg = null;

// ===================================
// CHARGER MESSAGES
// ===================================
const loadMessages = async () => {
    const list = document.getElementById('messagesList');
    if (!list) {
        console.error('❌ #messagesList introuvable');
        return;
    }

    try {
        console.log('📩 Chargement des messages...');
        const res = await fetch(`${API}/messages`, { headers: window.authHeaders });
        console.log('📩 Status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        allMessages = await res.json();
        console.log('📩 Messages reçus:', allMessages.length);

        const count = document.getElementById('msgCount');
        if (count) count.textContent = allMessages.length;

        renderMessages();
    } catch (err) {
        console.error('❌ Erreur chargement:', err);
        list.innerHTML = `
            <div class="activity-loading" style="color:#ef4444;padding:30px;">
                <i class="fas fa-exclamation-circle"></i><br>
                ${err.message}
            </div>
        `;
    }
};

// ===================================
// RENDU MESSAGES
// ===================================
const renderMessages = () => {
    const list = document.getElementById('messagesList');
    if (!list) return;

    let filtered = allMessages;

    if (currentFilter === 'unread') {
        filtered = allMessages.filter(m => !m.is_read && !m.is_archived);
    } else if (currentFilter === 'read') {
        filtered = allMessages.filter(m => m.is_read && !m.is_archived);
    } else if (currentFilter === 'archived') {
        filtered = allMessages.filter(m => m.is_archived);
    } else {
        filtered = allMessages.filter(m => !m.is_archived);
    }

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="activity-loading" style="padding:30px;color:#9ca3af;">
                <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
                Aucun message ${currentFilter !== 'all' ? 'dans ce filtre' : ''}
            </div>
        `;
        return;
    }

    list.innerHTML = '';
    filtered.forEach(msg => {
        const initials = msg.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        // ✅ Utiliser getTimeAgo de admin.js
        const time = getTimeAgo(new Date(msg.created_at));

        list.innerHTML += `
            <div class="msg-list-item ${!msg.is_read ? 'unread' : ''} ${currentMsgId === msg.id ? 'active' : ''}"
                 onclick="openMessage(${msg.id})">
                <div class="msg-list-avatar">${initials}</div>
                <div class="msg-list-content">
                    <div class="msg-list-header">
                        <span class="msg-list-name">${msg.name}</span>
                        <span class="msg-list-time">${time}</span>
                    </div>
                    <div class="msg-list-subject">${msg.subject || 'Sans sujet'}</div>
                    <div class="msg-list-preview">${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</div>
                </div>
                ${!msg.is_read ? '<div class="msg-unread-dot"></div>' : ''}
            </div>
        `;
    });
};

// ===================================
// OUVRIR MESSAGE
// ===================================
const openMessage = async (id) => {
    currentMsgId = id;
    const msg = allMessages.find(m => m.id === id);
    if (!msg) return;

    // Marquer comme lu
    if (!msg.is_read) {
        try {
            await fetch(`${API}/messages/${id}/read`, {
                method: 'PUT',
                headers: window.authHeaders
            });
            msg.is_read = true;
            renderMessages();
        } catch (err) {
            console.error('Erreur marquage lu:', err);
        }
    }

    const initials = msg.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const date = new Date(msg.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const detail = document.getElementById('messageDetail');
    if (!detail) return;

    detail.innerHTML = `
        <div class="msg-detail-header">
            <div class="msg-detail-from">
                <div class="msg-detail-avatar">${initials}</div>
                <div>
                    <div class="msg-detail-name">${msg.name}</div>
                    <div class="msg-detail-email">${msg.email}</div>
                </div>
            </div>
            <div class="msg-detail-meta">
                <span><i class="fas fa-calendar"></i> ${date}</span>
                <span><i class="fas fa-tag"></i> ${msg.subject || 'Sans sujet'}</span>
            </div>
        </div>
        <div class="msg-detail-subject">
            <h3>${msg.subject || 'Sans sujet'}</h3>
        </div>
        <div class="msg-detail-body">${msg.message}</div>
        <div class="msg-detail-actions">
            <button class="msg-action-btn reply" onclick="openReply(${msg.id}, '${msg.name.replace(/'/g, "\\'")}', '${msg.email}', '${msg.subject ? msg.subject.replace(/'/g, "\\'") : ''}')">
                <i class="fas fa-reply"></i> Répondre
            </button>
            <button class="msg-action-btn archive" onclick="archiveMessage(${msg.id})">
                <i class="fas fa-archive"></i> ${msg.is_archived ? 'Désarchiver' : 'Archiver'}
            </button>
            <button class="msg-action-btn delete" onclick="deleteMessage(${msg.id})">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    `;
};

// ===================================
// FILTRES
// ===================================
document.querySelectorAll('.msg-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.msg-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderMessages();
    });
});

// ===================================
// ARCHIVER
// ===================================
const archiveMessage = async (id) => {
    try {
        await fetch(`${API}/messages/${id}/archive`, {
            method: 'PUT',
            headers: window.authHeaders
        });
        const msg = allMessages.find(m => m.id === id);
        if (msg) msg.is_archived = !msg.is_archived;
        renderMessages();
        document.getElementById('messageDetail').innerHTML = `
            <div class="message-detail-empty">
                <i class="fas fa-envelope-open-text"></i>
                <p>Sélectionnez un message pour le lire</p>
            </div>`;
    } catch (err) {
        console.error('Erreur archive:', err);
    }
};

// ===================================
// SUPPRIMER
// ===================================
const deleteMessage = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;

    try {
        await fetch(`${API}/messages/${id}`, {
            method: 'DELETE',
            headers: window.authHeaders
        });
        allMessages = allMessages.filter(m => m.id !== id);
        renderMessages();
        document.getElementById('messageDetail').innerHTML = `
            <div class="message-detail-empty">
                <i class="fas fa-envelope-open-text"></i>
                <p>Sélectionnez un message pour le lire</p>
            </div>`;
    } catch (err) {
        console.error('Erreur suppression:', err);
    }
};

// ===================================
// RÉPONDRE
// ===================================
const openReply = (id, name, email, subject) => {
    currentReplyMsg = { id, name, email, subject };
    const info = document.getElementById('replyInfo');
    if (info) {
        info.innerHTML = `
            <strong>À :</strong> ${name} (${email})<br>
            <strong>Sujet :</strong> Re: ${subject || 'Sans sujet'}
        `;
    }
    document.getElementById('replyModal').classList.add('active');
};

const closeReplyModal = () => {
    document.getElementById('replyModal').classList.remove('active');
    document.getElementById('replyText').value = '';
    currentReplyMsg = null;
};

const closeReplyBtn = document.getElementById('closeReplyModal');
if (closeReplyBtn) closeReplyBtn.addEventListener('click', closeReplyModal);

const cancelReply = document.getElementById('cancelReply');
if (cancelReply) cancelReply.addEventListener('click', closeReplyModal);

const replyModal = document.getElementById('replyModal');
if (replyModal) {
    replyModal.addEventListener('click', (e) => {
        if (e.target === replyModal) closeReplyModal();
    });
}

const btnSendReply = document.getElementById('btnSendReply');
if (btnSendReply) {
    btnSendReply.addEventListener('click', async () => {
        const text = document.getElementById('replyText').value.trim();
        if (!text || !currentReplyMsg) return;

        btnSendReply.disabled = true;
        btnSendReply.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

        try {
            const res = await fetch(`${API}/messages/${currentReplyMsg.id}/reply`, {
                method: 'PUT',
                headers: window.authHeaders,
                body: JSON.stringify({ reply: text })
            });

            if (res.ok) {
                alert(`✅ Réponse envoyée à ${currentReplyMsg.email}`);
                closeReplyModal();
                loadMessages();
            } else {
                const data = await res.json();
                alert('❌ Erreur : ' + (data.message || 'Impossible d\'envoyer l\'email'));
            }
        } catch (err) {
            alert('❌ Impossible de contacter le serveur.');
        }

        btnSendReply.disabled = false;
        btnSendReply.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer';
    });
}
// ===================================
// EXPOSER LES FONCTIONS GLOBALEMENT
// ===================================
window.openReply = openReply;
window.archiveMessage = archiveMessage;
window.loadMessages = loadMessages;
window.openMessage = openMessage;

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadMessages);