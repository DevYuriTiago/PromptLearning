import React, { useState, useEffect } from 'react';

const RewardSystem = ({ studentProgress, onRewardClaimed }) => {
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);

  const rewards = [
    {
      id: 1,
      name: 'Iniciante Dedicado',
      description: 'Complete seu primeiro módulo',
      icon: '🌟',
      requirement: { type: 'modules_completed', value: 1 }
    },
    {
      id: 2,
      name: 'Mestre do Conhecimento',
      description: 'Complete 5 módulos com 100% de aproveitamento',
      icon: '👑',
      requirement: { type: 'perfect_modules', value: 5 }
    },
    {
      id: 3,
      name: 'Velocista do Aprendizado',
      description: 'Complete um módulo em menos de 30 minutos',
      icon: '⚡',
      requirement: { type: 'fast_completion', value: 30 }
    },
    {
      id: 4,
      name: 'Colecionador de Sabedoria',
      description: 'Acumule 1000 pontos de conhecimento',
      icon: '📚',
      requirement: { type: 'points', value: 1000 }
    }
  ];

  useEffect(() => {
    // Verifica quais recompensas estão disponíveis com base no progresso
    const checkAvailableRewards = () => {
      const available = rewards.filter(reward => {
        // Verifica se a recompensa já foi reivindicada
        if (claimedRewards.includes(reward.id)) return false;

        // Verifica os requisitos baseado no tipo
        switch (reward.requirement.type) {
          case 'modules_completed':
            return studentProgress.completedModules >= reward.requirement.value;
          case 'perfect_modules':
            return studentProgress.perfectModules >= reward.requirement.value;
          case 'fast_completion':
            return studentProgress.fastestCompletion <= reward.requirement.value;
          case 'points':
            return studentProgress.totalPoints >= reward.requirement.value;
          default:
            return false;
        }
      });

      setAvailableRewards(available);
    };

    checkAvailableRewards();
  }, [studentProgress, claimedRewards]);

  const claimReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setClaimedRewards([...claimedRewards, rewardId]);
      onRewardClaimed(reward);
    }
  };

  return (
    <div className="reward-system">
      <h2>Suas Conquistas</h2>
      
      <div className="rewards-container">
        <div className="available-rewards">
          <h3>Recompensas Disponíveis</h3>
          {availableRewards.map(reward => (
            <div key={reward.id} className="reward-card">
              <div className="reward-icon">{reward.icon}</div>
              <div className="reward-info">
                <h4>{reward.name}</h4>
                <p>{reward.description}</p>
              </div>
              <button
                className="claim-button"
                onClick={() => claimReward(reward.id)}
              >
                Reivindicar
              </button>
            </div>
          ))}
        </div>

        <div className="claimed-rewards">
          <h3>Conquistas Desbloqueadas</h3>
          {rewards
            .filter(reward => claimedRewards.includes(reward.id))
            .map(reward => (
              <div key={reward.id} className="reward-card claimed">
                <div className="reward-icon">{reward.icon}</div>
                <div className="reward-info">
                  <h4>{reward.name}</h4>
                  <p>{reward.description}</p>
                </div>
                <div className="claimed-badge">Conquistado!</div>
              </div>
            ))}
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat">
          <span>Módulos Completados:</span>
          <span>{studentProgress.completedModules}</span>
        </div>
        <div className="stat">
          <span>Pontos Totais:</span>
          <span>{studentProgress.totalPoints}</span>
        </div>
      </div>
    </div>
  );
};

export default RewardSystem;
