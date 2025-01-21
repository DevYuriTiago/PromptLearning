class ContentProtection {
  constructor() {
    this.watermarkText = '';
    this.protectionEnabled = true;
  }

  initialize(userId, sessionId) {
    this.watermarkText = `ID:${userId}-${sessionId}`;
    this.setupProtection();
  }

  setupProtection() {
    if (!this.protectionEnabled) return;

    // Desabilita atalhos de teclado comuns
    this.disableKeyboardShortcuts();
    
    // Adiciona proteção contra seleção de texto
    this.preventTextSelection();
    
    // Adiciona proteção contra DevTools
    this.preventDevTools();
    
    // Adiciona marca d'água invisível
    this.addInvisibleWatermark();
    
    // Monitora tentativas de captura de tela
    this.monitorScreenCapture();
  }

  disableKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Previne Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && (
          e.key === 'c' ||
          e.key === 'v' ||
          e.key === 'p' ||
          e.key === 's'
        )) ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    }, { passive: false });
  }

  preventTextSelection() {
    // Adiciona CSS para prevenir seleção
    const style = document.createElement('style');
    style.textContent = `
      .protected-content {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      .protected-content * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);

    // Previne eventos de cópia
    document.addEventListener('copy', (e) => {
      if (this.isProtectedElement(e.target)) {
        e.preventDefault();
      }
    });

    document.addEventListener('contextmenu', (e) => {
      if (this.isProtectedElement(e.target)) {
        e.preventDefault();
      }
    });
  }

  preventDevTools() {
    // Detecta abertura do DevTools
    const devToolsDetector = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        this.handleDevToolsOpen();
      }
    };

    window.addEventListener('resize', devToolsDetector);
    setInterval(devToolsDetector, 1000);

    // Ofusca o conteúdo quando DevTools está aberto
    this.obfuscateContent();
  }

  addInvisibleWatermark() {
    const addWatermark = (element) => {
      const originalContent = element.innerHTML;
      const watermarkedContent = this.insertInvisibleCharacters(originalContent);
      element.innerHTML = watermarkedContent;
    };

    // Adiciona marca d'água a elementos protegidos
    document.querySelectorAll('.protected-content').forEach(addWatermark);

    // Observa novos elementos adicionados
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.classList?.contains('protected-content')) {
            addWatermark(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  monitorScreenCapture() {
    // Detecta tentativa de captura de tela
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        this.handleScreenCapture();
      }
    });

    // Monitora mudanças de visibilidade
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleScreenCapture();
      }
    });
  }

  insertInvisibleCharacters(text) {
    const invisible = '⁣'; // Caractere invisível
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += text[i] + invisible + this.watermarkText[i % this.watermarkText.length];
    }
    return result;
  }

  obfuscateContent() {
    const style = document.createElement('style');
    style.textContent = `
      .protected-content.devtools-open {
        filter: blur(5px);
        opacity: 0.5;
      }
    `;
    document.head.appendChild(style);
  }

  handleDevToolsOpen() {
    document.querySelectorAll('.protected-content').forEach(element => {
      element.classList.add('devtools-open');
    });
  }

  handleScreenCapture() {
    // Registra tentativa de captura
    console.warn('Tentativa de captura de tela detectada');
    
    // Adiciona classe temporária para ofuscar conteúdo
    document.querySelectorAll('.protected-content').forEach(element => {
      element.classList.add('screen-capture-protection');
      setTimeout(() => {
        element.classList.remove('screen-capture-protection');
      }, 1000);
    });
  }

  isProtectedElement(element) {
    return element.closest('.protected-content') !== null;
  }

  // Método para proteger elementos específicos
  protect(element) {
    element.classList.add('protected-content');
    this.addInvisibleWatermark();
  }

  // Método para desproteger elementos específicos
  unprotect(element) {
    element.classList.remove('protected-content');
  }
}

export default new ContentProtection();
