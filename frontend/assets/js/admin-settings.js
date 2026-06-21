// ===================================
// TOGGLE MOT DE PASSE
// ===================================
const togglePwd = (inputId, btn) => {
    const input = document.getElementById(inputId);
    const icon  = btn.querySelector('i');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.replace(
        isPassword ? 'fa-eye' : 'fa-eye-slash',
        isPassword ? 'fa-eye-slash' : 'fa-eye'
    );
};

// ===================================
// AFFICHER STATUS
// ===================================
const showStatus = (id, message, type) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className   = `settings-status ${type}`;
    setTimeout(() => { el.style.display = 'none'; }, 4000);
};

// ===================================
// SAUVEGARDER PROFIL
// ===================================
const saveProfile = document.getElementById('saveProfile');
if (saveProfile) {
    saveProfile.addEventListener('click', async () => {
        const username = document.getElementById('settingsUsername').value.trim();

        if (!username) {
            showStatus('profileStatus', 'Le nom d\'utilisateur est obligatoire.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API}/auth/profile`, {
                method: 'PUT',
                headers: window.authHeaders,
                body: JSON.stringify({ username })
            });

            if (res.ok) {
                showStatus('profileStatus', '✅ Profil mis à jour avec succès.', 'success');
            } else {
                const data = await res.json();
                showStatus('profileStatus', data.message || 'Erreur lors de la mise à jour.', 'error');
            }
        } catch (err) {
            showStatus('profileStatus', 'Impossible de contacter le serveur.', 'error');
        }
    });
}

// ===================================
// CHANGER MOT DE PASSE
// ===================================
const savePassword = document.getElementById('savePassword');
if (savePassword) {
    savePassword.addEventListener('click', async () => {
        const current  = document.getElementById('currentPassword').value.trim();
        const newPwd   = document.getElementById('newPassword').value.trim();
        const confirm  = document.getElementById('confirmPassword').value.trim();

        if (!current || !newPwd || !confirm) {
            showStatus('passwordStatus', 'Veuillez remplir tous les champs.', 'error');
            return;
        }

        if (newPwd !== confirm) {
            showStatus('passwordStatus', 'Les mots de passe ne correspondent pas.', 'error');
            return;
        }

        if (newPwd.length < 6) {
            showStatus('passwordStatus', 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API}/auth/change-password`, {
                method: 'PUT',
                headers: window.authHeaders,
                body: JSON.stringify({ currentPassword: current, newPassword: newPwd })
            });

            if (res.ok) {
                showStatus('passwordStatus', '✅ Mot de passe changé avec succès.', 'success');
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value     = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                const data = await res.json();
                showStatus('passwordStatus', data.message || 'Mot de passe actuel incorrect.', 'error');
            }
        } catch (err) {
            showStatus('passwordStatus', 'Impossible de contacter le serveur.', 'error');
        }
    });
}

// ===================================
// THÈME ADMIN
// ===================================
const setAdminTheme = (theme) => {
    const adminPage = document.querySelector('.admin-page');
    const themeIcon = document.getElementById('themeToggle').querySelector('i');

    adminPage.classList.remove('light', 'dark');
    adminPage.classList.add(theme);

    themeIcon.classList.replace(
        theme === 'light' ? 'fa-moon' : 'fa-sun',
        theme === 'light' ? 'fa-sun'  : 'fa-moon'
    );

    localStorage.setItem('admin_theme', theme);

    // Update checks
    document.getElementById('checkLight').style.display = theme === 'light' ? 'block' : 'none';
    document.getElementById('checkDark').style.display  = theme === 'dark'  ? 'block' : 'none';

    document.getElementById('themeLight').classList.toggle('active', theme === 'light');
    document.getElementById('themeDark').classList.toggle('active',  theme === 'dark');
};

// ===================================
// DÉCONNEXION
// ===================================
const btnLogoutAll = document.getElementById('btnLogoutAll');
if (btnLogoutAll) {
    btnLogoutAll.addEventListener('click', () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_theme');
        window.location.href = 'login.html';
    });
}

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Charge le thème sauvegardé
    const savedTheme = localStorage.getItem('admin_theme') || 'light';
    setAdminTheme(savedTheme);

    // Charge le username
    const username = document.getElementById('settingsUsername');
    if (username) username.value = 'admin';

    const name = document.getElementById('settingsName');
    if (name) name.value = 'Torf Zoulde';
});


// ===================================
// THÈME & COULEUR DU SITE PUBLIC
// ===================================
let selectedSiteTheme = 'dark';

const selectSiteTheme = (theme) => {
    selectedSiteTheme = theme;
    document.getElementById('siteCheckLight').style.display = theme === 'light' ? 'block' : 'none';
    document.getElementById('siteCheckDark').style.display  = theme === 'dark'  ? 'block' : 'none';
    document.getElementById('siteThemeLight').classList.toggle('active', theme === 'light');
    document.getElementById('siteThemeDark').classList.toggle('active',  theme === 'dark');
};

// Synchronise le color picker et le champ texte
const colorPicker = document.getElementById('primaryColorPicker');
const colorText    = document.getElementById('primaryColorText');

if (colorPicker && colorText) {
    colorPicker.addEventListener('input', () => {
        colorText.value = colorPicker.value;
    });
    colorText.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) {
            colorPicker.value = colorText.value;
        }
    });
}

// Charge les réglages actuels du site
const loadSiteSettings = async () => {
    try {
        const res  = await fetch(`${API}/settings`);
        const data = await res.json();

        selectSiteTheme(data.default_theme || 'dark');

        if (data.primary_color) {
            colorPicker.value = data.primary_color;
            colorText.value   = data.primary_color;
        }
    } catch (err) {
        console.error('Erreur chargement réglages site:', err);
        selectSiteTheme('dark');
    }
};

// Sauvegarder les réglages du site
const saveSiteSettings = document.getElementById('saveSiteSettings');
if (saveSiteSettings) {
    saveSiteSettings.addEventListener('click', async () => {
        const primary_color = colorText.value.trim();

        if (!/^#[0-9A-Fa-f]{6}$/.test(primary_color)) {
            showStatus('siteSettingsStatus', 'Couleur invalide. Utilisez le format #RRGGBB.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API}/settings`, {
                method: 'PUT',
                headers: window.authHeaders,
                body: JSON.stringify({
                    default_theme: selectedSiteTheme,
                    primary_color
                })
            });

            if (res.ok) {
                showStatus('siteSettingsStatus', '✅ Réglages appliqués au site avec succès.', 'success');
            } else {
                showStatus('siteSettingsStatus', 'Erreur lors de la sauvegarde.', 'error');
            }
        } catch (err) {
            showStatus('siteSettingsStatus', 'Impossible de contacter le serveur.', 'error');
        }
    });
}

// ===================================
// STATUT SYSTÈME RÉEL
// ===================================
const loadSystemStatus = async () => {
    try {
        const res  = await fetch(`${API}/settings/system-status`, { headers: window.authHeaders });
        const data = await res.json();

        if (document.getElementById('sysVersion'))
            document.getElementById('sysVersion').textContent = 'v' + data.version;

        if (document.getElementById('nodeVersion'))
            document.getElementById('nodeVersion').textContent = data.nodeVersion;

        const dbEl = document.getElementById('dbStatus');
        if (dbEl) {
            dbEl.className = data.dbConnected ? 'sys-info-value sys-ok' : 'sys-info-value sys-error';
            dbEl.innerHTML = data.dbConnected
                ? '<i class="fas fa-circle"></i> Connectée'
                : '<i class="fas fa-circle"></i> Déconnectée';
        }

        const jwtEl = document.getElementById('jwtStatus');
        if (jwtEl) {
            jwtEl.className = data.jwtActive ? 'sys-info-value sys-ok' : 'sys-info-value sys-error';
            jwtEl.innerHTML = data.jwtActive
                ? '<i class="fas fa-circle"></i> Actif'
                : '<i class="fas fa-circle"></i> Inactif';
        }

    } catch (err) {
        console.error('Erreur statut système:', err);
        const dbEl = document.getElementById('dbStatus');
        if (dbEl) {
            dbEl.className = 'sys-info-value sys-error';
            dbEl.innerHTML = '<i class="fas fa-circle"></i> Erreur';
        }
    }
};

document.addEventListener('DOMContentLoaded', loadSystemStatus);
// Charge au démarrage
document.addEventListener('DOMContentLoaded', loadSiteSettings);