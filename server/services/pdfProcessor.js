const pdfParse = require('pdf-parse');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

class PDFProcessor {
  constructor() {
    this.tokenizer = tokenizer;
  }

  async processPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return this.analyzeContent(data);
    } catch (error) {
      throw new Error(`Erro ao processar PDF: ${error.message}`);
    }
  }

  analyzeContent(pdfData) {
    const sections = this.identifySections(pdfData.text);
    const keywords = this.extractKeywords(pdfData.text);
    const complexity = this.assessComplexity(pdfData.text);

    return {
      sections,
      keywords,
      complexity,
      pageCount: pdfData.numpages,
      metadata: {
        title: pdfData.info.Title || 'Sem título',
        author: pdfData.info.Author || 'Autor desconhecido',
        creationDate: pdfData.info.CreationDate
      }
    };
  }

  identifySections(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    const headingPattern = /^(#{1,3}|\d+\.|\b(Capítulo|Seção)\b)/i;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (headingPattern.test(trimmedLine) || 
          (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 10)) {
        
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: trimmedLine,
          content: [],
          startLine: index,
          level: this.determineHeadingLevel(trimmedLine)
        };
      } else if (currentSection && trimmedLine.length > 0) {
        currentSection.content.push(trimmedLine);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return this.organizeSectionsHierarchy(sections);
  }

  determineHeadingLevel(heading) {
    if (heading.startsWith('#')) {
      return heading.match(/^#+/)[0].length;
    } else if (heading === heading.toUpperCase()) {
      return 1;
    } else if (heading.match(/^\d+\./)) {
      return 2;
    }
    return 3;
  }

  organizeSectionsHierarchy(sections) {
    const hierarchy = [];
    const stack = [];

    sections.forEach(section => {
      while (stack.length > 0 && 
             stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        hierarchy.push(section);
      } else {
        const parent = stack[stack.length - 1];
        parent.subsections = parent.subsections || [];
        parent.subsections.push(section);
      }

      stack.push(section);
    });

    return hierarchy;
  }

  extractKeywords(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const stopWords = new Set(['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para']);
    const wordFreq = {};

    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  assessComplexity(text) {
    const sentences = text.split(/[.!?]+/);
    const words = this.tokenizer.tokenize(text);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordsRatio = longWords / words.length;

    let complexity = 'médio';
    if (avgWordsPerSentence > 20 && longWordsRatio > 0.3) {
      complexity = 'avançado';
    } else if (avgWordsPerSentence < 12 && longWordsRatio < 0.2) {
      complexity = 'básico';
    }

    return {
      level: complexity,
      metrics: {
        avgWordsPerSentence,
        longWordsRatio,
        totalSentences: sentences.length,
        totalWords: words.length
      }
    };
  }

  generateQuizQuestions(section) {
    const questions = [];
    const sentences = section.content.join(' ').split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (sentence.length > 50 && sentence.includes(',')) {
        const tokens = this.tokenizer.tokenize(sentence);
        const keywordIndex = Math.floor(Math.random() * tokens.length);
        const keyword = tokens[keywordIndex];
        
        if (keyword.length > 4) {
          questions.push({
            type: 'complete',
            question: sentence.replace(keyword, '_____'),
            correctAnswer: keyword,
            options: this.generateOptions(keyword, tokens)
          });
        }
      }
    });

    return questions.slice(0, 5);
  }

  generateOptions(correctAnswer, contextWords) {
    const options = [correctAnswer];
    const similarWords = contextWords.filter(word => 
      word.length > 4 && word !== correctAnswer
    );

    while (options.length < 4 && similarWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * similarWords.length);
      const word = similarWords.splice(randomIndex, 1)[0];
      options.push(word);
    }

    return this.shuffleArray(options);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

module.exports = new PDFProcessor();
