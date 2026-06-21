const API = window.location.origin + '/api';

// ===================================
// VÉRIFICATION TOKEN
// ===================================
const token = localStorage.getItem('admin_token');
if (!token) window.location.href = 'login.html';

const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// ===================================
// THEME TOGGLE
// ===================================
const themeToggle = document.getElementById('themeToggle');
const adminPage   = document.querySelector('.admin-page');

const savedTheme = localStorage.getItem('admin_theme');
if (savedTheme === 'light') {
    adminPage.classList.add('light');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    const isLight = adminPage.classList.toggle('light');
    adminPage.classList.toggle('dark', !isLight);
    themeToggle.querySelector('i').classList.replace(
        isLight ? 'fa-moon' : 'fa-sun',
        isLight ? 'fa-sun'  : 'fa-moon'
    );
    localStorage.setItem('admin_theme', isLight ? 'light' : 'dark');
});

// ===================================
// SIDEBAR TOGGLE
// ===================================
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar       = document.getElementById('sidebar');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Ferme sidebar si on clique en dehors
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// ===================================
// DÉCONNEXION
// ===================================
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('admin_token');
        window.location.href = 'login.html';
    });
}

// Rend authHeaders global
window.authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
};

// ===================================
// KPI STATS
// ===================================
const loadStats = async () => {
    try {
        const res  = await fetch(`${API}/visitors/stats`, { headers: window.authHeaders });
        const data = await res.json();

        if (document.getElementById('kpiVisitors'))
            document.getElementById('kpiVisitors').textContent = data.total_visitors || 0;
        if (document.getElementById('kpiMessages'))
            document.getElementById('kpiMessages').textContent = data.total_messages || 0;
        if (document.getElementById('kpiProjects'))
            document.getElementById('kpiProjects').textContent = data.total_projects || 0;

    } catch (err) {
        console.error('Erreur stats:', err);
    }
};

const loadExpStats = async () => {
    try {
        const res  = await fetch(`${API}/experiences`);
        const data = await res.json();
        if (document.getElementById('kpiExperiences'))
            document.getElementById('kpiExperiences').textContent = data.length || 0;
    } catch (err) {}
};

const loadIAStats = async () => {
    // IA non configurée pour l'instant
    if (document.getElementById('iaKnowledge'))
        document.getElementById('iaKnowledge').textContent = '0';
    if (document.getElementById('iaDate'))
        document.getElementById('iaDate').textContent = new Date().toLocaleDateString('fr-FR');
    if (document.getElementById('iaRequests'))
        document.getElementById('iaRequests').textContent = '0';
};

// ===================================
// GRAPHIQUE VISITES
// ===================================
const loadChart = async () => {
    const canvas = document.getElementById('visitChart');
    if (!canvas) return;

    // ✅ Si on est sur la page analytics, ne pas créer le graphique
    if (window.location.pathname.includes('visitors.html')) {
        console.log('📊 Graphique géré par admin-visitors.js');
        return;
    }

    try {
        const res = await fetch(`${API}/visitors`, { headers: window.authHeaders });
        const visitors = await res.json();

        // Grouper par jour
        const labels = [];
        const counts = {};

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
            counts[key] = 0;
        }

        visitors.forEach(v => {
            const key = new Date(v.visited_at).toISOString().split('T')[0];
            if (counts[key] !== undefined) counts[key]++;
        });

        const data = Object.values(counts);
        const isDark = adminPage.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        const textColor = isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af';

        // ✅ Détruire l'ancien graphique s'il existe
        if (window.dashboardChartInstance) {
            window.dashboardChartInstance.destroy();
            window.dashboardChartInstance = null;
        }

        const ctx = canvas.getContext('2d');
        window.dashboardChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Tendance',
                        data,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                    },
                    {
                        type: 'bar',
                        label: 'Visites',
                        data,
                        backgroundColor: 'rgba(59,130,246,0.5)',
                        borderRadius: 4,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, maxTicksLimit: 10, font: { size: 10 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { size: 10 } },
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (err) {
        console.error('Erreur chart:', err);
    }
};

// ===================================
// DERNIERS PROJETS
// ===================================
const loadLastProjects = async () => {
    const container = document.getElementById('lastProjects');
    if (!container) return;

    try {
        const res      = await fetch(`${API}/projects`);
        const projects = await res.json();

        if (projects.length === 0) {
            container.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:20px;font-size:0.85rem;">Aucun projet</p>';
            return;
        }

        container.innerHTML = '';
        projects.slice(0, 5).forEach(proj => {
            container.innerHTML += `
                <div class="proj-item">
                    <div class="proj-thumb">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <div class="proj-info">
                        <div class="proj-name">${proj.title}</div>
                        <div class="proj-tech">${proj.technologies || 'Web'}</div>
                    </div>
                    <span class="proj-status online">ONLINE</span>
                    <button class="proj-edit" onclick="window.location.href='projects.html'">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </div>
            `;
        });

    } catch (err) {
        container.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:20px;font-size:0.85rem;">Erreur chargement</p>';
    }
};

// ===================================
// DERNIERS MESSAGES (DASHBOARD)
// ===================================
const loadLastMessages = async () => {
    const container = document.getElementById('lastMessages');
    if (!container) {
        console.log('⚠️ lastMessages non trouvé (page non dashboard)');
        return;
    }

    try {
        const res = await fetch(`${API}/messages`, { headers: window.authHeaders });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const messages = await res.json();
        console.log('📩 Messages dashboard:', messages.length);

        // Mettre à jour le badge
        await updateUnreadBadge();

        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;color:#9ca3af;padding:30px;font-size:0.85rem;">
                    <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
                    Aucun message reçu
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        messages.slice(0, 5).forEach(msg => {
            const initials = msg.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const date = new Date(msg.created_at);
            const timeAgo = getTimeAgo(date);
            const isUnread = !msg.is_read && !msg.is_archived;

            container.innerHTML += `
                <div class="msg-item ${isUnread ? 'unread' : ''}">
                    <div class="msg-avatar">${initials}</div>
                    <div class="msg-content">
                        <div class="msg-header">
                            <span class="msg-name">${msg.name}</span>
                            <span class="msg-time">${timeAgo}</span>
                            ${isUnread ? '<span class="msg-unread-badge">Nouveau</span>' : ''}
                        </div>
                        <div class="msg-preview">${msg.message.substring(0, 80)}${msg.message.length > 80 ? '...' : ''}</div>
                        <div class="msg-actions">
                            <button class="msg-btn reply" onclick="openReplyFromDashboard(${msg.id}, '${msg.name.replace(/'/g, "\\'")}', '${msg.email}', '${msg.subject ? msg.subject.replace(/'/g, "\\'") : ''}')">
                                <i class="fas fa-reply"></i> Répondre
                            </button>
                            <button class="msg-btn archive" onclick="archiveMsgFromDashboard(${msg.id})">
                                <i class="fas fa-archive"></i> ${msg.is_archived ? 'Désarchiver' : 'Archiver'}
                            </button>
                            <a href="messages.html" class="msg-btn view">
                                <i class="fas fa-eye"></i> Voir
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error('❌ Erreur chargement messages dashboard:', err);
        container.innerHTML = `
            <div style="text-align:center;color:#ef4444;padding:20px;font-size:0.85rem;">
                <i class="fas fa-exclamation-circle"></i> Erreur chargement
            </div>
        `;
    }
};

// ===================================
// METTRE À JOUR LE BADGE
// ===================================
const updateUnreadBadge = async () => {
    try {
        const res = await fetch(`${API}/messages`, { headers: window.authHeaders });
        if (!res.ok) return;
        const messages = await res.json();
        const unread = messages.filter(m => !m.is_read && !m.is_archived).length;
        
        const badge = document.getElementById('unreadBadge');
        const notifDot = document.getElementById('notifDot');
        
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'inline-block' : 'none';
        }
        if (notifDot) {
            notifDot.style.display = unread > 0 ? 'block' : 'none';
        }
    } catch (err) {
        console.error('Erreur mise à jour badge:', err);
    }
};

// ===================================
// RÉPONDRE DEPUIS LE DASHBOARD
// ===================================
const openReplyFromDashboard = (id, name, email, subject) => {
    // Essayer d'utiliser le modal de admin-messages.js
    if (typeof window.openReply === 'function') {
        window.openReply(id, name, email, subject);
    } else {
        // Fallback: ouvrir la page messages
        const url = `messages.html?reply=${id}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}`;
        window.location.href = url;
    }
};

// ===================================
// ARCHIVER DEPUIS LE DASHBOARD
// ===================================
const archiveMsgFromDashboard = async (id) => {
    try {
        const res = await fetch(`${API}/messages/${id}/archive`, {
            method: 'PUT',
            headers: window.authHeaders
        });
        
        if (res.ok) {
            // Recharger les messages
            await loadLastMessages();
            // Mettre à jour le badge
            await updateUnreadBadge();
        } else {
            alert('Erreur lors de l\'archivage');
        }
    } catch (err) {
        console.error('❌ Erreur archive:', err);
        alert('Erreur lors de l\'archivage');
    }
};

// ===================================
// UTILITAIRE - TEMPS RELATIF
// ===================================
const getTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60)     return 'À l\'instant';
    if (diff < 3600)   return `Il y a ${Math.floor(diff/60)} min`;
    if (diff < 86400)  return `Il y a ${Math.floor(diff/3600)} h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff/86400)} j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadExpStats();
    loadIAStats();
    loadLastProjects();
    loadLastMessages();  // ✅ AJOUTÉ !
    
    // ✅ Ne charger le graphique que si on n'est pas sur la page analytics
    if (!window.location.pathname.includes('visitors.html')) {
        loadChart();
    }
});