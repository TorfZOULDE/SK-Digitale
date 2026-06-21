const chatBox     = document.getElementById('chatBox');
const chatInput   = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

let knowledge = [];

// ===================================
// CHARGER BASE DE CONNAISSANCES
// ===================================
const loadKnowledge = async () => {
    try {
        const res = await fetch(`${API}/ai/knowledge`);
        knowledge = await res.json();
    } catch (err) {
        console.error('Erreur chargement IA:', err);
    }
};

// ===================================
// AJOUTER MESSAGE
// ===================================
const addMessage = (text, type) => {
    const icon = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    const bubbleClass = type === 'user' ? 'user-bubble' : 'bot-bubble';
    const avatarClass = type === 'user' ? 'user-avatar' : 'bot-avatar';

    const msg = document.createElement('div');
    msg.classList.add('chat-msg', type);
    msg.innerHTML = `
        <div class="chat-avatar ${avatarClass}">
            <i class="${icon}"></i>
        </div>
        <div class="chat-bubble ${bubbleClass}">${text}</div>
    `;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
};

// ===================================
// ANIMATION FRAPPE
// ===================================
const addTyping = () => {
    const typing = document.createElement('div');
    typing.classList.add('chat-msg', 'bot');
    typing.id = 'typingIndicator';
    typing.innerHTML = `
        <div class="chat-avatar bot-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-bubble bot-bubble chat-typing">
            <span></span><span></span><span></span>
        </div>
    `;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
};

const removeTyping = () => {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
};

// ===================================
// TROUVER RÉPONSE
// ===================================
const findAnswer = (question) => {
    const q = question.toLowerCase();

    // Cherche dans la base de connaissances
    const match = knowledge.find(k => {
        const kq = k.question.toLowerCase();
        const words = q.split(' ').filter(w => w.length > 3);
        return words.some(w => kq.includes(w)) || kq.includes(q.substring(0, 10));
    });

    if (match) return match.answer;

    // Réponses par défaut
    if (q.includes('qui') || q.includes('torf') || q.includes('vous'))
        return 'Je suis Torf Zoulde, étudiant passionné en Informatique de Gestion à l\'ENEAM. Je me spécialise en développement web et administration réseau.';

    if (q.includes('compétence') || q.includes('skill') || q.includes('technologie'))
        return 'Je maîtrise HTML/CSS, JavaScript, React, Node.js, PHP, Laravel, Python, MySQL, Linux, et les réseaux Cisco. Consultez la section Compétences pour plus de détails.';

    if (q.includes('projet'))
        return 'J\'ai réalisé plusieurs projets en développement web et administration réseau. Visitez la page Projets pour les découvrir en détail.';

    if (q.includes('contact') || q.includes('email') || q.includes('joindre'))
        return 'Vous pouvez me contacter via le formulaire de contact sur ce site, ou directement par email. Je suis disponible pour des stages et collaborations.';

    if (q.includes('parcours') || q.includes('formation') || q.includes('étude'))
        return 'Je suis actuellement en Licence d\'Administration des Réseaux & Systèmes à l\'ENEAM, après un BAC+2 en Informatique de Gestion obtenu en 2026.';

    if (q.includes('disponible') || q.includes('stage') || q.includes('emploi'))
        return 'Oui, je suis disponible pour des stages, des collaborations ou un premier emploi en développement web ou administration réseau.';

    return 'Je ne suis pas sûr de comprendre votre question. Pouvez-vous reformuler ? Vous pouvez me demander des informations sur les compétences, projets, parcours ou comment contacter Torf Zoulde.';
};

// ===================================
// ENVOYER MESSAGE
// ===================================
const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    addTyping();

    setTimeout(() => {
        removeTyping();
        const answer = findAnswer(text);
        addMessage(answer, 'bot');
    }, 800 + Math.random() * 500);
};

// ===================================
// SUGGESTION
// ===================================
const askQuestion = (question) => {
    chatInput.value = question;
    sendMessage();
};

// ===================================
// EVENTS
// ===================================
if (chatSendBtn) chatSendBtn.addEventListener('click', sendMessage);

if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', loadKnowledge);
