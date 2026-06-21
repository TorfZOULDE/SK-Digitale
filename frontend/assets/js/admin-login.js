const API = 'http://localhost:3000/api';

// ===================================
// TOGGLE MOT DE PASSE
// ===================================
const togglePassword = document.getElementById('togglePassword');
const passwordInput  = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.querySelector('i').classList.replace(
        isPassword ? 'fa-eye' : 'fa-eye-slash',
        isPassword ? 'fa-eye-slash' : 'fa-eye'
    );
});

// ===================================
// CONNEXION
// ===================================
const btnLogin        = document.getElementById('btnLogin');
const errorAlert      = document.getElementById('errorAlert');
const errorMessage    = document.getElementById('errorMessage');
const loadingIndicator = document.getElementById('loadingIndicator');

const showError = (msg) => {
    errorMessage.textContent = msg;
    errorAlert.style.display = 'flex';
};

const hideError = () => {
    errorAlert.style.display = 'none';
};

btnLogin.addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    hideError();

    if (!username || !password) {
        showError('Veuillez remplir tous les champs.');
        return;
    }

    btnLogin.style.display      = 'none';
    loadingIndicator.style.display = 'flex';

    try {
        const res  = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('admin_token', data.token);
            window.location.href = 'dashboard.html';
        } else {
            showError(data.message || 'Identifiants incorrects.');
        }

    } catch (err) {
        showError('Impossible de contacter le serveur.');
    }

    btnLogin.style.display         = 'flex';
    loadingIndicator.style.display = 'none';
});

// Connexion avec Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnLogin.click();
});
