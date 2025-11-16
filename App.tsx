
import React, { useState, useEffect, useCallback } from 'react';
import Stopwatch from './components/Stopwatch';
import MatchManagement from './components/MatchManagement';
import Dashboard from './components/Dashboard';
import { MatchState, PlayerPosition, Player, Team } from './types';
import { ClockIcon, WhistleIcon, ChartBarIcon, WhistleBallIcon } from './components/icons';

type Tab = 'stopwatch' | 'management' | 'dashboard';

const initialMatchState: MatchState = {
  teamA: {
    name: "Barcelona",
    flag: null,
    players: [
        { id: 1, name: 'Marc-André ter Stegen', number: 1, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 2, name: 'Alejandro Balde', number: 3, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 3, name: 'Ronald Araújo', number: 4, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 4, name: 'Pau Cubarsí', number: 5, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 5, name: 'Gavi', number: 6, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 6, name: 'Ferran Torres', number: 7, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 7, name: 'Pedri', number: 8, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 8, name: 'Robert Lewandowski', number: 9, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 9, name: 'Lamine Yamal', number: 10, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 10, name: 'Raphinha', number: 11, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 11, name: 'Frenkie de Jong', number: 21, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 12, name: 'Joan García', number: 13, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 13, name: 'Marcus Rashford', number: 14, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 14, name: 'Andreas Christensen', number: 15, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 15, name: 'Fermín López', number: 16, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 16, name: 'Marc Casadó', number: 17, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 17, name: 'Gerard Martín', number: 18, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 18, name: 'Dani Olmo', number: 20, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 19, name: 'Marc Bernal', number: 22, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 20, name: 'Jules Koundé', number: 23, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 21, name: 'Eric García', number: 24, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 22, name: 'Wojciech Szczesny', number: 25, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 23, name: 'Jofre Torrents', number: 26, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 24, name: 'Dro Fernández', number: 27, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 25, name: 'Roony Bardghji', number: 28, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 26, name: 'Toni Fernández', number: 29, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 27, name: 'Guille Fernández', number: 30, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 28, name: 'Diego Kochen', number: 31, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 29, name: 'Eder Aller', number: 33, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 30, name: 'Juan Hernández', number: 41, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 31, name: 'Xavi Espart', number: 42, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
    ],
    score: 0,
  },
  teamB: {
    name: "Real Madrid",
    flag: null,
    players: [
        { id: 32, name: 'Thibaut Courtois', number: 1, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 33, name: 'Dani Carvajal', number: 2, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 34, name: 'Éder Militão', number: 3, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 35, name: 'David Alaba', number: 4, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 36, name: 'Jude Bellingham', number: 5, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 37, name: 'Eduardo Camavinga', number: 6, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 38, name: 'Vinícius Júnior', number: 7, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 39, name: 'Federico Valverde', number: 8, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 40, name: 'Endrick', number: 9, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 41, name: 'Kylian Mbappé', number: 10, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 42, name: 'Rodrygo', number: 11, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: true },
        { id: 43, name: 'Trent Alexander-Arnold', number: 12, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 44, name: 'Andriy Lunin', number: 13, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 45, name: 'Aurélien Tchouaméni', number: 14, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 46, name: 'Arda Güler', number: 15, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 47, name: 'Gonzalo García', number: 16, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 48, name: 'Raúl Asencio', number: 17, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 49, name: 'Álvaro Carreras', number: 18, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 50, name: 'Dani Ceballos', number: 19, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 51, name: 'Fran García', number: 20, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 52, name: 'Brahim Díaz', number: 21, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 53, name: 'Antonio Rüdiger', number: 22, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 54, name: 'Ferland Mendy', number: 23, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 55, name: 'Dean Huijsen', number: 24, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 56, name: 'Fran González', number: 26, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 57, name: 'Diego Aguado', number: 27, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 58, name: 'Javier Navarro', number: 29, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 59, name: 'Franco Mastantuono', number: 30, position: PlayerPosition.Forward, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 60, name: 'Jesús Fortea', number: 32, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 61, name: 'David Jiménez', number: 35, position: PlayerPosition.Defender, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 62, name: 'Sergio Mestre', number: 43, position: PlayerPosition.Goalkeeper, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
        { id: 63, name: 'Thiago Pitarch', number: 45, position: PlayerPosition.Midfielder, goals: 0, yellowCards: 0, redCard: false, isStarter: false },
    ],
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
  
  const handleClearReport = () => {
    // Confirmation is now handled in the Dashboard component's modal
    setMatchState(prev => {
        const resetPlayerStats = (player: Player): Player => ({
            ...player,
            goals: 0,
            yellowCards: 0,
            redCard: false,
        });

        const resetTeam = (team: Team): Team => ({
            ...team,
            score: 0,
            players: team.players.map(resetPlayerStats)
        });

        return {
            ...prev,
            teamA: resetTeam(prev.teamA),
            teamB: resetTeam(prev.teamB),
            events: []
        };
    });
    handleReset(); // Also reset the stopwatch
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
        return <MatchManagement matchState={matchState} setMatchState={setMatchState} currentTime={formatTime(time)} />;
      case 'dashboard':
        return <Dashboard matchState={matchState} onClearReport={handleClearReport} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen flex flex-col font-sans">
      <header className="bg-dark-surface shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-3 text-dark-text">
            <WhistleBallIcon className="h-8 w-8 text-brand-green" />
            <h1 className="text-2xl font-bold tracking-wider">
                ÁRBITRO <span className="text-brand-green font-semibold">90º</span>
            </h1>
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
    </div>
  );
};

export default App;
