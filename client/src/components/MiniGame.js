import React, { useState, useEffect } from 'react';

const MiniGame = ({ moduleContent, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    // Gera perguntas baseadas no conteúdo do módulo
    const generateQuestions = () => {
      // Aqui você implementaria a lógica para gerar questões
      // Por enquanto, usaremos questões de exemplo
      return [
        {
          question: 'Qual é o principal conceito abordado neste módulo?',
          options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
          correctAnswer: 0
        },
        {
          question: 'Como este conceito se aplica na prática?',
          options: ['Exemplo 1', 'Exemplo 2', 'Exemplo 3', 'Exemplo 4'],
          correctAnswer: 1
        },
        // Mais questões seriam geradas baseadas no conteúdo real
      ];
    };

    setQuestions(generateQuestions());
  }, [moduleContent]);

  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 10);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameCompleted(true);
      onComplete(score);
    }
  };

  return (
    <div className="mini-game">
      {!gameCompleted ? (
        <div className="game-container">
          <div className="score-display">
            Pontuação: {score}
          </div>
          
          <div className="question-card">
            <h3>{questions[currentQuestion]?.question}</h3>
            <div className="options-container">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="progress-indicator">
            Questão {currentQuestion + 1} de {questions.length}
          </div>
        </div>
      ) : (
        <div className="game-completed">
          <h2>Parabéns!</h2>
          <p>Você completou o mini-game com {score} pontos!</p>
          <button onClick={() => onComplete(score)}>
            Continuar para o próximo módulo
          </button>
        </div>
      )}
    </div>
  );
};

export default MiniGame;
