import React, { useState } from 'react';
import { League, LeagueMatchup, Team } from '../types';
import { PlusIcon, SaveIcon, TrashIcon, UsersIcon } from './icons';

interface LeagueProps {
    league: League | null;
    onCreateLeague: (teamNames: string[], leagueName: string) => void;
    onManageMatch: (matchup: LeagueMatchup, leagueName: string) => void;
    onSaveLeague: () => void;
    onNewLeague: () => void;
    savedLeagues: { name: string }[];
    selectedLeagueName: string;
    onLoadLeague: (name: string) => void;
    onOpenDeleteLeagueModal: () => void;
    onOpenTeamRegistry: () => void;
    registeredTeams: Team[];
}

const CreateLeagueModal: React.FC<{ onClose: () => void; onCreate: (teamNames: string[], leagueName: string) => void; registeredTeams: Team[] }> = ({ onClose, onCreate, registeredTeams }) => {
    const [numTeams, setNumTeams] = useState(4);
    const [teamNames, setTeamNames] = useState<string[]>(Array(4).fill(''));
    const [leagueName, setLeagueName] = useState('');
    const [step, setStep] = useState(1);

    const handleNumTeamsChange = (num: number) => {
        setNumTeams(num);
        setTeamNames(Array(num).fill(''));
    };

    const handleNameChange = (index: number, name: string) => {
        const newNames = [...teamNames];
        newNames[index] = name;
        setTeamNames(newNames);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamNames.every(name => name.trim() !== '') && leagueName.trim() !== '') {
            onCreate(teamNames.map(name => name.trim()), leagueName.trim());
            onClose();
        }
    };

    const teamDatalistId = 'registered-teams-list-league';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Criar Nova Liga</h3>
                <datalist id={teamDatalistId}>
                    {registeredTeams.map(team => <option key={team.id || team.name} value={team.name} />)}
                </datalist>
                {step === 1 ? (
                    <div>
                        <label htmlFor="leagueName" className="block text-sm text-dark-text-secondary mb-2">Nome do Campeonato</label>
                        <input
                            id="leagueName"
                            type="text"
                            value={leagueName}
                            onChange={(e) => setLeagueName(e.target.value)}
                            className="input-field w-full mb-4"
                            placeholder="Ex: Brasileirão Série A"
                            required
                        />
                        <label htmlFor="numTeams" className="block text-sm text-dark-text-secondary mb-2">Quantos times participarão?</label>
                        <select
                            id="numTeams"
                            value={numTeams}
                            onChange={(e) => handleNumTeamsChange(parseInt(e.target.value, 10))}
                            className="input-field w-full mb-6"
                        >
                            {[...Array(15).keys()].map(i => (
                                <option key={i + 2} value={i + 2}>{i + 2} times</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors">Cancelar</button>
                            <button onClick={() => setStep(2)} disabled={!leagueName.trim()} className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white transition-colors disabled:opacity-50">Próximo</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <p className="text-sm text-dark-text-secondary pb-2">Insira os nomes dos {numTeams} times.</p>
                        <div className={`grid ${numTeams > 8 ? 'grid-cols-2' : 'grid-cols-1'} gap-3 max-h-60 overflow-y-auto pr-2`}>
                            {teamNames.map((name, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    placeholder={`Time ${index + 1}`}
                                    className="input-field w-full"
                                    list={teamDatalistId}
                                    required
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                             <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors">Voltar</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white transition-colors">Criar Liga</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};


const LeagueComponent: React.FC<LeagueProps> = ({ league, onCreateLeague, onManageMatch, onSaveLeague, onNewLeague, savedLeagues, selectedLeagueName, onLoadLeague, onOpenDeleteLeagueModal, onOpenTeamRegistry, registeredTeams }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    const handleSave = () => {
        onSaveLeague();
        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 2000);
    };

    if (!league) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-2xl font-bold text-dark-text mb-2">Nenhuma liga selecionada.</h2>
                <p className="text-dark-text-secondary mb-6">Crie uma nova liga ou carregue uma existente.</p>
                 <div className="flex flex-col items-center gap-4 mb-6 w-full max-w-md">
                    <div className="flex items-center gap-2">
                        <label htmlFor="saved-leagues" className="text-sm font-medium text-dark-text-secondary">Ligas Salvas:</label>
                        <select id="saved-leagues" value={selectedLeagueName} onChange={(e) => onLoadLeague(e.target.value)} className="input-field-header">
                            <option value="" disabled>Carregar uma liga</option>
                            {savedLeagues.map(l => (<option key={l.name} value={l.name}>{l.name}</option>))}
                        </select>
                        <button onClick={onOpenDeleteLeagueModal} disabled={!selectedLeagueName} className="p-2 bg-dark-surface rounded-md hover:bg-gray-700 disabled:opacity-50 border border-gray-600 hover:border-brand-red" title="Apagar liga selecionada">
                            <TrashIcon className="h-4 w-4 text-dark-text-secondary" />
                        </button>
                    </div>
                    <button onClick={onOpenTeamRegistry} className="btn-primary bg-gray-600 hover:bg-gray-700 flex items-center justify-center gap-2 w-full">
                        <UsersIcon className="h-5 w-5" />
                        Gerenciar Times Registrados
                    </button>
                </div>
                 <p className="text-dark-text-secondary mb-4">Ou crie uma nova:</p>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary bg-brand-green hover:bg-green-700 flex items-center justify-center gap-2 px-6 py-3 text-lg"
                >
                    <PlusIcon className="h-6 w-6" />
                    Criar Nova Liga
                </button>
                {isCreateModalOpen && <CreateLeagueModal onCreate={onCreateLeague} onClose={() => setIsCreateModalOpen(false)} registeredTeams={registeredTeams} />}
                 <style>{`.input-field { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 8px 12px; border-radius: 6px; } .input-field-header { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; } .btn-primary { padding: 6px 10px; font-weight: 600; color: white; border-radius: 6px; transition: background-color 0.2s; }`}</style>
            </div>
        );
    }
    
    const rounds = league.matchups.reduce((acc, m) => {
        const roundKey = String(m.round);
        (acc[roundKey] = acc[roundKey] || []).push(m);
        return acc;
    }, {} as Record<string, LeagueMatchup[]>);

    return (
        <div className="p-4 md:p-6 text-dark-text h-full flex flex-col">
            <style>{`
            .table-header { padding: 10px 8px; text-align: left; font-size: 0.75rem; color: #a0a0a0; border-bottom: 2px solid #3a3a3a; text-transform: uppercase; }
            .table-cell { padding: 10px 8px; font-size: 0.875rem; border-bottom: 1px solid #2a2a2a; }
            .team-name-cell { font-weight: 600; color: #e0e0e0; }
            .points-cell { font-weight: 700; }
            .btn-primary { padding: 6px 10px; font-weight: 600; color: white; border-radius: 6px; }
            .input-field-header { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; }
            `}</style>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4 border-b border-dark-surface pb-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="saved-leagues" className="text-sm font-medium text-dark-text-secondary">Ligas Salvas:</label>
                    <select id="saved-leagues" value={selectedLeagueName} onChange={(e) => onLoadLeague(e.target.value)} className="input-field-header">
                        <option value="" disabled>Carregar uma liga</option>
                        {savedLeagues.map(l => (<option key={l.name} value={l.name}>{l.name}</option>))}
                    </select>
                    <button onClick={onOpenDeleteLeagueModal} disabled={!selectedLeagueName} className="p-2 bg-dark-surface rounded-md hover:bg-gray-700 disabled:opacity-50 border border-gray-600 hover:border-brand-red" title="Apagar liga selecionada">
                        <TrashIcon className="h-4 w-4 text-dark-text-secondary" />
                    </button>
                </div>
                 <h3 className="text-xl font-bold text-dark-text">{league.name}</h3>
                 <div className="flex items-center gap-2">
                    <button onClick={onNewLeague} className="btn-primary bg-gray-600 hover:bg-gray-700 flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Nova Liga
                    </button>
                    <button onClick={handleSave} className="btn-primary bg-brand-green hover:bg-green-700 flex items-center gap-2">
                        <SaveIcon className="h-4 w-4" />
                        Salvar Liga
                    </button>
                 </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 flex-grow">
                <div className="flex-grow lg:w-2/3">
                    <div className="bg-dark-card rounded-lg overflow-hidden h-full">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header text-center">#</th>
                                    <th className="table-header">Time</th>
                                    <th className="table-header text-center" title="Pontos">P</th>
                                    <th className="table-header text-center" title="Jogos">J</th>
                                    <th className="table-header text-center" title="Vitórias">V</th>
                                    <th className="table-header text-center" title="Empates">E</th>
                                    <th className="table-header text-center" title="Derrotas">D</th>
                                    <th className="table-header text-center" title="Gols Pró">GP</th>
                                    <th className="table-header text-center" title="Gols Contra">GC</th>
                                    <th className="table-header text-center" title="Saldo de Gols">SG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {league.stats.map((team, index) => (
                                    <tr key={team.name} className="hover:bg-dark-surface/50">
                                        <td className="table-cell text-center text-dark-text-secondary">{index + 1}</td>
                                        <td className="table-cell team-name-cell">{team.name}</td>
                                        <td className="table-cell text-center points-cell text-white">{team.points}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.gamesPlayed}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.wins}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.draws}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.losses}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.goalsFor}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.goalsAgainst}</td>
                                        <td className="table-cell text-center text-dark-text-secondary">{team.goalDifference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:w-1/3">
                    <h3 className="text-xl font-bold text-dark-text-secondary mb-4">Confrontos</h3>
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {Object.entries(rounds).map(([roundNum, matchups]) => (
                            <div key={roundNum}>
                                <h4 className="font-bold text-dark-text-secondary mb-2">Rodada {roundNum}</h4>
                                <div className="space-y-2">
                                    {(matchups as LeagueMatchup[]).map(matchup => (
                                        <div key={matchup.id} className="bg-dark-card p-3 rounded-lg flex items-center justify-between gap-2">
                                            <div className="text-sm flex-grow">
                                                <span>{matchup.teamA.name}</span>
                                                <span className="mx-2 text-dark-text-secondary">vs</span>
                                                <span>{matchup.teamB.name}</span>
                                            </div>
                                            <div className="text-sm font-bold bg-dark-surface px-2 py-1 rounded">
                                                {matchup.teamA.score ?? '-'} x {matchup.teamB.score ?? '-'}
                                            </div>
                                            <button onClick={() => onManageMatch(matchup, league.name)} className="btn-primary text-xs bg-brand-blue hover:bg-blue-700">
                                                Gerenciar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {showSaveConfirmation && (
                <div className="fixed bottom-4 right-4 bg-brand-green text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                    Progresso da Liga salvo!
                </div>
            )}
        </div>
    );
};

export default LeagueComponent;