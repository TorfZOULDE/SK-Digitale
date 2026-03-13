// ===================================
// CANVAS BACKGROUND
// ===================================
const canvas = document.getElementById('creative-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 50 : 100;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,107,53,0.6)';
            ctx.fill();
        }
    }
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255,107,53,${1 - dist / 120})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ===================================
// ⚙️  CONFIG EMAILJS
// 👉 Remplace ces 3 valeurs après avoir créé ton compte sur emailjs.com
// ===================================
const EMAILJS_SERVICE_ID  = 'service_6w4lumh';
const EMAILJS_TEMPLATE_ID = 'template_wlvxvp3';
const EMAILJS_PUBLIC_KEY  = 'S3NBSmEy7nuZn9KyD';

// ===================================
// VARIABLES GLOBALES
// ===================================
let messagesData   = [];
let currentMessage = null;
let currentFilter  = 'all';

const messagesContainer = document.getElementById('messages-container');
const searchInput       = document.getElementById('search-input');
const filterButtons     = document.querySelectorAll('.filter-btn');
const btnRefresh        = document.getElementById('btn-refresh');
const logoutBtn         = document.getElementById('btn-logout');
const statTotal         = document.getElementById('stat-total');
const statUnread        = document.getElementById('stat-unread');
const statRead          = document.getElementById('stat-read');
const statToday         = document.getElementById('stat-today');
const messageModal      = document.getElementById('message-modal');
const closeModalBtn     = document.getElementById('close-modal');
const btnToggleRead     = document.getElementById('btn-toggle-read');
const btnDeleteMessage  = document.getElementById('btn-delete-message');
const responseText      = document.getElementById('response-text');
const readStatusText    = document.getElementById('read-status-text');
const btnMenu           = document.getElementById('btn-menu');
const sideMenu          = document.getElementById('side-menu');
const closeMenu         = document.getElementById('close-menu');
const menuOverlay       = document.getElementById('menu-overlay');
const btnSendResponse   = document.getElementById('btn-send-response');

// ===================================
// NOTIFICATION
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
    setTimeout(() => { notif.style.transform = 'translateX(0)'; notif.style.opacity = '1'; }, 10);
    setTimeout(() => {
        notif.style.transform = 'translateX(400px)';
        notif.style.opacity   = '0';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

// ===================================
// MENU LATERAL
// ===================================
if (btnMenu && sideMenu && closeMenu && menuOverlay) {
    btnMenu.addEventListener('click', () => {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
    });
    closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });
    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });
}

// ===================================
// CHARGER LES MESSAGES
// ===================================
function loadMessages() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Chargement des messages...</p></div>`;

    window.db.collection('messages')
        .orderBy('createdAt', 'desc')
        .get()
        .then(snapshot => {
            messagesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            displayMessages(messagesData);
            updateStats();
        })
        .catch(err => {
            console.error('Erreur chargement messages:', err);
            messagesContainer.innerHTML = `
                <div style="color:white;text-align:center;padding:40px">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#ef4444;margin-bottom:16px;display:block"></i>
                    <h3>Erreur de chargement</h3>
                    <p style="color:rgba(255,255,255,0.6);margin-top:8px">${err.message}</p>
                </div>`;
        });
}

// ===================================
// AFFICHER LES MESSAGES
// ===================================
function displayMessages(messages) {
    if (!messagesContainer) return;
    if (!Array.isArray(messages) || messages.length === 0) {
        messagesContainer.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>Aucun message trouvé</h3></div>`;
        return;
    }
    messagesContainer.innerHTML = messages.map(m => {
        m.lu = m.lu ?? false;
        const date = m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleString('fr-FR') : 'Date inconnue';
        const reponduBadge = m.repondu
            ? '<span style="background:#10b981;color:#fff;font-size:0.65rem;padding:2px 8px;border-radius:20px;margin-left:8px;font-weight:700;">↩ Répondu</span>'
            : '';
        return `
            <div class="message-card ${m.lu ? 'read' : 'unread'}" data-id="${m.id}">
                <div class="message-status ${m.lu ? 'read' : 'unread'}">
                    <i class="fas ${m.lu ? 'fa-check-circle' : 'fa-envelope'}"></i>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <h4>${m.nom || 'Nom inconnu'}${reponduBadge}</h4>
                        <span>${date}</span>
                    </div>
                    <p class="message-subject">${m.sujet || 'Sans sujet'}</p>
                    <p class="message-preview">${(m.message || '').substring(0, 120)}...</p>
                    <small><i class="fas fa-envelope"></i> ${m.email || 'Email inconnu'}</small>
                </div>
            </div>`;
    }).join('');

    document.querySelectorAll('.message-card').forEach(card => {
        card.addEventListener('click', () => openMessageModal(card.dataset.id));
    });
}

// ===================================
// OUVRIR MODAL MESSAGE
// ===================================
function openMessageModal(id) {
    currentMessage = messagesData.find(m => m.id === id);
    if (!currentMessage) { showNotification('Message introuvable', 'error'); return; }

    document.getElementById('detail-nom').textContent     = currentMessage.nom     || 'Inconnu';
    document.getElementById('detail-email').textContent   = currentMessage.email   || 'Inconnu';
    document.getElementById('detail-sujet').textContent   = currentMessage.sujet   || 'Sans sujet';
    document.getElementById('detail-date').textContent    = currentMessage.createdAt
        ? new Date(currentMessage.createdAt.seconds * 1000).toLocaleString('fr-FR') : 'Inconnue';
    document.getElementById('detail-message').textContent = currentMessage.message || '';

    // Afficher la réponse précédente si elle existe
    const responseSection = document.getElementById('response-section');
    if (responseSection && currentMessage.repondu && currentMessage.reponse) {
        const prevReply = document.getElementById('previous-reply') || document.createElement('div');
        prevReply.id = 'previous-reply';
        prevReply.style.cssText = 'background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:14px;margin-bottom:16px;color:rgba(255,255,255,0.8);font-size:0.88rem;';
        prevReply.innerHTML = `<strong style="color:#10b981"><i class="fas fa-check-circle"></i> Réponse déjà envoyée :</strong><p style="margin-top:8px;white-space:pre-wrap">${currentMessage.reponse}</p>`;
        responseSection.insertBefore(prevReply, responseSection.firstChild);
    } else {
        const prevReply = document.getElementById('previous-reply');
        if (prevReply) prevReply.remove();
    }

    if (readStatusText) readStatusText.textContent = currentMessage.lu ? 'Marquer comme non lu' : 'Marquer comme lu';
    if (responseText)   responseText.value = '';
    if (messageModal)   messageModal.style.display = 'flex';

    // Marquer automatiquement comme lu à l'ouverture
    if (!currentMessage.lu) {
        window.db.collection('messages').doc(currentMessage.id)
            .update({ lu: true })
            .then(() => {
                currentMessage.lu = true;
                if (readStatusText) readStatusText.textContent = 'Marquer comme non lu';
                const idx = messagesData.findIndex(m => m.id === currentMessage.id);
                if (idx !== -1) messagesData[idx].lu = true;
                updateStats();
            })
            .catch(err => console.warn('Marquage lu échoué:', err));
    }
}

if (closeModalBtn) closeModalBtn.addEventListener('click', () => { if (messageModal) messageModal.style.display = 'none'; });

// ===================================
// ✅ ENVOI DE LA REPONSE PAR EMAIL (EmailJS)
// ===================================
if (btnSendResponse) {
    btnSendResponse.addEventListener('click', async () => {
        if (!currentMessage) {
            showNotification('Aucun message sélectionné', 'error');
            return;
        }

        const reponse = responseText ? responseText.value.trim() : '';
        if (!reponse) {
            showNotification('Veuillez écrire une réponse avant d\'envoyer', 'error');
            return;
        }

        // Vérifier que EmailJS est chargé
        if (typeof emailjs === 'undefined') {
            showNotification('EmailJS non chargé. Vérifiez votre connexion internet.', 'error');
            return;
        }

        // Vérifier que les clés sont configurées
        if (EMAILJS_SERVICE_ID === 'TON_SERVICE_ID') {
            showNotification('⚠️ Configure tes clés EmailJS dans message.js (voir les commentaires)', 'error');
            return;
        }

        // Désactiver le bouton pendant l'envoi
        const originalHTML       = btnSendResponse.innerHTML;
        btnSendResponse.disabled = true;
        btnSendResponse.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

        try {
            // Paramètres envoyés au template EmailJS
            // Ces noms (to_name, to_email, etc.) doivent correspondre
            // aux variables dans ton template EmailJS
            const templateParams = {
                to_name:       currentMessage.nom   || 'Visiteur',
                to_email:      currentMessage.email || '',
                subject:       'Re: ' + (currentMessage.sujet || 'Votre message'),
                original_msg:  currentMessage.message || '',
                reply_message: reponse,
                from_name:     'Samson KPODAMAKOU',
            };

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            // ✅ Sauvegarder la réponse dans Firestore
            await window.db.collection('messages').doc(currentMessage.id).update({
                repondu:   true,
                reponse:   reponse,
                reponduLe: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Mettre à jour en mémoire locale
            const idx = messagesData.findIndex(m => m.id === currentMessage.id);
            if (idx !== -1) {
                messagesData[idx].repondu = true;
                messagesData[idx].reponse = reponse;
            }
            currentMessage.repondu = true;
            currentMessage.reponse = reponse;

            // Actualiser la liste
            displayMessages(applyFilter(messagesData));

            showNotification(`✅ Réponse envoyée avec succès à ${currentMessage.email} !`, 'success');
            if (responseText) responseText.value = '';

        } catch (err) {
            console.error('Erreur envoi email:', err);
            if (err.status === 400) {
                showNotification('Clés EmailJS invalides. Vérifie SERVICE_ID, TEMPLATE_ID et PUBLIC_KEY.', 'error');
            } else {
                showNotification('Erreur lors de l\'envoi. Réessaie.', 'error');
            }
        } finally {
            btnSendResponse.disabled  = false;
            btnSendResponse.innerHTML = originalHTML;
        }
    });
}

// ===================================
// MARQUER LU / NON LU
// ===================================
if (btnToggleRead) {
    btnToggleRead.addEventListener('click', () => {
        if (!currentMessage) return;
        const newStatus = !currentMessage.lu;

        window.db.collection('messages').doc(currentMessage.id)
            .update({ lu: newStatus })
            .then(() => {
                currentMessage.lu = newStatus;
                if (readStatusText) readStatusText.textContent = newStatus ? 'Marquer comme non lu' : 'Marquer comme lu';
                const idx = messagesData.findIndex(m => m.id === currentMessage.id);
                if (idx !== -1) messagesData[idx].lu = newStatus;
                displayMessages(applyFilter(messagesData));
                updateStats();
                showNotification('Statut mis à jour', 'success');
            })
            .catch(err => {
                console.error(err);
                showNotification('Erreur lors de la mise à jour', 'error');
            });
    });
}

// ===================================
// SUPPRIMER MESSAGE
// ===================================
if (btnDeleteMessage) {
    btnDeleteMessage.addEventListener('click', () => {
        if (!currentMessage) return;
        if (!window.confirm('Voulez-vous supprimer ce message ?')) return;

        window.db.collection('messages').doc(currentMessage.id)
            .delete()
            .then(() => {
                messagesData = messagesData.filter(m => m.id !== currentMessage.id);
                displayMessages(applyFilter(messagesData));
                updateStats();
                if (messageModal) messageModal.style.display = 'none';
                showNotification('Message supprimé', 'success');
            })
            .catch(err => {
                console.error(err);
                showNotification('Erreur lors de la suppression', 'error');
            });
    });
}

// ===================================
// ACTUALISER
// ===================================
if (btnRefresh) btnRefresh.addEventListener('click', () => loadMessages());

// ===================================
// RECHERCHE & FILTRES
// ===================================
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        displayMessages(applyFilter(messagesData.filter(m =>
            (m.nom     || '').toLowerCase().includes(q) ||
            (m.email   || '').toLowerCase().includes(q) ||
            (m.sujet   || '').toLowerCase().includes(q) ||
            (m.message || '').toLowerCase().includes(q)
        )));
    });
}

if (filterButtons) {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            displayMessages(applyFilter(messagesData));
        });
    });
}

function applyFilter(messages) {
    if (currentFilter === 'read')   return messages.filter(m => m.lu);
    if (currentFilter === 'unread') return messages.filter(m => !m.lu);
    return messages;
}

// ===================================
// STATS
// ===================================
function updateStats() {
    const total  = messagesData.length;
    const read   = messagesData.filter(m => m.lu).length;
    const unread = total - read;
    const today  = messagesData.filter(m => {
        if (!m.createdAt) return false;
        return new Date(m.createdAt.seconds * 1000).toDateString() === new Date().toDateString();
    }).length;
    if (statTotal)  statTotal.textContent  = total;
    if (statRead)   statRead.textContent   = read;
    if (statUnread) statUnread.textContent = unread;
    if (statToday)  statToday.textContent  = today;
}

// ===================================
// MENU ITEMS
// ===================================
const menuAllData   = document.getElementById('menu-all-data');
const menuSettings  = document.getElementById('menu-settings');
const menuExport    = document.getElementById('menu-export');
const allDataModal  = document.getElementById('all-data-modal');
const closeAllData  = document.getElementById('close-all-data');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');

if (menuAllData && allDataModal) {
    menuAllData.addEventListener('click', () => {
        allDataModal.style.display = 'flex';
        if (sideMenu)    sideMenu.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');

        const container = document.getElementById('data-table-container');
        if (messagesData.length === 0) {
            container.innerHTML = '<p style="color:white;text-align:center;padding:20px">Aucune donnée</p>';
            return;
        }
        let html = '<table style="width:100%;border-collapse:collapse;color:white;font-size:0.85rem">';
        html += '<thead><tr style="background:rgba(255,255,255,0.1)">';
        ['Nom','Email','Sujet','Date','Lu','Répondu'].forEach(h => {
            html += `<th style="padding:10px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.2)">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        messagesData.forEach(m => {
            const date = m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleString('fr-FR') : '-';
            html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:10px">${m.nom   || '-'}</td>
                <td style="padding:10px">${m.email || '-'}</td>
                <td style="padding:10px">${m.sujet || '-'}</td>
                <td style="padding:10px">${date}</td>
                <td style="padding:10px">${m.lu      ? '✅' : '📩'}</td>
                <td style="padding:10px">${m.repondu ? '↩️' : '—'}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    });
}

if (closeAllData && allDataModal) {
    closeAllData.addEventListener('click', () => { allDataModal.style.display = 'none'; });
}

if (menuSettings && settingsModal) {
    menuSettings.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
        if (sideMenu)    sideMenu.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
    });
}
if (closeSettings && settingsModal) {
    closeSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });
}

// ===================================
// EXPORT CSV
// ===================================
if (menuExport) {
    menuExport.addEventListener('click', () => {
        if (sideMenu)    sideMenu.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        if (messagesData.length === 0) { showNotification('Aucune donnée à exporter', 'error'); return; }

        const headers = ['Nom','Email','Sujet','Message','Date','Lu','Répondu'];
        const rows = messagesData.map(m => {
            const date = m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleString('fr-FR') : '-';
            return [
                m.nom     || '',
                m.email   || '',
                m.sujet   || '',
                (m.message || '').replace(/,/g, ';'),
                date,
                m.lu      ? 'Oui' : 'Non',
                m.repondu ? 'Oui' : 'Non'
            ];
        });
        const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Export CSV téléchargé !', 'success');
    });
}

// Fermer modals en cliquant dehors
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
});

// ===================================
// LOGOUT
// ===================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            window.auth.signOut()
                .then(() => { window.location.href = 'index.html'; })
                .catch(() => { window.location.href = 'index.html'; });
        }
    });
}

// ===================================
// INIT — vérifie la session puis charge
// ===================================
window.auth.onAuthStateChanged(user => {
    if (user) {
        loadMessages();
    } else {
        window.location.href = 'index.html';
    }
});