import confetti from 'canvas-confetti';

export class RomanticMessages {
  constructor(galaxyScene) {
    this.galaxyScene = galaxyScene;

    this.container = document.getElementById('romantic-quotes-container');
    this.heartsOverlay = document.getElementById('floating-hearts-overlay');

    // Modal elements
    this.modal = document.getElementById('custom-message-modal');
    this.btnCustomMessage = document.getElementById('btn-custom-message');
    this.btnCloseModal = document.getElementById('modal-close');
    this.btnSendMessage = document.getElementById('btn-send-message');

    this.inputSender = document.getElementById('input-sender');
    this.inputMessage = document.getElementById('input-message');

    // Curated Spanish Romantic Quotes
    this.defaultQuotes = [
      { text: "Eres la estrella más brillante de toda mi galaxia 💛", author: "Para ti" },
      { text: "Tu amor es mi agujero negro: me atrae hacia ti sin final ✨", author: "Amor Infinito" },
      { text: "21 de Septiembre: Te regalo un universo de Flores Amarillas 🌻", author: "Con todo mi corazón" },
      { text: "Entre billones de estrellas en el espacio, te elegiría a ti 💖", author: "Por siempre" },
      { text: "Un amor más grande que el mismo espacio-tiempo 🌌", author: "Eternamente" },
      { text: "Mi corazón orbita alrededor de tu luz 💛", author: "Tu Fan Número 1" }
    ];

    this.activeCards = [];
    this.init();
  }

  init() {
    this.setupModalEvents();
    this.spawnInitialQuotes();
    this.startAmbientHearts();
  }

  setupModalEvents() {
    const openModal = (e) => {
      if (e) e.stopPropagation();
      this.modal.classList.remove('hidden');
      setTimeout(() => this.inputMessage.focus(), 150);
    };

    const closeModal = (e) => {
      if (e) e.stopPropagation();
      this.modal.classList.add('hidden');
    };

    // Open Modal Event Listeners
    if (this.btnCustomMessage) {
      this.btnCustomMessage.addEventListener('click', openModal);
      this.btnCustomMessage.addEventListener('pointerdown', (e) => e.stopPropagation());
      this.btnCustomMessage.addEventListener('touchend', (e) => {
        e.preventDefault();
        openModal(e);
      });
    }

    // Close Modal Event Listeners
    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener('click', closeModal);
      this.btnCloseModal.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeModal(e);
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          closeModal(e);
        }
      });
    }

    // Send Message Handler
    const sendMessage = (e) => {
      if (e) e.stopPropagation();
      const sender = this.inputSender.value.trim() || 'Tu Amor';
      const text = this.inputMessage.value.trim();

      if (text) {
        this.createFloatingQuoteCard(text, sender, true);
        this.inputMessage.value = '';
        this.modal.classList.add('hidden');

        confetti({
          particleCount: 45,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ff2a75', '#ffaa00']
        });
      }
    };

    if (this.btnSendMessage) {
      this.btnSendMessage.addEventListener('click', sendMessage);
      this.btnSendMessage.addEventListener('touchend', (e) => {
        e.preventDefault();
        sendMessage(e);
      });
    }
  }

  spawnInitialQuotes() {
    for (let i = 0; i < (window.innerWidth < 768 ? 3 : 4); i++) {
      setTimeout(() => {
        const item = this.defaultQuotes[i % this.defaultQuotes.length];
        this.createFloatingQuoteCard(item.text, item.author);
      }, i * 1500);
    }

    setInterval(() => {
      const maxCards = window.innerWidth < 768 ? 3 : 5;
      if (this.activeCards.length < maxCards) {
        const randomQuote = this.defaultQuotes[Math.floor(Math.random() * this.defaultQuotes.length)];
        this.createFloatingQuoteCard(randomQuote.text, randomQuote.author);
      }
    }, 12000);
  }

  createFloatingQuoteCard(text, author, isUserCustom = false) {
    const card = document.createElement('div');
    card.className = 'floating-quote-card';

    const isMobile = window.innerWidth < 768;
    const top = Math.floor(Math.random() * (isMobile ? 45 : 50) + (isMobile ? 18 : 15));
    const left = Math.floor(Math.random() * (isMobile ? 45 : 60) + (isMobile ? 5 : 10));

    card.style.top = `${top}%`;
    card.style.left = `${left}%`;

    const icon = isUserCustom ? '💌' : (Math.random() < 0.5 ? '🌻' : '💖');

    card.innerHTML = `
      <div class="quote-icon">${icon}</div>
      <div class="quote-text">"${text}"</div>
      <div class="quote-author">— ${author}</div>
    `;

    const triggerBurst = (e) => {
      e.stopPropagation();

      card.style.transform = 'scale(1.15) rotate(4deg)';
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#ffd700', '#ff2a75']
      });

      setTimeout(() => {
        card.style.transform = '';
      }, 400);
    };

    card.addEventListener('click', triggerBurst);
    card.addEventListener('touchend', (e) => {
      e.preventDefault();
      triggerBurst(e);
    });

    this.container.appendChild(card);
    this.activeCards.push(card);

    if (!isUserCustom) {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transition = 'opacity 1.5s ease';
        setTimeout(() => {
          card.remove();
          this.activeCards = this.activeCards.filter((c) => c !== card);
        }, 1500);
      }, 22000);
    }
  }

  startAmbientHearts() {
    setInterval(() => {
      const heart = document.createElement('div');
      heart.className = 'ambient-heart';
      heart.textContent = Math.random() < 0.6 ? '💖' : '🌻';

      const left = Math.random() * 100;
      const duration = 6 + Math.random() * 5;
      const size = 0.7 + Math.random() * 0.7;

      heart.style.left = `${left}vw`;
      heart.style.animationDuration = `${duration}s`;
      heart.style.fontSize = `${size}rem`;

      this.heartsOverlay.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, duration * 1000);
    }, 1500);
  }
}
