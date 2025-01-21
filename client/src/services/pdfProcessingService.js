import { PDFDocument, StandardFonts } from 'pdf-lib';

export const pdfProcessingService = {
  // Extrai texto do PDF
  async extractTextFromPDF(arrayBuffer) {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let fullText = '';

    for (const page of pages) {
      const text = await page.getText();
      fullText += text + '\n';
    }

    return fullText;
  },

  // Identifica seções baseado em padrões de texto
  identifySections(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;

    const isHeading = (line) => {
      // Identifica linhas que parecem títulos
      return (
        line.length < 100 && // Títulos geralmente são curtos
        /^[A-Z0-9]/.test(line) && // Começa com letra maiúscula ou número
        !line.endsWith('.') && // Não termina com ponto
        line.trim().length > 0 // Não está vazio
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (isHeading(line)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line,
          content: '',
          startLine: i,
          endLine: i
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
        currentSection.endLine = i;
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  },

  // Cria módulos a partir das seções identificadas
  async createModules(sections) {
    const modules = [];
    let orderIndex = 0;

    for (const section of sections) {
      // Pula seções muito pequenas ou que parecem ser cabeçalhos/rodapés
      if (section.content.length < 50) continue;

      const module = {
        title: section.title,
        description: section.content.substring(0, 200) + '...',
        content: section.content,
        order_index: orderIndex++,
        points_reward: 100,
        difficulty_level: this.calculateDifficulty(section.content),
        estimated_time: this.estimateReadingTime(section.content)
      };

      modules.push(module);
    }

    return modules;
  },

  // Calcula nível de dificuldade baseado no conteúdo
  calculateDifficulty(content) {
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Palavras mais longas geralmente indicam conteúdo mais complexo
    if (avgWordLength > 8) return 3; // Difícil
    if (avgWordLength > 6) return 2; // Médio
    return 1; // Fácil
  },

  // Estima tempo de leitura (em minutos)
  estimateReadingTime(content) {
    const wordsPerMinute = 200; // Velocidade média de leitura
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },

  // Gera quizzes baseado no conteúdo
  generateQuizzes(content) {
    const sentences = content.split(/[.!?]+/);
    const quizzes = [];

    for (const sentence of sentences) {
      if (sentence.length < 20) continue; // Pula sentenças muito curtas

      // Identifica palavras-chave (mais longas que 5 caracteres)
      const words = sentence.split(/\s+/)
        .filter(word => word.length > 5)
        .map(word => word.toLowerCase());

      if (words.length < 3) continue; // Precisa de palavras suficientes

      // Cria uma pergunta substituindo uma palavra-chave
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const question = sentence.replace(new RegExp(randomWord, 'i'), '_____');

      // Gera opções (incluindo a resposta correta)
      const options = [
        randomWord,
        ...words.filter(w => w !== randomWord).slice(0, 3)
      ];

      // Embaralha as opções
      const shuffledOptions = options
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(4, options.length));

      quizzes.push({
        question,
        options: shuffledOptions,
        correct_answer: randomWord,
        points: 10
      });
    }

    return quizzes;
  }
};
