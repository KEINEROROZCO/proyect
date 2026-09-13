export class CodeEditor {
  constructor(galaxyScene) {
    this.galaxyScene = galaxyScene;

    // Elements
    this.panelElement = document.getElementById('code-editor-panel');
    this.codeContentElement = document.getElementById('code-content');
    this.lineNumbersElement = document.getElementById('line-numbers');
    this.statusTextElement = document.getElementById('editor-status-text');
    this.toggleBtn = document.getElementById('btn-toggle-editor');
    this.toggleIcon = document.getElementById('toggle-editor-icon');
    this.typeEffectBtn = document.getElementById('btn-type-effect');

    // Controls Sliders
    this.sliderGlow = document.getElementById('slider-glow');
    this.sliderSpeed = document.getElementById('slider-speed');
    this.sliderSunflowers = document.getElementById('slider-sunflowers');
    this.sliderHearts = document.getElementById('slider-hearts');

    this.valGlow = document.getElementById('val-glow');
    this.valSpeed = document.getElementById('val-speed');
    this.valSunflowers = document.getElementById('val-sunflowers');
    this.valHearts = document.getElementById('val-hearts');

    // Tab Data
    this.activeTab = 'galaxia';
    this.isTyping = false;
    this.typewriterTimer = null;

    this.cssTemplates = {
      galaxia: `/* 🌌 Galaxia de Girasoles Amarillos */
.galaxia-dorada {
  brillo-estelar: 1.2;
  nucleo-color: #ffd700;
  brazos-espiral: 4;
  polvo-cosmico: activo;
  modo-rotacion: suave;
}

/* 🕳️ Agujero Negro Infinito */
#agujero-negro-central {
  horizonte-eventos: #000000;
  disco-acrecion: girando;
  velocidad-orbita: 1.0x;
  gravedad-amor: infinita;
}`,
      corazon: `/* 💖 Marco de Corazones Neón */
.marco-corazones-glowing {
  borde-animado: enable;
  brillo-neon: #ff2a75;
  particulas-flotantes: 1.5x;
  latidos-por-minuto: 72;
}

.universo-romantico {
  mensaje: "Eres mi galaxia entera 💛";
  fuegos-artificio: al-hacer-click;
  fondo: #05030a;
}`,
      girasol: `/* 🌻 Órbita de Girasoles 3D */
.girasoles-flotantes {
  cantidad-en-pantalla: 60;
  petalos-color: #ffd700;
  centro-semillas: #3d1c00;
  baile-cosmico: fluctuando;
  fragancia-estelar: viva;
}`
    };

    this.init();
  }

  init() {
    this.setupTabs();
    this.setupSliders();
    this.setupActions();

    // Render initial code with typewriter animation
    this.loadTabCode(this.activeTab, true);
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.editor-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;
        this.loadTabCode(this.activeTab, true);
      });
    });
  }

  setupSliders() {
    // Glow slider
    this.sliderGlow.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valGlow.textContent = val.toFixed(1);
      this.galaxyScene.updateParameters({ glowIntensity: val });
      this.updateCssVariable('brillo-estelar', val.toFixed(1));
    });

    // Speed slider
    this.sliderSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valSpeed.textContent = val.toFixed(1) + 'x';
      this.galaxyScene.updateParameters({ blackHoleSpeed: val });
      this.updateCssVariable('velocidad-orbita', val.toFixed(1) + 'x');
    });

    // Sunflowers slider
    this.sliderSunflowers.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valSunflowers.textContent = val;
      this.galaxyScene.updateParameters({ sunflowerCount: val });
      this.updateCssVariable('cantidad-en-pantalla', val);
    });

    // Hearts slider
    this.sliderHearts.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valHearts.textContent = val.toFixed(1) + 'x';
      this.galaxyScene.updateParameters({ heartFrequency: val });
      this.updateCssVariable('particulas-flotantes', val.toFixed(1) + 'x');
    });
  }

  setupActions() {
    // Minimize / Expand Panel
    this.toggleBtn.addEventListener('click', () => {
      this.panelElement.classList.toggle('minimized');
      if (this.panelElement.classList.contains('minimized')) {
        this.toggleIcon.textContent = '▲';
      } else {
        this.toggleIcon.textContent = '▼';
      }
    });

    // Typewriter effect trigger
    this.typeEffectBtn.addEventListener('click', () => {
      this.loadTabCode(this.activeTab, true);
    });
  }

  loadTabCode(tabKey, animated = false) {
    const rawCss = this.cssTemplates[tabKey] || '';

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    if (!animated) {
      this.renderFormattedCode(rawCss);
      return;
    }

    // Typewriter Effect
    this.isTyping = true;
    this.statusTextElement.textContent = '⚡ Escribiendo Código Romántico...';

    let currentLength = 0;
    this.typewriterTimer = setInterval(() => {
      currentLength += 3;
      if (currentLength >= rawCss.length) {
        currentLength = rawCss.length;
        clearInterval(this.typewriterTimer);
        this.isTyping = false;
        this.statusTextElement.textContent = 'CSS Ejecutándose en Tiempo Real';
      }
      const partialCss = rawCss.substring(0, currentLength);
      this.renderFormattedCode(partialCss);
    }, 15);
  }

  // Syntax Highlighting Engine for CSS Code
  highlightSyntax(cssText) {
    let html = cssText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight comments /* ... */
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');

    // Highlight selectors (.class, #id)
    html = html.replace(/([.#][\w-]+(?=\s*\{))/g, '<span class="token-selector">$1</span>');

    // Highlight CSS properties before colon (e.g. brillo-estelar:)
    html = html.replace(/([\w-]+)(?=\s*:)/g, '<span class="token-property">$1</span>');

    // Highlight values after colon up to semicolon
    html = html.replace(/(:\s*)([^;\n\}]+)/g, (match, p1, p2) => {
      // If it's a string in quotes
      if (p2.trim().startsWith('"') || p2.trim().startsWith("'")) {
        return p1 + `<span class="token-string">${p2}</span>`;
      }
      return p1 + `<span class="token-value">${p2}</span>`;
    });

    return html;
  }

  renderFormattedCode(cssText) {
    const highlighted = this.highlightSyntax(cssText);
    this.codeContentElement.innerHTML = highlighted;

    // Update Line Numbers
    const lineCount = cssText.split('\n').length;
    let lineNumsHtml = '';
    for (let i = 1; i <= Math.max(lineCount, 1); i++) {
      lineNumsHtml += `${i}<br>`;
    }
    this.lineNumbersElement.innerHTML = lineNumsHtml;
  }

  updateCssVariable(propName, newValue) {
    let currentCode = this.cssTemplates[this.activeTab];
    const regex = new RegExp(`(${propName}\\s*:\\s*)([^;\\n]+)`, 'g');
    if (regex.test(currentCode)) {
      this.cssTemplates[this.activeTab] = currentCode.replace(regex, `$1${newValue}`);
      if (!this.isTyping) {
        this.renderFormattedCode(this.cssTemplates[this.activeTab]);
      }
    }
  }
}
