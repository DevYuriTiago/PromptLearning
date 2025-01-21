import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas';

export const contentProtectionService = {
  // Desabilita atalhos de teclado comuns
  disableKeyboardShortcuts(event) {
    // Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S, F12
    if (
      (event.ctrlKey && ['c', 'v', 'p', 's'].includes(event.key.toLowerCase())) ||
      event.key === 'F12' ||
      event.key === 'PrintScreen'
    ) {
      event.preventDefault();
      return false;
    }
  },

  // Adiciona marca d'água ao conteúdo
  addWatermark(text, userId) {
    const watermark = `${text} - ID: ${userId} - ${new Date().toISOString()}`;
    return watermark;
  },

  // Processa o PDF para adicionar proteções
  async processPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Desabilita cópia e impressão
      pdfDoc.setFlags({
        allowCopy: false,
        allowPrinting: false,
        allowModifying: false
      });

      // Adiciona marca d'água em cada página
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText('DOCUMENTO PROTEGIDO', {
          x: width / 2 - 50,
          y: height / 2,
          size: 24,
          opacity: 0.1,
          rotate: Math.PI / 4
        });
      }

      return await pdfDoc.save();
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      throw error;
    }
  },

  // Captura tentativas de print screen
  async handlePrintScreen() {
    try {
      const canvas = await html2canvas(document.body);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      ctx.fillText('Captura de tela não permitida', canvas.width/2 - 100, canvas.height/2);
    } catch (error) {
      console.error('Erro ao manipular print screen:', error);
    }
  },

  // Inicializa as proteções
  initProtection() {
    // Desabilita menu de contexto
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Desabilita atalhos de teclado
    document.addEventListener('keydown', this.disableKeyboardShortcuts);
    
    // Monitora print screen
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        this.handlePrintScreen();
      }
    });

    // Desabilita seleção de texto
    document.addEventListener('selectstart', (e) => e.preventDefault());

    // Adiciona estilo para prevenir seleção de texto
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Permite seleção em campos de input */
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);
  }
};
