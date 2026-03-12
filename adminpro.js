// =============================================
//  BLOC À REMPLACER dans Adminpro.html
//  Cherche la ligne:  "// Chargement direct sans vérification d'auth"
//  Et remplace TOUT ce qui suit jusqu'à </script> par ce bloc :
// =============================================

    // ✅ Vérification auth avant de charger les projets
    auth.onAuthStateChanged(user => {
        if (user) {
            loadProjects();
        } else {
            // Pas connecté → retour au login
            window.location.href = 'index.html';
        }
    });