
import React, { useState, useEffect } from 'react';
import { Team, Player, PlayerPosition } from '../types';
import { PlusIcon, SaveIcon, TrashIcon } from './icons';
import { useLanguage } from '../LanguageContext';

interface TeamRegistryModalProps {
    registeredTeams: Team[];
    onSave: (teams: Team[]) => void;
    onClose: () => void;
}

const TeamRegistryModal: React.FC<TeamRegistryModalProps> = ({ registeredTeams, onSave, onClose }) => {
    const { t } = useLanguage();
    const [teams, setTeams] = useState<Team[]>(() => JSON.parse(JSON.stringify(registeredTeams)));
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerPosition, setNewPlayerPosition] = useState<PlayerPosition>(PlayerPosition.Goalkeeper);

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    useEffect(() => {
        if (!selectedTeamId && teams.length > 0) {
            setSelectedTeamId(teams[0].id!);
        }
         if (selectedTeamId && !teams.some(t => t.id === selectedTeamId)) {
            setSelectedTeamId(teams.length > 0 ? teams[0].id! : null);
        }
    }, [selectedTeamId, teams]);

    const handleCreateTeam = () => {
        const newTeam: Team = {
            id: `team_${Date.now()}`,
            name: `${t('newTeam')} ${teams.length + 1}`,
            flag: null,
            players: [],
            score: 0
        };
        const newTeams = [...teams, newTeam];
        setTeams(newTeams);
        setSelectedTeamId(newTeam.id!);
    };
    
    const handleDeleteTeam = () => {
        if (selectedTeamId) {
            const newTeams = teams.filter(t => t.id !== selectedTeamId);
            setTeams(newTeams);
            setSelectedTeamId(newTeams.length > 0 ? newTeams[0].id! : null);
        }
    };
    
    const handleUpdateTeam = (id: string, updates: Partial<Team>) => {
        setTeams(teams.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTeam && newPlayerName && newPlayerNumber) {
            const newPlayer: Player = {
                id: Date.now(),
                name: newPlayerName,
                number: parseInt(newPlayerNumber),
                position: newPlayerPosition,
                goals: 0,
                yellowCards: 0,
                redCard: false,
                isStarter: selectedTeam.players.length < 11
            };
            handleUpdateTeam(selectedTeam.id!, { players: [...selectedTeam.players, newPlayer] });
            setNewPlayerName('');
            setNewPlayerNumber('');
            setNewPlayerPosition(PlayerPosition.Goalkeeper);
        }
    };

    const handleRemovePlayer = (playerId: number) => {
        if (selectedTeam) {
            const updatedPlayers = selectedTeam.players.filter(p => p.id !== playerId);
            handleUpdateTeam(selectedTeam.id!, { players: updatedPlayers });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedTeamId) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleUpdateTeam(selectedTeamId, { flag: event.target?.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveChanges = () => {
        onSave(teams);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{t('registeredTeamsTitle')}</h2>

                <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-0">
                    {/* Team List */}
                    <div className="md:w-1/3 flex flex-col border-r border-dark-surface pr-4">
                        <div className="flex-grow overflow-y-auto space-y-2">
                            {teams.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeamId(team.id!)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedTeamId === team.id ? 'bg-brand-blue text-white' : 'bg-dark-surface hover:bg-gray-700'}`}
                                >
                                    {team.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-4 mt-auto">
                            <button onClick={handleCreateTeam} className="btn-primary w-full bg-brand-green hover:bg-green-700">{t('newTeam')}</button>
                            <button onClick={handleDeleteTeam} disabled={!selectedTeamId} className="btn-icon bg-brand-red hover:bg-red-700 disabled:opacity-50"><TrashIcon /></button>
                        </div>
                    </div>

                    {/* Team Editor */}
                    <div className="md:w-2/3 flex flex-col">
                        {selectedTeam ? (
                            <>
                                <div className="flex items-center mb-4 gap-4">
                                     <label className="cursor-pointer">
                                        <img src={selectedTeam.flag || 'https://picsum.photos/40'} alt={`${selectedTeam.name} flag`} className="w-10 h-10 rounded-full object-cover bg-dark-surface" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedTeam.name}
                                        onChange={(e) => handleUpdateTeam(selectedTeam.id!, { name: e.target.value })}
                                        className="bg-transparent text-xl font-bold text-dark-text w-full focus:outline-none"
                                    />
                                </div>
                                
                                <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                                     {selectedTeam.players.map(player => (
                                        <div key={player.id} className="flex items-center gap-2 p-2 rounded-md bg-dark-surface">
                                            <span className="font-bold w-8 text-center">{player.number}</span>
                                            <span className={`pos-badge pos-${player.position}`}>{player.position}</span>
                                            <span className="flex-grow text-dark-text-secondary">{player.name}</span>
                                            <button onClick={() => handleRemovePlayer(player.id)} className="btn-icon bg-brand-red/50 hover:bg-red-700/80"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                </div>
                                
                                <form onSubmit={handleAddPlayer} className="space-y-3 mt-4 pt-4 border-t border-dark-surface">
                                    <h4 className="text-sm font-semibold">{t('addNewPlayer')}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder={t('playerNamePlaceholder')} className="input-field w-full" required />
                                        <select value={newPlayerPosition} onChange={(e) => setNewPlayerPosition(e.target.value as PlayerPosition)} className="input-field w-full">
                                            <option value={PlayerPosition.Goalkeeper}>{t('goalkeeper')}</option>
                                            <option value={PlayerPosition.Defender}>{t('defender')}</option>
                                            <option value={PlayerPosition.Midfielder}>{t('midfielder')}</option>
                                            <option value={PlayerPosition.Forward}>{t('forward')}</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" value={newPlayerNumber} onChange={(e) => setNewPlayerNumber(e.target.value)} placeholder={t('playerNumberPlaceholder')} className="input-field flex-1" required />
                                        <button type="submit" className="btn-primary flex-1 bg-brand-blue hover:bg-blue-700 flex items-center justify-center gap-2"><PlusIcon /> {t('addPlayer')}</button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-dark-text-secondary">
                                <p>{t('selectTeamToEdit')}</p>
                            </div>
                        )}
                    </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 mt-auto border-t border-dark-surface">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors">{t('cancel')}</button>
                    <button onClick={handleSaveChanges} className="px-4 py-2 rounded-md bg-brand-green hover:bg-green-700 text-white transition-colors flex items-center gap-2">
                        <SaveIcon className="h-5 w-5" /> {t('saveAndClose')}
                    </button>
                </div>
            </div>
             <style>{`
                .input-field { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 8px 12px; border-radius: 6px; }
                .btn-primary { padding: 8px 12px; color: white; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
                .btn-icon { padding: 8px; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
                .pos-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; color: #121212; width: 24px; text-align: center; }
                .pos-G { background-color: #fcc419; } .pos-D { background-color: #1a73e8; } .pos-M { background-color: #1e8e3e; } .pos-A { background-color: #d93025; }
            `}</style>
        </div>
    );
};

export default TeamRegistryModal;
