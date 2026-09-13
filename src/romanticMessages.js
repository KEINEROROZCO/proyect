import confetti from 'canvas-confetti';

export class RomanticMessages {
  constructor(galaxyScene, audioSynth) {
    this.galaxyScene = galaxyScene;
    this.audioSynth = audioSynth;

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
    this.btnCustomMessage.addEventListener('click', () => {
      this.modal.classList.remove('hidden');
    });

    this.btnCloseModal.addEventListener('click', () => {
      this.modal.classList.add('hidden');
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.modal.classList.add('hidden');
      }
    });

    this.btnSendMessage.addEventListener('click', () => {
      const sender = this.inputSender.value.trim() || 'Tu Amor';
      const text = this.inputMessage.value.trim();

      if (text) {
        this.createFloatingQuoteCard(text, sender, true);
        this.inputMessage.value = '';
        this.modal.classList.add('hidden');

        // Play chime sound & celebration burst
        if (this.audioSynth) this.audioSynth.playChime();
        confetti({
          particleCount: 50,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ff2a75', '#ffaa00']
        });
      }
    });
  }

  spawnInitialQuotes() {
    // Spawn 4 random floating cards initially
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const item = this.defaultQuotes[i % this.defaultQuotes.length];
        this.createFloatingQuoteCard(item.text, item.author);
      }, i * 1500);
    }

    // Periodically cycle & float new quotes
    setInterval(() => {
      if (this.activeCards.length < 5) {
        const randomQuote = this.defaultQuotes[Math.floor(Math.random() * this.defaultQuotes.length)];
        this.createFloatingQuoteCard(randomQuote.text, randomQuote.author);
      }
    }, 12000);
  }

  createFloatingQuoteCard(text, author, isUserCustom = false) {
    const card = document.createElement('div');
    card.className = 'floating-quote-card';

    // Random positioning around canvas viewport
    const top = Math.floor(Math.random() * 50 + 15);
    const left = Math.floor(Math.random() * 65 + 10);

    card.style.top = `${top}%`;
    card.style.left = `${left}%`;

    const icon = isUserCustom ? '💌' : (Math.random() < 0.5 ? '🌻' : '💖');

    card.innerHTML = `
      <div class="quote-icon">${icon}</div>
      <div class="quote-text">"${text}"</div>
      <div class="quote-author">— ${author}</div>
    `;

    // Click on card effect
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.audioSynth) this.audioSynth.playChime();

      card.style.transform = 'scale(1.2) rotate(5deg)';
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#ffd700', '#ff2a75']
      });

      setTimeout(() => {
        card.style.transform = '';
      }, 400);
    });

    this.container.appendChild(card);
    this.activeCards.push(card);

    // Auto cleanup after 25s unless it's user custom
    if (!isUserCustom) {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transition = 'opacity 1.5s ease';
        setTimeout(() => {
          card.remove();
          this.activeCards = this.activeCards.filter((c) => c !== card);
        }, 1500);
      }, 25000);
    }
  }

  // Generate continuous background ambient floating hearts
  startAmbientHearts() {
    setInterval(() => {
      const heart = document.createElement('div');
      heart.className = 'ambient-heart';
      heart.textContent = Math.random() < 0.6 ? '💖' : '🌻';

      const left = Math.random() * 100;
      const duration = 6 + Math.random() * 5;
      const size = 0.8 + Math.random() * 0.8;

      heart.style.left = `${left}vw`;
      heart.style.animationDuration = `${duration}s`;
      heart.style.fontSize = `${size}rem`;

      this.heartsOverlay.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, duration * 1000);
    }, 1200);
  }
}
