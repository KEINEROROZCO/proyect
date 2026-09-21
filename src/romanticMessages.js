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

    // Expanded Spanish Romantic & Sunflower Quotes
    this.defaultQuotes = [
      { text: "Te quiero mucho 💛", author: "Con todo mi amor" },
      { text: "Feliz día de las flores amarillas 🌻✨", author: "21 de Septiembre" },
      { text: "Eres la estrella más brillante de toda mi galaxia 💛", author: "Para ti" },
      { text: "Tu amor es mi agujero negro: me atrae hacia ti sin final ✨", author: "Amor Infinito" },
      { text: "Entre billones de estrellas en el espacio, te elegiría siempre a ti 💖", author: "Por siempre" },
      { text: "Un amor más grande que el mismo espacio-tiempo 🌌", author: "Eternamente" },
      { text: "Mi corazón orbita alrededor de tu luz 💛", author: "Tu Fan Número 1" },
      { text: "Cada flor amarilla lleva un pedacito de mi corazón 🌻", author: "Para la persona más especial" },
      { text: "Eres lo mejor que me ha pasado en la vida 💖", author: "Siempre tuyo" },
      { text: "Tu sonrisa ilumina todo mi universo ✨💛", author: "Con admiración" },
      { text: "Flores amarillas para la persona que alegra mis días 🌻💖", author: "Detalle especial" },
      { text: "Te amo hoy, mañana y para siempre 💫", author: "Mi vida entera" },
      { text: "Mi lugar favorito en el mundo entero es a tu lado 💛", author: "Juntos por siempre" },
      { text: "Eres mi sol en los días nublados ☀️💛", author: "Te adoro" },
      { text: "Gracias por llenar mi vida de luz, risas y colores 🌻✨", author: "Universo de amor" },
      { text: "Contigo hasta el infinito y más allá 🌌💫", author: "Amor Estelar" },
      { text: "Eres mi sueño hecho realidad 💖", author: "Con todo mi corazón" },
      { text: "Un detalle amarillo para alguien verdaderamente inolvidable 🌻💛", author: "21 de Septiembre" },
      { text: "Te adoro con toda mi alma y mi corazón 💖✨", author: "Por siempre tuyo" },
      { text: "Eres el centro de mi propia galaxia 🌌💛", author: "Amor Eterno" }
    ];

    this.activeCards = [];
    this.quoteIndex = 0;
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
    const isMobile = window.innerWidth < 768;
    const initialCount = isMobile ? 3 : 4;

    // Spawn initial quotes with staggered delay
    for (let i = 0; i < initialCount; i++) {
      setTimeout(() => {
        this.spawnNextQuote();
      }, i * 1200);
    }

    // Continuous gradual spawner to maintain multiple floating messages simultaneously
    setInterval(() => {
      const maxCards = window.innerWidth < 768 ? 4 : 6;
      if (this.activeCards.length < maxCards) {
        this.spawnNextQuote();
      }
    }, 2800);
  }

  spawnNextQuote() {
    const item = this.defaultQuotes[this.quoteIndex % this.defaultQuotes.length];
    this.quoteIndex++;
    this.createFloatingQuoteCard(item.text, item.author);
  }

  findNonOverlappingPosition() {
    const isMobile = window.innerWidth < 768;
    const minTop = isMobile ? 16 : 14;
    const maxTop = isMobile ? 70 : 75;
    const minLeft = isMobile ? 5 : 8;
    const maxLeft = isMobile ? 50 : 68;

    let bestTop = 30;
    let bestLeft = 30;
    let maxMinDist = -1;

    // Attempt 12 random candidate positions to find maximum spacing from existing active cards
    for (let attempt = 0; attempt < 12; attempt++) {
      const candTop = Math.floor(Math.random() * (maxTop - minTop) + minTop);
      const candLeft = Math.floor(Math.random() * (maxLeft - minLeft) + minLeft);

      if (this.activeCards.length === 0) {
        return { top: candTop, left: candLeft };
      }

      let minDist = Infinity;
      for (const cardData of this.activeCards) {
        const dTop = candTop - cardData.pos.top;
        const dLeft = candLeft - cardData.pos.left;
        const dist = Math.sqrt(dTop * dTop + dLeft * dLeft);
        if (dist < minDist) minDist = dist;
      }

      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestTop = candTop;
        bestLeft = candLeft;
      }
    }

    return { top: bestTop, left: bestLeft };
  }

  createFloatingQuoteCard(text, author, isUserCustom = false) {
    const card = document.createElement('div');
    card.className = 'floating-quote-card fade-in-card';

    const pos = this.findNonOverlappingPosition();
    card.style.top = `${pos.top}%`;
    card.style.left = `${pos.left}%`;

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
        particleCount: 25,
        spread: 50,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#ffd700', '#ff2a75', '#ffffff']
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

    const cardRecord = { element: card, pos: pos };
    this.activeCards.push(cardRecord);

    // Gradual Lifecycle: Display for 8.5s - 12s, then smooth fade-out and replace
    const displayDuration = isUserCustom ? 25000 : (8500 + Math.random() * 3500);

    setTimeout(() => {
      card.classList.add('fade-out');
      setTimeout(() => {
        card.remove();
        this.activeCards = this.activeCards.filter((c) => c !== cardRecord);
      }, 1200);
    }, displayDuration);
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
    }, 1400);
  }
}
