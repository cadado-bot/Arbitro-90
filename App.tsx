

import React, { useState, useEffect, useCallback } from 'react';
import Stopwatch from './components/Stopwatch';
import MatchManagement from './components/MatchManagement';
import Dashboard from './components/Dashboard';
import { MatchState, PlayerPosition, Player, Team } from './types';
import { ClockIcon, WhistleIcon, ChartBarIcon, WhistleBallIcon, SaveIcon, TrashIcon, AlertTriangleIcon } from './components/icons';

type Tab = 'stopwatch' | 'management' | 'dashboard';
type SavedGame = {
    name: string;
    saveData: {
        matchState: MatchState;
        time: number;
        totalTime: number;
    }
}

const SAVED_GAMES_KEY = 'arbitro90_savedGamesList';

const initialMatchState: MatchState = {
  teamA: {
    name: "Time A",
    flag: null,
    players: [],
    score: 0,
  },
  teamB: {
    name: "Time B",
    flag: null,
    players: [],
    score: 0,
  },
  events: [],
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('management');
  const [time, setTime] = useState(0);
  const [totalTime, setTotalTime] = useState(90 * 60); // 90 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [matchState, setMatchState] = useState<MatchState>(initialMatchState);
  
  const [savedGamesList, setSavedGamesList] = useState<{ name: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveGameName, setSaveGameName] = useState('');

  // Load saved games list from localStorage on initial render
  useEffect(() => {
    try {
      const savedDataJSON = localStorage.getItem(SAVED_GAMES_KEY);
      if (savedDataJSON) {
        const savedData: SavedGame[] = JSON.parse(savedDataJSON);
        setSavedGamesList(savedData.map(g => ({ name: g.name })));
      }
    } catch (error) {
      console.error("Failed to load saved games list", error);
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleSetTotalTime = (minutes: number) => {
    if (time === 0) {
      setTotalTime(minutes * 60);
    }
  };

  const handleAddTime = (minutes: number) => {
    setTotalTime(prev => prev + (minutes * 60));
  };
  
  const handleOpenSaveModal = () => {
    setSaveGameName(selectedGame || '');
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!saveGameName.trim()) return;

    try {
        const savedDataJSON = localStorage.getItem(SAVED_GAMES_KEY);
        const savedGames: SavedGame[] = savedDataJSON ? JSON.parse(savedDataJSON) : [];
        
        const newSaveData = { matchState, time, totalTime };

        const existingGameIndex = savedGames.findIndex(g => g.name === saveGameName.trim());
        if (existingGameIndex > -1) {
            savedGames[existingGameIndex].saveData = newSaveData;
        } else {
            savedGames.push({ name: saveGameName.trim(), saveData: newSaveData });
        }

        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
        setSavedGamesList(savedGames.map(g => ({ name: g.name })));
        setSelectedGame(saveGameName.trim());
        setIsSaveModalOpen(false);
    } catch (error) {
        console.error("Failed to save game", error);
    }
  };

  const handleLoadGame = (gameName: string) => {
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
                  setIsRunning(false); // Stop timer on load
              }
          }
      } catch (error) {
          console.error("Failed to load game", error);
      }
  };
  
  const handleOpenDeleteModal = () => {
    if (!selectedGame) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedGame) return;

    try {
        const savedDataJSON = localStorage.getItem(SAVED_GAMES_KEY);
        let savedGames: SavedGame[] = savedDataJSON ? JSON.parse(savedDataJSON) : [];
        savedGames = savedGames.filter(g => g.name !== selectedGame);
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
        setSavedGamesList(savedGames.map(g => ({ name: g.name })));
        handleClearReport();
        setIsDeleteModalOpen(false);
    } catch (error) {
        console.error("Failed to delete game", error);
    }
  };

  const handleClearReport = () => {
    setMatchState(initialMatchState);
    handleReset();
    setSelectedGame('');
  };

  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm md:text-base font-semibold border-b-4 transition-colors duration-300 ${
        activeTab === tab 
          ? 'border-brand-blue text-brand-blue' 
          : 'border-transparent text-dark-text-secondary hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'stopwatch':
        return <Stopwatch 
                  time={time} 
                  totalTime={totalTime}
                  isRunning={isRunning} 
                  onStart={handleStart} 
                  onStop={handleStop} 
                  onReset={handleReset}
                  onSetTotalTime={handleSetTotalTime}
                  onAddTime={handleAddTime} 
                />;
      case 'management':
        return <MatchManagement matchState={matchState} setMatchState={setMatchState} currentTime={formatTime(time)} onSaveGame={handleOpenSaveModal} />;
      case 'dashboard':
        return <Dashboard matchState={matchState} onClearReport={handleClearReport} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen flex flex-col font-sans">
       <style>{`
        .input-field-header {
          background-color: #1e1e1e;
          border: 1px solid #3a3a3a;
          color: #e0e0e0;
          padding: 6px 10px;
          border-radius: 6px;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-size: 0.875rem;
        }
        .input-field-header:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.5);
        }
       `}</style>
      <header className="bg-dark-surface shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-3 text-dark-text">
                <WhistleBallIcon className="h-8 w-8 text-brand-green" />
                <h1 className="text-2xl font-bold tracking-wider">
                    ÁRBITRO <span className="text-brand-green font-semibold">90º</span>
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="saved-games" className="text-sm font-medium text-dark-text-secondary">Jogos Salvos:</label>
                <select 
                    id="saved-games"
                    value={selectedGame}
                    onChange={(e) => handleLoadGame(e.target.value)}
                    className="input-field-header"
                >
                    <option value="" disabled>Carregar um jogo</option>
                    {savedGamesList.map(g => (
                        <option key={g.name} value={g.name}>{g.name}</option>
                    ))}
                </select>
                <button 
                    onClick={handleOpenDeleteModal} 
                    disabled={!selectedGame}
                    className="p-2 bg-dark-surface rounded-md hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed border border-gray-600 hover:border-brand-red"
                    title="Apagar jogo selecionado"
                >
                    <TrashIcon className="h-4 w-4 text-dark-text-secondary" />
                </button>
            </div>
        </div>
        <div className="container mx-auto px-4">
          <nav className="flex">
            <TabButton tab="stopwatch" label="Cronômetro" icon={<ClockIcon />} />
            <TabButton tab="management" label="Gerenciar Partida" icon={<WhistleIcon />} />
            <TabButton tab="dashboard" label="Relatório" icon={<ChartBarIcon />} />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="bg-dark-surface rounded-lg shadow-xl h-full">
            {renderContent()}
        </div>
      </main>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsSaveModalOpen(false)}>
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Salvar Jogo</h3>
                <label htmlFor="saveGameName" className="block mb-1 text-sm text-dark-text-secondary">Nome da Partida</label>
                <input
                    id="saveGameName"
                    type="text"
                    value={saveGameName}
                    onChange={(e) => setSaveGameName(e.target.value)}
                    placeholder="Ex: Final do Campeonato"
                    className="input-field-header w-full mb-6"
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsSaveModalOpen(false)}
                        className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmSave}
                        disabled={!saveGameName.trim()}
                        className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
                    <AlertTriangleIcon className="h-6 w-6 text-brand-red" />
                </div>
                <h3 className="text-lg font-bold mb-2">Apagar Jogo Salvo?</h3>
                <p className="text-sm text-dark-text-secondary mb-6">
                    Tem certeza que deseja apagar o jogo <span className="font-bold text-dark-text">"{selectedGame}"</span>? Esta ação é irreversível.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-6 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors w-full"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-6 py-2 rounded-md bg-brand-red hover:bg-red-700 text-white transition-colors w-full"
                    >
                        Confirmar Exclusão
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
