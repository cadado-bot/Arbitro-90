
import React, { useState, useEffect, useCallback } from 'react';
import Stopwatch from './components/Stopwatch';
import MatchManagement from './components/MatchManagement';
import Dashboard from './components/Dashboard';
import TournamentComponent from './components/Tournament';
import { MatchState, Tournament, Matchup } from './types';
import { ClockIcon, WhistleIcon, ChartBarIcon, WhistleBallIcon, TrashIcon, TrophyIcon, AlertTriangleIcon } from './components/icons';

type Tab = 'stopwatch' | 'management' | 'dashboard' | 'tournament';

type SavedGame = {
    name: string;
    saveData: {
        matchState: MatchState;
        time: number;
        totalTime: number;
    }
}

const SAVED_GAMES_KEY = 'arbitro90_savedGamesList';
const TOURNAMENT_KEY = 'arbitro90_tournament';

const initialMatchState: MatchState = {
  teamA: { name: "Time A", flag: null, players: [], score: 0 },
  teamB: { name: "Time B", flag: null, players: [], score: 0 },
  events: [],
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('management');
  const [time, setTime] = useState(0);
  const [totalTime, setTotalTime] = useState(90 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [matchState, setMatchState] = useState<MatchState>(initialMatchState);
  
  const [savedGamesList, setSavedGamesList] = useState<{ name: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveGameName, setSaveGameName] = useState('');
  
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    try {
      const savedGamesJSON = localStorage.getItem(SAVED_GAMES_KEY);
      if (savedGamesJSON) {
        const savedData: SavedGame[] = JSON.parse(savedGamesJSON);
        setSavedGamesList(savedData.map(g => ({ name: g.name })));
      }
      const savedTournamentJSON = localStorage.getItem(TOURNAMENT_KEY);
      if (savedTournamentJSON) {
        setTournament(JSON.parse(savedTournamentJSON));
      }
    } catch (error) {
      console.error("Failed to load saved data", error);
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
    }
    return () => { if (interval) window.clearInterval(interval); };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => { setIsRunning(false); setTime(0); };
  const handleSetTotalTime = (minutes: number) => { if (time === 0) setTotalTime(minutes * 60); };
  const handleAddTime = (minutes: number) => setTotalTime(prev => prev + (minutes * 60));

  const saveTournament = (updatedTournament: Tournament | null) => {
      setTournament(updatedTournament);
      if (updatedTournament) {
        localStorage.setItem(TOURNAMENT_KEY, JSON.stringify(updatedTournament));
      } else {
        localStorage.removeItem(TOURNAMENT_KEY);
      }
  }

  const updateTournamentBracket = useCallback((savedMatchState: MatchState, gameKey: string) => {
    if (!tournament) return;

    let updated = false;
    const newTournament = JSON.parse(JSON.stringify(tournament)) as Tournament;
    const allMatchups = Object.values(newTournament.rounds).flat().concat(newTournament.thirdPlace || []);

    const matchup = allMatchups.find(m => m && m.gameSaveKey === gameKey);

    if(matchup) {
        const scoreA = savedMatchState.teamA.score;
        const scoreB = savedMatchState.teamB.score;
        matchup.teamA.score = scoreA;
        matchup.teamB.score = scoreB;
        updated = true;

        const isSemiFinal = newTournament.rounds['SEMIFINAIS']?.some(m => m.id === matchup.id);

        if (scoreA !== scoreB) {
            const winnerName = scoreA > scoreB ? matchup.teamA.name : matchup.teamB.name;
            const loserName = scoreA < scoreB ? matchup.teamA.name : matchup.teamB.name;

            // Advance winner
            if(matchup.nextMatchupId) {
                const nextMatchup = allMatchups.find(m => m && m.id === matchup.nextMatchupId);
                if (nextMatchup) {
                    if (matchup.winnerSlot === 'A') nextMatchup.teamA.name = winnerName;
                    else if (matchup.winnerSlot === 'B') nextMatchup.teamB.name = winnerName;
                }
            }

            // Advance loser to third place match
            if(isSemiFinal && matchup.loserNextMatchupId) {
                const thirdPlaceMatch = allMatchups.find(m => m && m.id === matchup.loserNextMatchupId);
                 if (thirdPlaceMatch) {
                    if (matchup.loserSlot === 'A') thirdPlaceMatch.teamA.name = loserName;
                    else if (matchup.loserSlot === 'B') thirdPlaceMatch.teamB.name = loserName;
                }
            }
        }
    }

    if (updated) {
        saveTournament(newTournament);
    }
  }, [tournament]);

  const handleOpenSaveModal = () => {
    setSaveGameName(selectedGame || '');
    setIsSaveModalOpen(true);
  };
  
  const handleConfirmSave = useCallback(() => {
    const trimmedName = saveGameName.trim();
    if (!trimmedName) return;
    try {
        const savedGamesJSON = localStorage.getItem(SAVED_GAMES_KEY);
        const savedGames: SavedGame[] = savedGamesJSON ? JSON.parse(savedGamesJSON) : [];
        const newSaveData = { matchState, time, totalTime };
        const existingGameIndex = savedGames.findIndex(g => g.name === trimmedName);
        if (existingGameIndex > -1) {
            savedGames[existingGameIndex].saveData = newSaveData;
        } else {
            savedGames.push({ name: trimmedName, saveData: newSaveData });
        }
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
        setSavedGamesList(savedGames.map(g => ({ name: g.name })));
        setSelectedGame(trimmedName);
        setIsSaveModalOpen(false);

        if (tournament && trimmedName.startsWith('Torneio:')) {
            updateTournamentBracket(matchState, trimmedName);
        }
    } catch (error) { console.error("Failed to save game", error); }
  }, [saveGameName, matchState, time, totalTime, tournament, updateTournamentBracket]);

  const handleLoadGame = useCallback((gameName: string) => {
      if (!gameName) return;
      try {
          const savedDataJSON = localStorage.getItem(SAVED_GAMES_KEY);
          if (savedDataJSON) {
              const savedGames: SavedGame[] = JSON.parse(savedDataJSON);
              const gameToLoad = savedGames.find(g => g.name === gameName);
              if (gameToLoad) {
                  setMatchState(gameToLoad.saveData.matchState);
                  setTime(gameToLoad.saveData.time);
                  setTotalTime(gameToLoad.saveData.totalTime);
                  setSelectedGame(gameName);
                  setIsRunning(false);
              }
          }
      } catch (error) { console.error("Failed to load game", error); }
  }, []);

  const handleOpenDeleteModal = () => { if (selectedGame) setIsDeleteModalOpen(true); };
  
  const handleConfirmDelete = useCallback(() => {
    if (!selectedGame) return;
    try {
        const savedDataJSON = localStorage.getItem(SAVED_GAMES_KEY);
        let savedGames: SavedGame[] = savedDataJSON ? JSON.parse(savedDataJSON) : [];
        savedGames = savedGames.filter(g => g.name !== selectedGame);
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
        setSavedGamesList(savedGames.map(g => ({ name: g.name })));
        setIsDeleteModalOpen(false);
        if (selectedGame.startsWith('Torneio:')) {
            saveTournament(null); // Clear the whole tournament if one of its matches is deleted
        }
        handleClearReport();
    } catch (error) { console.error("Failed to delete game", error); }
  }, [selectedGame]);

  const handleClearReport = () => {
    setMatchState(initialMatchState);
    handleReset();
    setSelectedGame('');
  };

  const handleCreateTournament = (teamNames: string[], phase: { key: string, name: string, teams: number }) => {
      let currentId = 1;
      const rounds: Tournament['rounds'] = {};
      
      const createRound = (numTeams: number, roundName: string): Matchup[] => {
          const matchups: Matchup[] = [];
          for (let i = 0; i < numTeams; i += 2) {
              matchups.push({
                  id: currentId++,
                  teamA: { name: teamNames[i] || `Vencedor`, score: null },
                  teamB: { name: teamNames[i + 1] || `Vencedor`, score: null },
                  nextMatchupId: null,
                  loserNextMatchupId: null,
                  gameSaveKey: null,
              });
          }
          rounds[roundName] = matchups;
          return matchups;
      };

      const linkRounds = (currentRound: Matchup[], nextRound: Matchup[]) => {
          for(let i=0; i < currentRound.length; i++) {
              const matchup = currentRound[i];
              const nextMatchup = nextRound[Math.floor(i / 2)];
              matchup.nextMatchupId = nextMatchup.id;
              matchup.winnerSlot = (i % 2 === 0) ? 'A' : 'B';
          }
      }

      let r16: Matchup[] = [], qf: Matchup[] = [], sf: Matchup[] = [], f: Matchup[] = [];
      let thirdPlace: Matchup | null = null;
      
      if (phase.key === 'R16') r16 = createRound(16, 'OITAVAS DE FINAL');
      if (phase.key === 'QF' || r16.length > 0) qf = createRound(phase.key === 'QF' ? 8 : 0, 'QUARTAS DE FINAL');
      if (phase.key === 'SF' || qf.length > 0) sf = createRound(phase.key === 'SF' ? 4 : 0, 'SEMIFINAIS');
      if (phase.key === 'F' || sf.length > 0) f = createRound(phase.key === 'F' ? 2 : 0, 'FINAL');
      
      if (r16.length > 0) linkRounds(r16, qf);
      if (qf.length > 0) linkRounds(qf, sf);
      if (sf.length > 0) {
          linkRounds(sf, f);
          thirdPlace = { id: currentId++, teamA: { name: 'Perdedor SF1', score: null }, teamB: { name: 'Perdedor SF2', score: null }, nextMatchupId: null, gameSaveKey: null };
          sf[0].loserNextMatchupId = thirdPlace.id;
          sf[0].loserSlot = 'A';
          sf[1].loserNextMatchupId = thirdPlace.id;
          sf[1].loserSlot = 'B';
      }

      Object.values(rounds).flat().forEach(matchup => {
        if (!matchup.teamA.name.includes('Vencedor')) {
            matchup.gameSaveKey = `Torneio: ${matchup.teamA.name} vs ${matchup.teamB.name}`;
        }
      });
      if(thirdPlace && !thirdPlace.teamA.name.includes('Perdedor')) {
          thirdPlace.gameSaveKey = `Torneio (3ºL): ${thirdPlace.teamA.name} vs ${thirdPlace.teamB.name}`;
      }

      saveTournament({ rounds, thirdPlace });
  };
  
  const handleManageTournamentMatch = useCallback((matchup: Matchup) => {
    if (!matchup.teamA.name.includes('Vencedor') && !matchup.teamA.name.includes('Perdedor')) {
      let gameKey = matchup.gameSaveKey;

      if (!gameKey) {
          const prefix = matchup.loserNextMatchupId === null ? 'Torneio:' : 'Torneio (3ºL):';
          gameKey = `${prefix} ${matchup.teamA.name} vs ${matchup.teamB.name}`;
          
          const updatedTournament = JSON.parse(JSON.stringify(tournament)) as Tournament;
          const allMatchups = Object.values(updatedTournament.rounds).flat().concat(updatedTournament.thirdPlace || []);
          const m = allMatchups.find(m => m && m.id === matchup.id);

          if (m) m.gameSaveKey = gameKey;
          saveTournament(updatedTournament);
      }
      
      const savedGamesJSON = localStorage.getItem(SAVED_GAMES_KEY);
      const savedGames: SavedGame[] = savedGamesJSON ? JSON.parse(savedGamesJSON) : [];
      let gameExists = savedGames.some(g => g.name === gameKey);

      if (!gameExists) {
          const newMatchState: MatchState = {
              teamA: { name: matchup.teamA.name, flag: null, players: [], score: 0 },
              teamB: { name: matchup.teamB.name, flag: null, players: [], score: 0 },
              events: [],
          };
          const newSaveData = { matchState: newMatchState, time: 0, totalTime: 90 * 60 };
          savedGames.push({ name: gameKey, saveData: newSaveData });
          localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
          setSavedGamesList(savedGames.map(g => ({ name: g.name })));
      }
      
      handleLoadGame(gameKey);
      setActiveTab('management');
    }
  }, [tournament, handleLoadGame]);

  const formatTime = useCallback((s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`, []);

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm md:text-base font-semibold border-b-4 transition-colors duration-300 ${activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-dark-text-secondary hover:text-white'}`}>
      {icon} {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'stopwatch': return <Stopwatch time={time} totalTime={totalTime} isRunning={isRunning} onStart={handleStart} onStop={handleStop} onReset={handleReset} onSetTotalTime={handleSetTotalTime} onAddTime={handleAddTime} />;
      case 'management': return <MatchManagement matchState={matchState} setMatchState={setMatchState} currentTime={formatTime(time)} onSaveGame={handleOpenSaveModal} />;
      case 'dashboard': return <Dashboard matchState={matchState} onClearReport={handleClearReport} />;
      case 'tournament': return <TournamentComponent tournament={tournament} onCreateTournament={handleCreateTournament} onManageMatch={handleManageTournamentMatch} />;
      default: return null;
    }
  };

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen flex flex-col font-sans">
       <style>{`.input-field-header { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; } .input-field-header:focus { outline: none; border-color: #1a73e8; }`}</style>
      <header className="bg-dark-surface shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-3 text-dark-text">
                <WhistleBallIcon className="h-8 w-8 text-brand-green" />
                <h1 className="text-2xl font-bold tracking-wider">ÁRBITRO <span className="text-brand-green font-semibold">90º</span></h1>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="saved-games" className="text-sm font-medium text-dark-text-secondary">Jogos Salvos:</label>
                <select id="saved-games" value={selectedGame} onChange={(e) => handleLoadGame(e.target.value)} className="input-field-header">
                    <option value="" disabled>Carregar um jogo</option>
                    {savedGamesList.map(g => (<option key={g.name} value={g.name}>{g.name}</option>))}
                </select>
                <button onClick={handleOpenDeleteModal} disabled={!selectedGame} className="p-2 bg-dark-surface rounded-md hover:bg-gray-700 disabled:opacity-50 border border-gray-600 hover:border-brand-red" title="Apagar jogo selecionado">
                    <TrashIcon className="h-4 w-4 text-dark-text-secondary" />
                </button>
            </div>
        </div>
        <div className="container mx-auto px-4">
          <nav className="flex">
            <TabButton tab="stopwatch" label="Cronômetro" icon={<ClockIcon />} />
            <TabButton tab="management" label="Gerenciar Partida" icon={<WhistleIcon />} />
            <TabButton tab="dashboard" label="Relatório" icon={<ChartBarIcon />} />
            <TabButton tab="tournament" label="Torneio" icon={<TrophyIcon />} />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6"><div className="bg-dark-surface rounded-lg shadow-xl h-full">{renderContent()}</div></main>
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsSaveModalOpen(false)}>
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Salvar Jogo</h3>
                <label htmlFor="saveGameName" className="block mb-1 text-sm text-dark-text-secondary">Nome da Partida</label>
                <input id="saveGameName" type="text" value={saveGameName} onChange={(e) => setSaveGameName(e.target.value)} placeholder="Ex: Final do Campeonato" className="input-field-header w-full mb-6" autoFocus />
                <div className="flex justify-end gap-3"><button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text">Cancelar</button><button onClick={handleConfirmSave} disabled={!saveGameName.trim()} className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white disabled:opacity-50">Salvar</button></div>
            </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4"><AlertTriangleIcon className="h-6 w-6 text-brand-red" /></div>
                <h3 className="text-lg font-bold mb-2">Apagar Jogo Salvo?</h3>
                <p className="text-sm text-dark-text-secondary mb-6">Tem certeza que deseja apagar <span className="font-bold text-dark-text">"{selectedGame}"</span>? Esta ação é irreversível.</p>
                <div className="flex justify-center gap-4"><button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text w-full">Cancelar</button><button onClick={handleConfirmDelete} className="px-6 py-2 rounded-md bg-brand-red hover:bg-red-700 text-white w-full">Confirmar Exclusão</button></div>
            </div>
        </div>
      )}
    </div>
  );
};
export default App;