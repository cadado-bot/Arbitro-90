import React, { useState } from 'react';
import { Tournament, Matchup } from '../types';
import { PlusIcon } from './icons';

interface TournamentProps {
    tournament: Tournament | null;
    onCreateTournament: (teamNames: string[], phase: { key: string, name: string, teams: number }) => void;
    onManageMatch: (matchup: Matchup) => void;
}

const MatchupCard: React.FC<{ matchup: Matchup, onManageMatch: () => void, title?: string }> = ({ matchup, onManageMatch, title }) => {
    const isClickable = !matchup.teamA.name.includes('Vencedor') && !matchup.teamB.name.includes('Vencedor');
    return (
        <div className="bg-dark-card p-3 rounded-lg shadow-md flex flex-col gap-2 min-h-[120px]">
            {title && <h4 className="text-sm font-bold text-center text-dark-text-secondary -mt-1 mb-1">{title}</h4>}
            <div className="flex justify-between items-center text-sm">
                <span className="text-dark-text flex-1 truncate pr-2">{matchup.teamA.name}</span>
                <span className={`font-bold px-2 py-1 rounded ${matchup.teamA.score !== null && matchup.teamA.score > (matchup.teamB.score ?? -1) ? 'bg-brand-green text-white' : 'bg-dark-surface'}`}>
                    {matchup.teamA.score ?? '-'}
                </span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-dark-text flex-1 truncate pr-2">{matchup.teamB.name}</span>
                <span className={`font-bold px-2 py-1 rounded ${matchup.teamB.score !== null && matchup.teamB.score > (matchup.teamA.score ?? -1) ? 'bg-brand-green text-white' : 'bg-dark-surface'}`}>
                    {matchup.teamB.score ?? '-'}
                </span>
            </div>
            <button
                onClick={onManageMatch}
                disabled={!isClickable}
                className="btn-primary text-xs mt-auto bg-brand-blue hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Gerenciar Partida
            </button>
        </div>
    );
};

const BracketColumn: React.FC<{ title: string; matchups: Matchup[]; onManageMatch: (matchup: Matchup) => void; }> = ({ title, matchups, onManageMatch }) => (
    <div className="flex flex-col items-center gap-8 w-64">
        <h3 className="text-xl font-bold text-dark-text-secondary tracking-wider">{title}</h3>
        <div className="flex flex-col gap-12 w-full">
            {matchups.map(m => <MatchupCard key={m.id} matchup={m} onManageMatch={() => onManageMatch(m)} />)}
        </div>
    </div>
);

const CreateTournamentModal: React.FC<{ phase: { key: string, name: string, teams: number }, onClose: () => void; onCreate: (teamNames: string[]) => void }> = ({ phase, onClose, onCreate }) => {
    const [teamNames, setTeamNames] = useState<string[]>(Array(phase.teams).fill(''));

    const handleNameChange = (index: number, name: string) => {
        const newNames = [...teamNames];
        newNames[index] = name;
        setTeamNames(newNames);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamNames.every(name => name.trim() !== '')) {
            onCreate(teamNames.map(name => name.trim()));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Criar Novo Torneio</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-sm text-dark-text-secondary pb-2">Insira os nomes das {phase.teams} equipes para a fase de {phase.name}.</p>
                    <div className={`grid ${phase.teams > 4 ? 'grid-cols-2' : 'grid-cols-1'} gap-3 max-h-60 overflow-y-auto pr-2`}>
                        {teamNames.map((name, index) => (
                            <input
                                key={index}
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                placeholder={`Time ${index + 1}`}
                                className="input-field w-full"
                                required
                            />
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white transition-colors">
                            Criar Torneio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const tournamentPhases = [
    { key: 'R16', name: 'Oitavas de Final', teams: 16 },
    { key: 'QF', name: 'Quartas de Final', teams: 8 },
    { key: 'SF', name: 'Semifinais', teams: 4 },
    { key: 'F', name: 'Final', teams: 2 },
];
const roundOrder = ['OITAVAS DE FINAL', 'QUARTAS DE FINAL', 'SEMIFINAIS', 'FINAL'];


const TournamentComponent: React.FC<TournamentProps> = ({ tournament, onCreateTournament, onManageMatch }) => {
    const [creationPhase, setCreationPhase] = useState<{ key: string, name: string, teams: number } | null>(null);

    if (!tournament) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-2xl font-bold text-dark-text mb-2">Nenhum torneio em andamento.</h2>
                <p className="text-dark-text-secondary mb-6">Selecione uma fase para iniciar um novo torneio.</p>
                <div className="grid grid-cols-2 gap-4">
                    {tournamentPhases.map(phase => (
                        <button
                            key={phase.key}
                            onClick={() => setCreationPhase(phase)}
                            className="btn-primary bg-brand-green hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <PlusIcon className="h-5 w-5" />
                            {phase.name}
                        </button>
                    ))}
                </div>
                {creationPhase && <CreateTournamentModal phase={creationPhase} onCreate={(teams) => onCreateTournament(teams, creationPhase)} onClose={() => setCreationPhase(null)} />}
                <style>{`.btn-primary { padding: 10px 16px; font-size: 1rem; }`}</style>
            </div>
        );
    }
    
    const sortedRounds = Object.entries(tournament.rounds).sort(([keyA], [keyB]) => {
        return roundOrder.indexOf(keyA) - roundOrder.indexOf(keyB);
    });

    return (
        <div className="p-4 md:p-6 text-dark-text h-full overflow-x-auto">
             <style>{`.btn-primary { padding: 6px 10px; font-weight: 600; color: white; border-radius: 6px; }`}</style>
            <div className="flex justify-center items-start gap-12 p-8">
                 {sortedRounds.map(([title, matchups]) => (
                     <BracketColumn key={title} title={title} matchups={matchups} onManageMatch={onManageMatch} />
                 ))}
                 {tournament.thirdPlace && (
                    <div className="flex flex-col items-center gap-8 w-64 mt-20">
                         <MatchupCard matchup={tournament.thirdPlace} onManageMatch={() => onManageMatch(tournament.thirdPlace!)} title="DISPUTA DE 3º LUGAR" />
                    </div>
                 )}
            </div>
        </div>
    );
};

export default TournamentComponent;