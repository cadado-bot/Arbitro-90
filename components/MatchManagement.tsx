import React, { useState } from 'react';
import { MatchState, Player, Team, GameEventType, PlayerPosition } from '../types';
import { PlusIcon, TrashIcon, SaveIcon } from './icons';

interface MatchManagementProps {
  matchState: MatchState;
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>;
  currentTime: string;
  onSaveGame: () => void;
}

const TeamPanel: React.FC<{
  team: Team;
  teamId: 'A' | 'B';
  onUpdateTeam: (teamId: 'A' | 'B', updatedTeam: Partial<Team>) => void;
  onAddEvent: (type: GameEventType, teamId: 'A' | 'B', player: Player, subPlayer?: Player) => void;
  onOpenSubModal: (teamId: 'A' | 'B', playerOut: Player) => void;
  onRemoveGoal: (teamId: 'A' | 'B', player: Player) => void;
  onRemoveCard: (teamId: 'A' | 'B', player: Player, cardType: 'yellow' | 'red') => void;
  otherTeam: Team;
  substitutedPlayerIds: number[];
}> = ({ team, teamId, onUpdateTeam, onAddEvent, onOpenSubModal, onRemoveGoal, onRemoveCard, substitutedPlayerIds }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>(PlayerPosition.Goalkeeper);
  const [newPlayerYellowCards, setNewPlayerYellowCards] = useState('0');
  const [newPlayerHasRedCard, setNewPlayerHasRedCard] = useState(false);
  
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName && newPlayerNumber) {
      const newPlayer: Player = {
        id: Date.now(),
        name: newPlayerName,
        number: parseInt(newPlayerNumber, 10),
        position: newPlayerPosition,
        goals: 0,
        yellowCards: parseInt(newPlayerYellowCards, 10) || 0,
        redCard: newPlayerHasRedCard,
        isStarter: team.players.length < 11,
      };
      onUpdateTeam(teamId, { players: [...team.players, newPlayer] });
      setNewPlayerName('');
      setNewPlayerNumber('');
      setNewPlayerPosition(PlayerPosition.Goalkeeper);
      setNewPlayerYellowCards('0');
      setNewPlayerHasRedCard(false);
    }
  };
  
  const handleRemovePlayer = (playerId: number) => {
    onUpdateTeam(teamId, { players: team.players.filter(p => p.id !== playerId) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateTeam(teamId, { flag: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const positionOrder: Record<PlayerPosition, number> = {
    [PlayerPosition.Goalkeeper]: 1,
    [PlayerPosition.Defender]: 2,
    [PlayerPosition.Midfielder]: 3,
    [PlayerPosition.Forward]: 4,
  };

  const sortPlayers = (a: Player, b: Player): number => {
    const posComparison = positionOrder[a.position] - positionOrder[b.position];
    if (posComparison !== 0) {
      return posComparison;
    }
    return a.number - b.number;
  };

  const sortedStarters = team.players.filter(p => p.isStarter).sort(sortPlayers);
  const sortedReserves = team.players.filter(p => !p.isStarter).sort(sortPlayers);


  return (
    <div className="bg-dark-card p-4 rounded-lg flex-1">
      <div className="flex items-center mb-4 gap-4">
        <label className="cursor-pointer">
          <img src={team.flag || 'https://picsum.photos/40'} alt={`${team.name} flag`} className="w-10 h-10 rounded-full object-cover bg-dark-surface" />
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
        <input
          type="text"
          value={team.name}
          onChange={(e) => onUpdateTeam(teamId, { name: e.target.value })}
          className="bg-transparent text-xl font-bold text-dark-text w-full focus:outline-none"
          placeholder="Nome do Time"
        />
      </div>

      <form onSubmit={handleAddPlayer} className="space-y-3 mb-4 p-3 bg-dark-surface rounded-md">
        <h4 className="text-sm font-semibold text-dark-text">Adicionar Novo Jogador</h4>
        <input 
          type="text" 
          value={newPlayerName} 
          onChange={(e) => setNewPlayerName(e.target.value)} 
          placeholder="Nome do Jogador" 
          className="input-field w-full" 
          required
        />
         <select
          value={newPlayerPosition}
          onChange={(e) => setNewPlayerPosition(e.target.value as PlayerPosition)}
          className="input-field w-full"
        >
          <option value={PlayerPosition.Goalkeeper}>Goleiro (G)</option>
          <option value={PlayerPosition.Defender}>Defensor (D)</option>
          <option value={PlayerPosition.Midfielder}>Meio-campista (M)</option>
          <option value={PlayerPosition.Forward}>Atacante (A)</option>
        </select>
        <div className="flex gap-2">
          <input 
            type="number" 
            value={newPlayerNumber} 
            onChange={(e) => setNewPlayerNumber(e.target.value)} 
            placeholder="Nº" 
            className="input-field w-1/2" 
            required
          />
          <input 
            type="number" 
            value={newPlayerYellowCards} 
            onChange={(e) => setNewPlayerYellowCards(e.target.value)} 
            placeholder="Amarelos" 
            className="input-field w-1/2" 
            min="0"
            max="2"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
          <input 
            type="checkbox" 
            id={`redCardCheck-${teamId}`}
            checked={newPlayerHasRedCard} 
            onChange={(e) => setNewPlayerHasRedCard(e.target.checked)}
            className="w-4 h-4 bg-dark-bg border-gray-600 rounded text-brand-red focus:ring-brand-red"
          />
          <label htmlFor={`redCardCheck-${teamId}`}>Recebeu cartão vermelho direto?</label>
        </div>
        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 btn-icon bg-brand-blue hover:bg-blue-700"
        >
          <PlusIcon /> Adicionar Jogador
        </button>
      </form>
      
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {sortedStarters.map(player => (
          <PlayerRow key={player.id} player={player} onRemove={handleRemovePlayer} onEvent={(type) => onAddEvent(type, teamId, player)} onSubstitute={() => onOpenSubModal(teamId, player)} onRemoveCard={(cardType) => onRemoveCard(teamId, player, cardType)} onRemoveGoal={() => onRemoveGoal(teamId, player)} isHighlighted={substitutedPlayerIds.includes(player.id)} />
        ))}
        <h3 className="text-dark-text-secondary pt-4 border-t border-dark-surface mt-4">Reservas</h3>
        {sortedReserves.map(player => (
           <PlayerRow key={player.id} player={player} onRemove={handleRemovePlayer} onEvent={(type) => onAddEvent(type, teamId, player)} onSubstitute={() => {}} onRemoveCard={(cardType) => onRemoveCard(teamId, player, cardType)} onRemoveGoal={() => onRemoveGoal(teamId, player)} isSubstitute isHighlighted={substitutedPlayerIds.includes(player.id)} />
        ))}
      </div>
    </div>
  );
};

interface ActionButtonsProps {
    onEvent: (type: GameEventType) => void;
    isDisabled: boolean;
}

const StarterActionButtons: React.FC<ActionButtonsProps & { onSubstitute: () => void; }> = ({ onEvent, onSubstitute, isDisabled }) => (
    <>
        <button onClick={() => onEvent(GameEventType.Goal)} disabled={isDisabled} className="btn-action bg-brand-green hover:bg-green-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed">GOL</button>
        <button onClick={() => onEvent(GameEventType.YellowCard)} disabled={isDisabled} className="btn-action bg-brand-yellow hover:bg-yellow-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed">A</button>
        <button onClick={() => onEvent(GameEventType.RedCard)} disabled={isDisabled} className="btn-action bg-brand-red hover:bg-red-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed">V</button>
        <button onClick={onSubstitute} disabled={isDisabled} className="btn-action bg-gray-500 hover:bg-gray-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed">SUB</button>
    </>
);

const ReserveActionButtons: React.FC<ActionButtonsProps> = ({ onEvent, isDisabled }) => (
    <>
        <button onClick={() => onEvent(GameEventType.YellowCard)} disabled={isDisabled} className="btn-action bg-brand-yellow hover:bg-yellow-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed">A</button>
        <button onClick={() => onEvent(GameEventType.RedCard)} disabled={isDisabled} className="btn-action bg-brand-red hover:bg-red-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed">V</button>
    </>
);


const PlayerRow: React.FC<{ player: Player; onRemove: (id: number) => void; onEvent: (type: GameEventType) => void; onSubstitute: () => void; onRemoveCard: (cardType: 'yellow' | 'red') => void; onRemoveGoal: () => void; isSubstitute?: boolean; isHighlighted?: boolean; }> = ({ player, onRemove, onEvent, onSubstitute, onRemoveCard, onRemoveGoal, isSubstitute = false, isHighlighted = false }) => {
  const isDisabled = player.redCard;
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-500 ${isSubstitute ? 'bg-dark-surface/50' : 'bg-dark-surface'} ${isHighlighted ? 'bg-yellow-500/20' : ''}`}>
      <span className="font-bold text-dark-text w-8 text-center">{player.number}</span>
      <span className={`pos-badge pos-${player.position}`}>{player.position}</span>
      <span className="flex-grow text-dark-text-secondary">{player.name}</span>
      <div className="flex items-center gap-1">
        {Array(player.goals || 0).fill(0).map((_, i) => (
            <div key={`goal-${i}`} onClick={onRemoveGoal} className="w-3 h-3 bg-white rounded-full cursor-pointer hover:opacity-75" title="Remover Gol" />
        ))}
        {Array(player.yellowCards).fill(0).map((_, i) => <div key={`yellow-${i}`} onClick={() => onRemoveCard('yellow')} className="w-2 h-3 bg-brand-yellow cursor-pointer hover:opacity-75" title="Remover Cartão Amarelo" />)}
        {player.redCard && <div onClick={() => onRemoveCard('red')} className="w-2 h-3 bg-brand-red cursor-pointer hover:opacity-75" title="Remover Cartão Vermelho" />}
      </div>
      <div className="flex items-center gap-1">
        {!isSubstitute ? (
           <StarterActionButtons onEvent={onEvent} onSubstitute={onSubstitute} isDisabled={isDisabled} />
        ) : (
           <ReserveActionButtons onEvent={onEvent} isDisabled={isDisabled} />
        )}
        <button onClick={() => onRemove(player.id)} className="btn-icon bg-brand-red hover:bg-red-700"><TrashIcon className="h-4 w-4" /></button>
      </div>
    </div>
  );
};


const performSubstitution = (players: Player[], playerOutId: number, playerInId: number): Player[] => {
    return players.map(p => {
      if (p.id === playerOutId) return { ...p, isStarter: false };
      if (p.id === playerInId) return { ...p, isStarter: true };
      return p;
    });
};

const MatchManagement: React.FC<MatchManagementProps> = ({ matchState, setMatchState, currentTime, onSaveGame }) => {
  const [subModal, setSubModal] = useState<{ teamId: 'A'|'B', playerOut: Player } | null>(null);
  const [selectedPlayerIn, setSelectedPlayerIn] = useState<string>('');
  const [substitutedPlayerIds, setSubstitutedPlayerIds] = useState<number[]>([]);
  
  const updateTeam = (teamId: 'A' | 'B', updatedTeamData: Partial<Team>) => {
    const key = teamId === 'A' ? 'teamA' : 'teamB';
    setMatchState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updatedTeamData }
    }));
  };

  const addEvent = (type: GameEventType, teamId: 'A' | 'B', player: Player, subPlayer?: Player) => {
    const team = teamId === 'A' ? matchState.teamA : matchState.teamB;
    const newEvent = {
      id: Date.now(),
      type,
      teamName: team.name,
      playerName: player.name,
      relatedPlayerName: subPlayer?.name,
      time: currentTime,
    };
    
    let updatedPlayers = [...team.players];
    let teamScore = team.score;

    if (type === GameEventType.Goal) {
      teamScore += 1;
      updatedPlayers = updatedPlayers.map(p => 
        p.id === player.id ? { ...p, goals: (p.goals || 0) + 1 } : p
      );
    } else if (type === GameEventType.YellowCard) {
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === player.id) {
          const newYellows = p.yellowCards + 1;
          const hasRed = newYellows >= 2 || p.redCard;
          if(newYellows === 2 && !p.redCard) {
            // Automatically add a red card event if it's the second yellow
            addEvent(GameEventType.RedCard, teamId, {...p, yellowCards: 2});
          }
          return { ...p, yellowCards: newYellows, redCard: hasRed };
        }
        return p;
      });
    } else if (type === GameEventType.RedCard) {
      updatedPlayers = updatedPlayers.map(p => 
        p.id === player.id ? { ...p, redCard: true } : p
      );
    }

    setMatchState(prev => {
        const key = teamId === 'A' ? 'teamA' : 'teamB';
        return {
            ...prev,
            events: [newEvent, ...prev.events],
            [key]: { ...prev[key], players: updatedPlayers, score: teamScore }
        }
    });
  };

  const handleRemoveGoal = (teamId: 'A' | 'B', player: Player) => {
    if ((player.goals || 0) > 0) {
        const teamKey = teamId === 'A' ? 'teamA' : 'teamB';
        const team = matchState[teamKey];
        
        const eventIndexToRemove = matchState.events.findIndex(e => 
            e.type === GameEventType.Goal && e.teamName === team.name && e.playerName === player.name
        );
        
        const updatedEvents = [...matchState.events];
        if (eventIndexToRemove !== -1) {
            updatedEvents.splice(eventIndexToRemove, 1);
        }

        const updatedPlayers = team.players.map(p => 
            p.id === player.id ? { ...p, goals: p.goals - 1 } : p
        );

        setMatchState(prev => {
            const currentTeam = prev[teamKey];
            return {
                ...prev,
                events: updatedEvents,
                [teamKey]: { 
                    ...currentTeam, 
                    players: updatedPlayers, 
                    score: Math.max(0, currentTeam.score - 1)
                }
            };
        });
    }
  };

  const handleRemoveCard = (teamId: 'A' | 'B', player: Player, cardType: 'yellow' | 'red') => {
    const teamKey = teamId === 'A' ? 'teamA' : 'teamB';
    const team = matchState[teamKey];
    let playerUpdates: Partial<Player> = {};
    const eventsToRemove: GameEventType[] = [];

    if (cardType === 'yellow' && player.yellowCards > 0) {
        const wasSecondYellow = player.yellowCards === 2 && player.redCard;
        playerUpdates = {
            yellowCards: player.yellowCards - 1,
            redCard: wasSecondYellow ? false : player.redCard,
        };
        eventsToRemove.push(GameEventType.YellowCard);
        if (wasSecondYellow) {
            eventsToRemove.push(GameEventType.RedCard);
        }
    } else if (cardType === 'red' && player.redCard) {
        playerUpdates = { redCard: false, yellowCards: 0 };
        eventsToRemove.push(GameEventType.RedCard);
    }

    if (eventsToRemove.length > 0) {
        let currentEvents = [...matchState.events];

        eventsToRemove.forEach(eventType => {
            const eventIndex = currentEvents.findIndex(e => 
                e.type === eventType && e.teamName === team.name && e.playerName === player.name
            );
            if (eventIndex !== -1) {
                currentEvents.splice(eventIndex, 1);
            }
        });
        
        const updatedPlayers = team.players.map(p => 
            p.id === player.id ? { ...p, ...playerUpdates } : p
        );

        setMatchState(prev => ({
            ...prev,
            events: currentEvents,
            [teamKey]: { ...prev[teamKey], players: updatedPlayers }
        }));
    }
  };

  const handleOpenSubModal = (teamId: 'A' | 'B', playerOut: Player) => {
    setSelectedPlayerIn('');
    setSubModal({ teamId, playerOut });
  };

  const handleConfirmSubstitution = () => {
    if (!subModal || !selectedPlayerIn) {
        setSubModal(null);
        return;
    }

    const { teamId, playerOut } = subModal;
    const teamKey = teamId === 'A' ? 'teamA' : 'teamB';
    const team = matchState[teamKey];
    const playerIn = team.players.find(p => p.id === parseInt(selectedPlayerIn, 10));

    if (playerIn) {
      setMatchState(prev => {
        const currentTeam = prev[teamKey];
        const updatedPlayers = performSubstitution(currentTeam.players, playerOut.id, playerIn.id);
        
        const newEvent = {
            id: Date.now(),
            type: GameEventType.Substitution,
            teamName: team.name,
            playerName: playerIn.name,
            relatedPlayerName: playerOut.name,
            time: currentTime,
        };

        return {
            ...prev,
            events: [newEvent, ...prev.events],
            [teamKey]: {
                ...currentTeam,
                players: updatedPlayers,
            },
        };
      });

      setSubstitutedPlayerIds(prevIds => [...new Set([...prevIds, playerOut.id, playerIn.id])]);
    }
    
    setSubModal(null);
  };
  
  const reserves = subModal ? (subModal.teamId === 'A' ? matchState.teamA : matchState.teamB).players.filter(p => !p.isStarter && !p.redCard) : [];

  return (
    <div className="p-4 md:p-6 text-dark-text h-full overflow-y-auto">
      <style>{`
        .input-field {
          background-color: #1e1e1e;
          border: 1px solid #3a3a3a;
          color: #e0e0e0;
          padding: 8px 12px;
          border-radius: 6px;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        .input-field:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.5);
        }
        .btn-icon {
          padding: 8px;
          color: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .btn-action {
          padding: 4px 8px;
          color: white;
          border-radius: 4px;
          font-weight: 600;
          transition: background-color 0.2s, opacity 0.2s;
        }
         .btn-primary {
          padding: 8px 12px;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.2s, opacity 0.2s;
          font-size: 0.875rem;
        }
        .pos-badge {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            color: #121212;
            width: 24px;
            text-align: center;
        }
        .pos-G { background-color: #fcc419; }
        .pos-D { background-color: #1a73e8; }
        .pos-M { background-color: #1e8e3e; }
        .pos-A { background-color: #d93025; }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center justify-center text-4xl font-bold text-dark-text-secondary">
          {matchState.teamA.score} x {matchState.teamB.score}
        </div>
         <button onClick={onSaveGame} className="btn-primary bg-brand-blue hover:bg-blue-700 flex items-center gap-2">
            <SaveIcon className="h-4 w-4" />
            Salvar Jogo
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <TeamPanel team={matchState.teamA} teamId="A" onUpdateTeam={updateTeam} onAddEvent={addEvent} onOpenSubModal={handleOpenSubModal} onRemoveGoal={handleRemoveGoal} onRemoveCard={handleRemoveCard} otherTeam={matchState.teamB} substitutedPlayerIds={substitutedPlayerIds} />
        <TeamPanel team={matchState.teamB} teamId="B" onUpdateTeam={updateTeam} onAddEvent={addEvent} onOpenSubModal={handleOpenSubModal} onRemoveGoal={handleRemoveGoal} onRemoveCard={handleRemoveCard} otherTeam={matchState.teamA} substitutedPlayerIds={substitutedPlayerIds} />
      </div>

      {subModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSubModal(null)}>
          <div className="bg-dark-card p-6 rounded-lg w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Realizar Substituição</h3>
            <p className="mb-1 text-sm text-dark-text-secondary">Sai:</p>
            <p className="mb-4 font-semibold text-dark-text">{`#${subModal.playerOut.number} ${subModal.playerOut.name}`}</p>
            
            <label htmlFor="playerIn" className="block mb-1 text-sm text-dark-text-secondary">Entra:</label>
            <select 
              id="playerIn"
              value={selectedPlayerIn}
              onChange={(e) => setSelectedPlayerIn(e.target.value)}
              className="input-field w-full mb-6"
            >
              <option value="" disabled>Selecione um jogador reserva</option>
              {reserves.map(p => (
                <option key={p.id} value={p.id}>
                  {`#${p.number} ${p.name}`}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setSubModal(null)}
                className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSubstitution}
                disabled={!selectedPlayerIn}
                className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;