import React, { useState, useEffect, useCallback } from 'react';
import Stopwatch from './components/Stopwatch';
import MatchManagement from './components/MatchManagement';
import Dashboard from './components/Dashboard';
import TournamentComponent from './components/Tournament';
import LeagueComponent from './components/League';
import TeamRegistryModal from './components/TeamRegistryModal';
// FIX: Import 'LeagueMatchup' type to resolve 'Cannot find name' errors.
import { MatchState, Tournament, Matchup, League, Team, LeagueMatchup } from './types';
import { ClockIcon, WhistleIcon, ChartBarIcon, WhistleBallIcon, TrophyIcon, ListBulletIcon, AlertTriangleIcon } from './components/icons';

type Tab = 'stopwatch' | 'management' | 'dashboard' | 'tournament' | 'league';

type SavedGame = {
    name: string;
    saveData: {
        matchState: MatchState;
        time: number;
        totalTime: number;
    }
}

const SAVED_GAMES_KEY = 'arbitro90_savedGamesList';
const SAVED_TOURNAMENTS_KEY = 'arbitro90_savedTournaments';
const SAVED_LEAGUES_KEY = 'arbitro90_savedLeagues';
const REGISTERED_TEAMS_KEY = 'arbitro90_registeredTeams';

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
  
  const [savedTournaments, setSavedTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentName, setSelectedTournamentName] = useState('');
  const [isDeleteTournamentModalOpen, setIsDeleteTournamentModalOpen] = useState(false);
  const activeTournament = savedTournaments.find(t => t.name === selectedTournamentName) || null;
  
  const [savedLeagues, setSavedLeagues] = useState<League[]>([]);
  const [selectedLeagueName, setSelectedLeagueName] = useState('');
  const [isDeleteLeagueModalOpen, setIsDeleteLeagueModalOpen] = useState(false);
  const activeLeague = savedLeagues.find(l => l.name === selectedLeagueName) || null;

  const [registeredTeams, setRegisteredTeams] = useState<Team[]>([]);
  const [isTeamRegistryModalOpen, setIsTeamRegistryModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedGamesJSON = localStorage.getItem(SAVED_GAMES_KEY);
      if (savedGamesJSON) {
        const savedData: SavedGame[] = JSON.parse(savedGamesJSON);
        setSavedGamesList(savedData.map(g => ({ name: g.name })));
      }
      const savedTournamentsJSON = localStorage.getItem(SAVED_TOURNAMENTS_KEY);
      if (savedTournamentsJSON) {
        setSavedTournaments(JSON.parse(savedTournamentsJSON));
      }
       const savedLeaguesJSON = localStorage.getItem(SAVED_LEAGUES_KEY);
      if (savedLeaguesJSON) {
        setSavedLeagues(JSON.parse(savedLeaguesJSON));
      }
       const registeredTeamsJSON = localStorage.getItem(REGISTERED_TEAMS_KEY);
      if (registeredTeamsJSON) {
        setRegisteredTeams(JSON.parse(registeredTeamsJSON));
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

  const handleSaveRegisteredTeams = (teams: Team[]) => {
    setRegisteredTeams(teams);
    localStorage.setItem(REGISTERED_TEAMS_KEY, JSON.stringify(teams));
  };

  const handleSaveTournaments = (tournaments: Tournament[]) => {
      setSavedTournaments(tournaments);
      localStorage.setItem(SAVED_TOURNAMENTS_KEY, JSON.stringify(tournaments));
  }
  
  const handleSaveLeagues = (leagues: League[]) => {
    setSavedLeagues(leagues);
    localStorage.setItem(SAVED_LEAGUES_KEY, JSON.stringify(leagues));
  };


  const updateTournamentBracket = useCallback((savedMatchState: MatchState, gameKey: string) => {
    const tournamentName = gameKey.match(/^Torneio \((.*?)\):/)?.[1];
    if (!tournamentName) return;

    const newTournaments = [...savedTournaments];
    const tournamentIndex = newTournaments.findIndex(t => t.name === tournamentName);
    if (tournamentIndex === -1) return;
    
    const tournamentToUpdate = JSON.parse(JSON.stringify(newTournaments[tournamentIndex])) as Tournament;
    const allMatchups = Object.values(tournamentToUpdate.rounds).flat().concat(tournamentToUpdate.thirdPlace || []);
    const matchup = allMatchups.find(m => m && m.gameSaveKey === gameKey);

    if(matchup) {
        const scoreA = savedMatchState.teamA.score;
        const scoreB = savedMatchState.teamB.score;
        matchup.teamA.score = scoreA;
        matchup.teamB.score = scoreB;

        const isSemiFinal = tournamentToUpdate.rounds['SEMIFINAIS']?.some(m => m.id === matchup.id);

        if (scoreA !== scoreB) {
            const winnerName = scoreA > scoreB ? matchup.teamA.name : matchup.teamB.name;
            const loserName = scoreA < scoreB ? matchup.teamA.name : matchup.teamB.name;

            if(matchup.nextMatchupId) {
                const nextMatchup = allMatchups.find(m => m && m.id === matchup.nextMatchupId);
                if (nextMatchup) {
                    if (matchup.winnerSlot === 'A') nextMatchup.teamA.name = winnerName;
                    else if (matchup.winnerSlot === 'B') nextMatchup.teamB.name = winnerName;
                }
            }
            if(isSemiFinal && matchup.loserNextMatchupId) {
                const thirdPlaceMatch = allMatchups.find(m => m && m.id === matchup.loserNextMatchupId);
                 if (thirdPlaceMatch) {
                    if (matchup.loserSlot === 'A') thirdPlaceMatch.teamA.name = loserName;
                    else if (matchup.loserSlot === 'B') thirdPlaceMatch.teamB.name = loserName;
                }
            }
        }
    }
    newTournaments[tournamentIndex] = tournamentToUpdate;
    handleSaveTournaments(newTournaments);
  }, [savedTournaments]);

  const updateLeagueTableAndSave = useCallback((savedMatchState: MatchState, gameKey: string) => {
    const leagueName = gameKey.match(/^Liga: (.*?):/)?.[1];
    if (!leagueName) return;

    const newLeagues = [...savedLeagues];
    const leagueIndex = newLeagues.findIndex(l => l.name === leagueName);
    if (leagueIndex === -1) return;

    const leagueToUpdate = JSON.parse(JSON.stringify(newLeagues[leagueIndex])) as League;
    const matchup = leagueToUpdate.matchups.find(m => m.gameSaveKey === gameKey);
    if (!matchup) return;

    matchup.teamA.score = savedMatchState.teamA.score;
    matchup.teamB.score = savedMatchState.teamB.score;

    const initialStats = { points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
    const statsMap = new Map<string, any>(leagueToUpdate.stats.map(s => [s.name, { ...s, ...initialStats }]));

    for (const m of leagueToUpdate.matchups) {
        if (m.teamA.score !== null && m.teamB.score !== null) {
            const statsA = statsMap.get(m.teamA.name)!;
            const statsB = statsMap.get(m.teamB.name)!;

            statsA.gamesPlayed++;
            statsB.gamesPlayed++;
            statsA.goalsFor += m.teamA.score;
            statsB.goalsFor += m.teamB.score;
            statsA.goalsAgainst += m.teamB.score;
            statsB.goalsAgainst += m.teamA.score;

            if (m.teamA.score > m.teamB.score) {
                statsA.wins++;
                statsB.losses++;
                statsA.points += 3;
            } else if (m.teamB.score > m.teamA.score) {
                statsB.wins++;
                statsA.losses++;
                statsB.points += 3;
            } else {
                statsA.draws++;
                statsB.draws++;
                statsA.points++;
                statsB.points++;
            }
        }
    }

    const updatedStats = Array.from(statsMap.values()).map(s => ({
        ...s,
        goalDifference: s.goalsFor - s.goalsAgainst
    }));

    updatedStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
    });
    
    leagueToUpdate.stats = updatedStats;
    newLeagues[leagueIndex] = leagueToUpdate;
    handleSaveLeagues(newLeagues);
}, [savedLeagues]);

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

        if (trimmedName.startsWith('Torneio')) {
            updateTournamentBracket(matchState, trimmedName);
        }
        if (trimmedName.startsWith('Liga:')) {
            updateLeagueTableAndSave(matchState, trimmedName);
        }
    } catch (error) { console.error("Failed to save game", error); }
  }, [saveGameName, matchState, time, totalTime, updateTournamentBracket, updateLeagueTableAndSave]);

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
  
  const handleLoadLeague = (name: string) => {
    setSelectedLeagueName(name);
  };
  
  const handleOpenDeleteLeagueModal = () => {
    if (selectedLeagueName) setIsDeleteLeagueModalOpen(true);
  };
  
  const handleConfirmDeleteLeague = () => {
    const newLeagues = savedLeagues.filter(l => l.name !== selectedLeagueName);
    handleSaveLeagues(newLeagues);
    setSelectedLeagueName('');
    setIsDeleteLeagueModalOpen(false);
  };

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
        
        handleClearReport();
    } catch (error) { console.error("Failed to delete game", error); }
  }, [selectedGame]);

  const handleClearReport = () => {
    setMatchState(initialMatchState);
    handleReset();
    setSelectedGame('');
  };
  
  const handleNewGame = () => handleClearReport();
  const handleNewTournament = () => setSelectedTournamentName('');
  const handleNewLeague = () => setSelectedLeagueName('');

  const handleCreateTournament = (teamNames: string[], tournamentName: string, phase: { key: string, name: string, teams: number }) => {
      let currentId = 1;
      const rounds: Tournament['rounds'] = {};
      let thirdPlace: Matchup | null = null;
      const createGameKey = (prefix: string, teamA: string, teamB: string) => `${prefix} (${tournamentName}): ${teamA} vs ${teamB}`;

      if (phase.key === '3P') {
          thirdPlace = { id: currentId++, teamA: { name: teamNames[0] || 'Time A', score: null }, teamB: { name: teamNames[1] || 'Time B', score: null }, nextMatchupId: null, gameSaveKey: createGameKey('Torneio 3ºL', teamNames[0], teamNames[1]) };
          handleSaveTournaments([...savedTournaments, { name: tournamentName, rounds, thirdPlace }]);
          setSelectedTournamentName(tournamentName);
          return;
      }
      const createRound = (numTeams: number, roundName: string, teams: string[]): Matchup[] => {
          const matchups: Matchup[] = [];
          for (let i = 0; i < numTeams; i += 2) {
              matchups.push({ id: currentId++, teamA: { name: teams[i] || `Vencedor`, score: null }, teamB: { name: teams[i + 1] || `Vencedor`, score: null }, nextMatchupId: null, loserNextMatchupId: null, gameSaveKey: null });
          }
          rounds[roundName] = matchups; return matchups;
      };
      const linkRounds = (currentRound: Matchup[], nextRound: Matchup[]) => {
          for(let i=0; i < currentRound.length; i++) {
              const matchup = currentRound[i]; const nextMatchup = nextRound[Math.floor(i / 2)];
              matchup.nextMatchupId = nextMatchup.id; matchup.winnerSlot = (i % 2 === 0) ? 'A' : 'B';
          }
      };
      const allPhases = [ { key: 'R32', name: 'DEZESSEIS AVOS DE FINAL', teams: 32 }, { key: 'R16', name: 'OITAVAS DE FINAL', teams: 16 }, { key: 'QF', name: 'QUARTAS DE FINAL', teams: 8 }, { key: 'SF', name: 'SEMIFINAIS', teams: 4 }, { key: 'F', name: 'FINAL', teams: 2 } ];
      const startIndex = allPhases.findIndex(p => p.key === phase.key);
      let previousRound: Matchup[] = [];
      for (let i = startIndex; i < allPhases.length; i++) {
          const currentPhase = allPhases[i]; const isFirstRound = i === startIndex;
          const teams = isFirstRound ? teamNames : []; const currentRound = createRound(currentPhase.teams, currentPhase.name, teams);
          if (!isFirstRound) { linkRounds(previousRound, currentRound); }
          previousRound = currentRound;
      }
      if (startIndex <= 3) {
          const semiFinals = rounds['SEMIFINAIS'];
          if (semiFinals) {
              thirdPlace = { id: currentId++, teamA: { name: 'Perdedor SF1', score: null }, teamB: { name: 'Perdedor SF2', score: null }, nextMatchupId: null, gameSaveKey: null };
              semiFinals[0].loserNextMatchupId = thirdPlace.id; semiFinals[0].loserSlot = 'A';
              semiFinals[1].loserNextMatchupId = thirdPlace.id; semiFinals[1].loserSlot = 'B';
          }
      }
      Object.values(rounds).flat().forEach(matchup => { if (!matchup.teamA.name.includes('Vencedor')) { matchup.gameSaveKey = createGameKey('Torneio', matchup.teamA.name, matchup.teamB.name); } });
      if(thirdPlace && !thirdPlace.teamA.name.includes('Perdedor')) { thirdPlace.gameSaveKey = createGameKey('Torneio 3ºL', thirdPlace.teamA.name, thirdPlace.teamB.name); }
      
      handleSaveTournaments([...savedTournaments, { name: tournamentName, rounds, thirdPlace }]);
      setSelectedTournamentName(tournamentName);
  };
  
  const handleManageTournamentMatch = useCallback((matchup: Matchup, tournamentName: string) => {
    if (!matchup.teamA.name.includes('Vencedor') && !matchup.teamA.name.includes('Perdedor')) {
      let gameKey = matchup.gameSaveKey;
      if (!gameKey) {
          const prefix = matchup.loserNextMatchupId === null ? `Torneio (${tournamentName}):` : `Torneio 3ºL (${tournamentName}):`;
          gameKey = `${prefix} ${matchup.teamA.name} vs ${matchup.teamB.name}`;
          const newTournaments = [...savedTournaments];
          const tIndex = newTournaments.findIndex(t => t.name === tournamentName);
          if (tIndex > -1) {
              const updatedTournament = JSON.parse(JSON.stringify(newTournaments[tIndex])) as Tournament;
              const allMatchups = Object.values(updatedTournament.rounds).flat().concat(updatedTournament.thirdPlace || []);
              const m = allMatchups.find(m => m && m.id === matchup.id);
              if (m) m.gameSaveKey = gameKey;
              handleSaveTournaments(newTournaments);
          }
      }
      const savedGamesJSON = localStorage.getItem(SAVED_GAMES_KEY);
      const savedGames: SavedGame[] = savedGamesJSON ? JSON.parse(savedGamesJSON) : [];
      let gameExists = savedGames.some(g => g.name === gameKey);
      if (!gameExists) {
          const teamAData = registeredTeams.find(t => t.name === matchup.teamA.name);
          const teamBData = registeredTeams.find(t => t.name === matchup.teamB.name);

          const newMatchState: MatchState = {
            teamA: teamAData ? { ...JSON.parse(JSON.stringify(teamAData)), score: 0 } : { name: matchup.teamA.name, flag: null, players: [], score: 0 },
            teamB: teamBData ? { ...JSON.parse(JSON.stringify(teamBData)), score: 0 } : { name: matchup.teamB.name, flag: null, players: [], score: 0 },
            events: []
          };
          const newSaveData = { matchState: newMatchState, time: 0, totalTime: 90 * 60 };
          savedGames.push({ name: gameKey, saveData: newSaveData });
          localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
          setSavedGamesList(savedGames.map(g => ({ name: g.name })));
      }
      handleLoadGame(gameKey!); setActiveTab('management');
    }
  }, [savedTournaments, handleLoadGame, registeredTeams]);
  
   const handleSaveActiveTournament = () => {
    localStorage.setItem(SAVED_TOURNAMENTS_KEY, JSON.stringify(savedTournaments));
   };

  const handleCreateLeague = (teamNames: string[], leagueName: string) => {
    const stats = teamNames.map(name => ({ name, points: 0, gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 }));
    let idCounter = 1;

    const teams = [...teamNames];
    if (teams.length % 2 !== 0) {
        teams.push("BYE");
    }

    const numRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;
    const firstHalfMatchups: LeagueMatchup[] = [];

    for (let round = 0; round < numRounds; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
            const teamA = teams[match];
            const teamB = teams[teams.length - 1 - match];
            if (teamA !== "BYE" && teamB !== "BYE") {
                firstHalfMatchups.push({
                    id: idCounter++,
                    round: round + 1,
                    teamA: { name: teamA, score: null },
                    teamB: { name: teamB, score: null },
                    gameSaveKey: `Liga: ${leagueName}: ${teamA} vs ${teamB}`
                });
            }
        }
        teams.splice(1, 0, teams.pop()!);
    }

    const secondHalfMatchups: LeagueMatchup[] = firstHalfMatchups.map(matchup => ({
        ...matchup,
        id: idCounter++,
        round: matchup.round + numRounds,
        teamA: { name: matchup.teamB.name, score: null },
        teamB: { name: matchup.teamA.name, score: null },
        gameSaveKey: `Liga: ${leagueName}: ${matchup.teamB.name} vs ${matchup.teamA.name} (Volta)`
    }));

    const newLeague: League = {
        name: leagueName,
        stats,
        matchups: [...firstHalfMatchups, ...secondHalfMatchups]
    };

    handleSaveLeagues([...savedLeagues, newLeague]);
    setSelectedLeagueName(leagueName);
  };
  
  const handleManageLeagueMatch = useCallback((matchup: LeagueMatchup, leagueName: string) => {
    const gameKey = matchup.gameSaveKey;
    const savedGamesJSON = localStorage.getItem(SAVED_GAMES_KEY);
    const savedGames: SavedGame[] = savedGamesJSON ? JSON.parse(savedGamesJSON) : [];
    let gameExists = savedGames.some(g => g.name === gameKey);
    if (!gameExists) {
        const teamAData = registeredTeams.find(t => t.name === matchup.teamA.name);
        const teamBData = registeredTeams.find(t => t.name === matchup.teamB.name);
        
        const newMatchState: MatchState = { 
            teamA: teamAData ? { ...JSON.parse(JSON.stringify(teamAData)), score: 0 } : { name: matchup.teamA.name, flag: null, players: [], score: 0 },
            teamB: teamBData ? { ...JSON.parse(JSON.stringify(teamBData)), score: 0 } : { name: matchup.teamB.name, flag: null, players: [], score: 0 },
            events: [] 
        };
        const newSaveData = { matchState: newMatchState, time: 0, totalTime: 90 * 60 };
        savedGames.push({ name: gameKey, saveData: newSaveData });
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
        setSavedGamesList(savedGames.map(g => ({ name: g.name })));
    }
    handleLoadGame(gameKey); setActiveTab('management');
  }, [handleLoadGame, registeredTeams]);
  
  const handleLoadTournament = (name: string) => {
    setSelectedTournamentName(name);
  };

  const handleOpenDeleteTournamentModal = () => {
    if (selectedTournamentName) setIsDeleteTournamentModalOpen(true);
  };

  const handleConfirmDeleteTournament = () => {
    const newTournaments = savedTournaments.filter(t => t.name !== selectedTournamentName);
    handleSaveTournaments(newTournaments);
    setSelectedTournamentName('');
    setIsDeleteTournamentModalOpen(false);
  };


  const formatTime = useCallback((s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`, []);

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm md:text-base font-semibold border-b-4 transition-colors duration-300 ${activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-dark-text-secondary hover:text-white'}`}>
      {icon} {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'stopwatch': return <Stopwatch time={time} totalTime={totalTime} isRunning={isRunning} onStart={handleStart} onStop={handleStop} onReset={handleReset} onSetTotalTime={handleSetTotalTime} onAddTime={handleAddTime} />;
      case 'management': return <MatchManagement matchState={matchState} setMatchState={setMatchState} currentTime={formatTime(time)} onSaveGame={handleOpenSaveModal} onNewGame={handleNewGame} savedGamesList={savedGamesList} selectedGame={selectedGame} onLoadGame={handleLoadGame} onOpenDeleteModal={handleOpenDeleteModal} />;
      case 'dashboard': return <Dashboard matchState={matchState} onClearReport={handleClearReport} />;
      case 'tournament': return <TournamentComponent tournament={activeTournament} onCreateTournament={handleCreateTournament} onManageMatch={handleManageTournamentMatch} savedTournaments={savedTournaments} selectedTournamentName={selectedTournamentName} onLoadTournament={handleLoadTournament} onSaveTournament={handleSaveActiveTournament} onOpenDeleteTournamentModal={handleOpenDeleteTournamentModal} onNewTournament={handleNewTournament} onOpenTeamRegistry={() => setIsTeamRegistryModalOpen(true)} registeredTeams={registeredTeams} />;
      case 'league': return <LeagueComponent league={activeLeague} onCreateLeague={handleCreateLeague} onManageMatch={handleManageLeagueMatch} onSaveLeague={() => handleSaveLeagues(savedLeagues)} onNewLeague={handleNewLeague} savedLeagues={savedLeagues} selectedLeagueName={selectedLeagueName} onLoadLeague={handleLoadLeague} onOpenDeleteLeagueModal={handleOpenDeleteLeagueModal} onOpenTeamRegistry={() => setIsTeamRegistryModalOpen(true)} registeredTeams={registeredTeams} />;
      default: return null;
    }
  };

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen flex flex-col font-sans">
      <header className="bg-dark-surface shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center justify-center gap-3 text-dark-text">
                <WhistleBallIcon className="h-8 w-8 text-brand-green" />
                <h1 className="text-2xl font-bold tracking-wider">ÁRBITRO <span className="text-brand-green font-semibold">90º</span></h1>
            </div>
        </div>
        <div className="container mx-auto px-4">
          <nav className="flex">
            <TabButton tab="management" label="Gerenciar Partida" icon={<WhistleIcon />} />
            <TabButton tab="stopwatch" label="Cronômetro" icon={<ClockIcon />} />
            <TabButton tab="dashboard" label="Relatório" icon={<ChartBarIcon />} />
            <TabButton tab="tournament" label="Torneio" icon={<TrophyIcon />} />
            <TabButton tab="league" label="Liga" icon={<ListBulletIcon />} />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6"><div className="bg-dark-surface rounded-lg shadow-xl h-full">{renderContent()}</div></main>
      
      {isTeamRegistryModalOpen && <TeamRegistryModal registeredTeams={registeredTeams} onSave={handleSaveRegisteredTeams} onClose={() => setIsTeamRegistryModalOpen(false)} />}
      
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
      {isDeleteLeagueModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4"><AlertTriangleIcon className="h-6 w-6 text-brand-red" /></div>
                <h3 className="text-lg font-bold mb-2">Apagar Liga Salva?</h3>
                <p className="text-sm text-dark-text-secondary mb-6">Tem certeza que deseja apagar a liga <span className="font-bold text-dark-text">"{selectedLeagueName}"</span>? Esta ação é irreversível.</p>
                <div className="flex justify-center gap-4"><button onClick={() => setIsDeleteLeagueModalOpen(false)} className="px-6 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text w-full">Cancelar</button><button onClick={handleConfirmDeleteLeague} className="px-6 py-2 rounded-md bg-brand-red hover:bg-red-700 text-white w-full">Confirmar Exclusão</button></div>
            </div>
        </div>
       )}
        {isDeleteTournamentModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4"><AlertTriangleIcon className="h-6 w-6 text-brand-red" /></div>
                <h3 className="text-lg font-bold mb-2">Apagar Torneio Salvo?</h3>
                <p className="text-sm text-dark-text-secondary mb-6">Tem certeza que deseja apagar o torneio <span className="font-bold text-dark-text">"{selectedTournamentName}"</span>? Esta ação é irreversível.</p>
                <div className="flex justify-center gap-4"><button onClick={() => setIsDeleteTournamentModalOpen(false)} className="px-6 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text w-full">Cancelar</button><button onClick={handleConfirmDeleteTournament} className="px-6 py-2 rounded-md bg-brand-red hover:bg-red-700 text-white w-full">Confirmar Exclusão</button></div>
            </div>
        </div>
       )}
    </div>
  );
};
export default App;