// ===================================
// admin-visitors.js - Page Analytics
// ===================================

let visitChartInstance = null;

// ===================================
// CHARGER VISITEURS
// ===================================
const loadVisitors = async () => {
    try {
        const res = await fetch(`${API}/visitors`, { headers: window.authHeaders });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const visitors = await res.json();
        console.log('📊 Visiteurs reçus:', visitors.length);

        renderKPI(visitors);
        renderChart(visitors);
        renderTopPages(visitors);
        renderTable(visitors);

    } catch (err) {
        console.error('❌ Erreur chargement visiteurs:', err);
        const tbody = document.getElementById('visitorsTable');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" class="table-empty">❌ ${err.message}</td></tr>`;
        }
    }
};

// ===================================
// KPI
// ===================================
const renderKPI = (visitors) => {
    const total = visitors.length;
    const today = visitors.filter(v => {
        const d = new Date(v.visited_at);
        const n = new Date();
        return d.toDateString() === n.toDateString();
    }).length;

    const pages = {};
    visitors.forEach(v => {
        let page = v.page || '/';
        if (page === '/' || page === '') page = 'Accueil';
        pages[page] = (pages[page] || 0) + 1;
    });
    const topPage = Object.entries(pages).sort((a, b) => b[1] - a[1])[0];

    const browsers = new Set();
    visitors.forEach(v => {
        if (v.user_agent) {
            const browser = getBrowserName(v.user_agent);
            browsers.add(browser);
        }
    });

    if (document.getElementById('totalVisits'))
        document.getElementById('totalVisits').textContent = total;
    if (document.getElementById('todayVisits'))
        document.getElementById('todayVisits').textContent = today;
    if (document.getElementById('topPage'))
        document.getElementById('topPage').textContent = topPage ? cleanPageName(topPage[0]) : '—';
    if (document.getElementById('uniqueBrowsers'))
        document.getElementById('uniqueBrowsers').textContent = browsers.size;
};

// ===================================
// NETTOYER NOM DE PAGE
// ===================================
const cleanPageName = (page) => {
    if (!page || page === '/') return 'Accueil';
    let name = page;
    if (name.includes('/pages/')) name = name.replace('/pages/', '');
    if (name.includes('/home/')) name = name.split('/').pop();
    if (name.includes('.')) name = name.split('.')[0];
    name = name.replace(/^\/+/, '');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name || 'Page';
};

// ===================================
// GRAPHIQUE
// ===================================
const renderChart = (visitors) => {
    const canvas = document.getElementById('visitChart');
    if (!canvas) {
        console.warn('⚠️ Canvas visitChart introuvable');
        return;
    }

    // ✅ Nettoyer le canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (visitChartInstance) {
        visitChartInstance.destroy();
        visitChartInstance = null;
    }

    const labels = [];
    const counts = {};
    const today = new Date();

    // ✅ Générer les 30 derniers jours
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
        counts[key] = 0;
    }

    visitors.forEach(v => {
        const key = new Date(v.visited_at).toISOString().split('T')[0];
        if (counts[key] !== undefined) counts[key]++;
    });

    const data = Object.values(counts);
    const isDark = document.querySelector('.admin-page')?.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af';

    visitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Tendance',
                    data,
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255,107,53,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
                {
                    type: 'bar',
                    label: 'Visites',
                    data,
                    backgroundColor: 'rgba(255,107,53,0.5)',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { size: 10 } }
                }
            }
        }
    });
};

// ===================================
// PAGES POPULAIRES
// ===================================
const renderTopPages = (visitors) => {
    const container = document.getElementById('topPages');
    if (!container) return;

    const pages = {};
    visitors.forEach(v => {
        let page = cleanPageName(v.page);
        pages[page] = (pages[page] || 0) + 1;
    });

    const sorted = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0] ? sorted[0][1] : 1;

    if (sorted.length === 0) {
        container.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:20px;font-size:0.85rem;">Aucune donnée</p>';
        return;
    }

    container.innerHTML = '';
    sorted.forEach(([page, count]) => {
        const pct = Math.round((count / max) * 100);
        container.innerHTML += `
            <div class="top-page-item">
                <span class="top-page-name" title="${page}">${page}</span>
                <div class="top-page-bar">
                    <div class="top-page-fill" style="width:${pct}%"></div>
                </div>
                <span class="top-page-count">${count}</span>
            </div>
        `;
    });
};

// ===================================
// TABLEAU VISITEURS
// ===================================
const renderTable = (visitors) => {
    const tbody = document.getElementById('visitorsTable');
    if (!tbody) return;

    if (visitors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Aucun visiteur pour le moment</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    visitors.slice(0, 50).forEach(v => {
        const date = new Date(v.visited_at).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        const browser = v.user_agent ? getBrowserName(v.user_agent) : '—';
        const page = cleanPageName(v.page);
        const ip = v.ip_address || v.ip || '—';

        tbody.innerHTML += `
            <tr>
                <td><code>${ip}</code></td>
                <td>${browser}</td>
                <td>${page}</td>
                <td>${date}</td>
            </tr>
        `;
    });
};

// ===================================
// UTILITAIRE - NAVIGATEUR
// ===================================
const getBrowserName = (userAgent) => {
    if (!userAgent) return '—';
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    if (ua.includes('brave')) return 'Brave';
    return 'Autre';
};

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadVisitors);