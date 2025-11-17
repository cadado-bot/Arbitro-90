
import React, { useState } from 'react';
import { Tournament, Matchup, Team } from '../types';
import { PlusIcon, SaveIcon, TrashIcon, UsersIcon } from './icons';
import { useLanguage } from '../LanguageContext';


interface TournamentProps {
    tournament: Tournament | null;
    onCreateTournament: (teamNames: string[], tournamentName: string, phase: { key: string, name: string, teams: number }) => void;
    onManageMatch: (matchup: Matchup, tournamentName: string) => void;
    savedTournaments: { name: string }[];
    selectedTournamentName: string;
    onLoadTournament: (name: string) => void;
    onSaveTournament: () => void;
    onOpenDeleteTournamentModal: () => void;
    onNewTournament: () => void;
    onOpenTeamRegistry: () => void;
    registeredTeams: Team[];
}

const MatchupCard: React.FC<{ matchup: Matchup, onManageMatch: () => void, title?: string, t: (key: string) => string }> = ({ matchup, onManageMatch, title, t }) => {
    const isClickable = !matchup.teamA.name.includes('Vencedor') && !matchup.teamB.name.includes('Vencedor') && !matchup.teamA.name.includes('Perdedor');
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
                {t('manageMatch')}
            </button>
        </div>
    );
};

const BracketColumn: React.FC<{ title: string; matchups: Matchup[]; onManageMatch: (matchup: Matchup) => void; t: (key: string) => string; }> = ({ title, matchups, onManageMatch, t }) => (
    <div className="flex flex-col items-center gap-8 w-64">
        <h3 className="text-xl font-bold text-dark-text-secondary tracking-wider">{title}</h3>
        <div className="flex flex-col gap-12 w-full">
            {matchups.map(m => <MatchupCard key={m.id} matchup={m} onManageMatch={() => onManageMatch(m)} t={t} />)}
        </div>
    </div>
);

const CreateTournamentModal: React.FC<{ phase: { key: string, name: string, teams: number }, onClose: () => void; onCreate: (teamNames: string[], tournamentName: string) => void; registeredTeams: Team[]; t: (key: string) => string; }> = ({ phase, onClose, onCreate, registeredTeams, t }) => {
    const [teamNames, setTeamNames] = useState<string[]>(Array(phase.teams).fill(''));
    const [tournamentName, setTournamentName] = useState('');

    const handleNameChange = (index: number, name: string) => {
        const newNames = [...teamNames];
        newNames[index] = name;
        setTeamNames(newNames);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamNames.every(name => name.trim() !== '') && tournamentName.trim() !== '') {
            onCreate(teamNames.map(name => name.trim()), tournamentName.trim());
            onClose();
        }
    };

    const teamDatalistId = 'registered-teams-list';
    const insertText = t('insertTeamNames')
        .replace('{count}', String(phase.teams))
        .replace('{phaseName}', phase.name);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{t('createNewTournament')}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <label htmlFor="tournamentName" className="block text-sm text-dark-text-secondary">{t('tournamentName')}</label>
                    <input id="tournamentName" type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} placeholder={t('tournamentNamePlaceholder')} className="input-field w-full" required />
                    <p className="text-sm text-dark-text-secondary pt-2">{insertText}</p>
                    <datalist id={teamDatalistId}>
                        {registeredTeams.map(team => <option key={team.id || team.name} value={team.name} />)}
                    </datalist>
                    <div className={`grid ${phase.teams > 4 ? 'grid-cols-2' : 'grid-cols-1'} gap-3 max-h-60 overflow-y-auto pr-2`}>
                        {teamNames.map((name, index) => (
                            <input
                                key={index}
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                placeholder={t('teamPlaceholder').replace('{index}', String(index + 1))}
                                className="input-field w-full"
                                list={teamDatalistId}
                                required
                            />
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors">
                            {t('cancel')}
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-blue hover:bg-blue-700 text-white transition-colors">
                            {t('createTournament')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TournamentComponent: React.FC<TournamentProps> = ({ tournament, onCreateTournament, onManageMatch, savedTournaments, selectedTournamentName, onLoadTournament, onSaveTournament, onOpenDeleteTournamentModal, onNewTournament, onOpenTeamRegistry, registeredTeams }) => {
    const { t } = useLanguage();
    const [creationPhase, setCreationPhase] = useState<{ key: string, name: string, teams: number } | null>(null);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

    const tournamentPhases = [
        { key: 'R32', name: t('phaseR32'), teams: 32 },
        { key: 'R16', name: t('phaseR16'), teams: 16 },
        { key: 'QF', name: t('phaseQF'), teams: 8 },
        { key: 'SF', name: t('phaseSF'), teams: 4 },
        { key: 'F', name: t('phaseF'), teams: 2 },
        { key: '3P', name: t('phase3P'), teams: 2 },
    ];
    const roundOrder = [t('phaseR32'), t('phaseR16'), t('phaseQF'), t('phaseSF'), t('phaseF')];

    const handleSave = () => {
        onSaveTournament();
        setShowSaveConfirmation(true);
        setTimeout(() => setShowSaveConfirmation(false), 2000);
    };

    if (!tournament) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <h2 className="text-2xl font-bold text-dark-text mb-2">{t('noTournament')}</h2>
                <p className="text-dark-text-secondary mb-6">{t('createOrLoadTournament')}</p>
                
                 <div className="flex flex-col items-center gap-4 mb-6 w-full max-w-md">
                    <div className="flex items-center gap-2">
                        <label htmlFor="saved-tournaments" className="text-sm font-medium text-dark-text-secondary">{t('savedTournaments')}:</label>
                        <select id="saved-tournaments" value={selectedTournamentName} onChange={(e) => onLoadTournament(e.target.value)} className="input-field-header">
                            <option value="" disabled>{t('loadTournament')}</option>
                            {savedTournaments.map(t => (<option key={t.name} value={t.name}>{t.name}</option>))}
                        </select>
                         <button onClick={onOpenDeleteTournamentModal} disabled={!selectedTournamentName} className="p-2 bg-dark-surface rounded-md hover:bg-gray-700 disabled:opacity-50 border border-gray-600 hover:border-brand-red" title={t('deleteSelectedTournament')}>
                            <TrashIcon className="h-4 w-4 text-dark-text-secondary" />
                        </button>
                    </div>
                    <button onClick={onOpenTeamRegistry} className="btn-primary bg-gray-600 hover:bg-gray-700 flex items-center justify-center gap-2 w-full">
                        <UsersIcon className="h-5 w-5" />
                        {t('manageRegisteredTeams')}
                    </button>
                </div>


                <p className="text-dark-text-secondary mb-4">{t('orCreateNew')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                {creationPhase && <CreateTournamentModal phase={creationPhase} onCreate={(teams, name) => onCreateTournament(teams, name, creationPhase)} onClose={() => setCreationPhase(null)} registeredTeams={registeredTeams} t={t} />}
                <style>{`.btn-primary { padding: 10px 16px; font-size: 1rem; } .input-field-header { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; }`}</style>
            </div>
        );
    }
    
    const sortedRounds = Object.entries(tournament.rounds).sort(([keyA], [keyB]) => {
        return roundOrder.indexOf(keyA) - roundOrder.indexOf(keyB);
    });

    return (
        <div className="p-4 md:p-6 text-dark-text h-full flex flex-col">
            <style>{`.btn-primary { padding: 6px 10px; font-weight: 600; color: white; border-radius: 6px; } .input-field-header { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; }`}</style>
            
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4 border-b border-dark-surface pb-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="saved-tournaments" className="text-sm font-medium text-dark-text-secondary">{t('savedTournaments')}:</label>
                    <select id="saved-tournaments" value={selectedTournamentName} onChange={(e) => onLoadTournament(e.target.value)} className="input-field-header">
                        <option value="" disabled>{t('loadTournament')}</option>
                        {savedTournaments.map(t => (<option key={t.name} value={t.name}>{t.name}</option>))}
                    </select>
                    <button onClick={onOpenDeleteTournamentModal} disabled={!selectedTournamentName} className="p-2 bg-dark-surface rounded-md hover:bg-gray-700 disabled:opacity-50 border border-gray-600 hover:border-brand-red" title={t('deleteSelectedTournament')}>
                        <TrashIcon className="h-4 w-4 text-dark-text-secondary" />
                    </button>
                </div>
                <h2 className="text-xl font-bold">{tournament.name}</h2>
                <div className="flex items-center gap-2">
                     <button onClick={onNewTournament} className="btn-primary bg-gray-600 hover:bg-gray-700 flex items-center gap-2">
                        <PlusIcon className="h-4 w-4" />
                        {t('newTournament')}
                    </button>
                    <button onClick={handleSave} className="btn-primary bg-brand-green hover:bg-green-700 flex items-center gap-2">
                        <SaveIcon className="h-4 w-4" />
                        {t('saveTournament')}
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-x-auto">
                <div className="flex justify-center items-start gap-12 p-8 min-w-max">
                    {sortedRounds.map(([title, matchups]) => (
                        <BracketColumn key={title} title={title} matchups={matchups} onManageMatch={(m) => onManageMatch(m, tournament.name)} t={t} />
                    ))}
                    {tournament.thirdPlace && (
                        <div className="flex flex-col items-center gap-8 w-64 mt-20">
                            <MatchupCard matchup={tournament.thirdPlace} onManageMatch={() => onManageMatch(tournament.thirdPlace!, tournament.name)} title={t('thirdPlacePlayoff')} t={t} />
                        </div>
                    )}
                </div>
            </div>
            {showSaveConfirmation && (
                <div className="fixed bottom-4 right-4 bg-brand-green text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                    {t('tournamentProgressSaved')}
                </div>
            )}
        </div>
    );
};

export default TournamentComponent;
