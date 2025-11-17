

import React, { useState } from 'react';
import { MatchState, GameEventType, GameEvent, Team } from '../types';
import { DownloadIcon, TrashIcon, AlertTriangleIcon } from './icons';
import { useLanguage } from '../LanguageContext';

declare var jspdf: any;

interface DashboardProps {
  matchState: MatchState;
  onClearReport: () => void;
}

const StatCard: React.FC<{ title: string; teamAValue: string | number; teamBValue: string | number }> = ({ title, teamAValue, teamBValue }) => (
  <div className="bg-dark-surface p-4 rounded-lg text-center">
    <div className="text-dark-text-secondary text-sm">{title}</div>
    <div className="flex justify-between items-center mt-2">
      <div className="text-xl font-bold text-dark-text w-1/3">{teamAValue}</div>
      <div className="w-1/3"></div>
      <div className="text-xl font-bold text-dark-text w-1/3">{teamBValue}</div>
    </div>
  </div>
);

const EventRow: React.FC<{ event: GameEvent, t: (key: string) => string }> = ({ event, t }) => {
    let icon = '⚽';
    let color = 'text-brand-green';
    let eventName = event.type;
    let details = event.playerName;

    switch(event.type) {
        case GameEventType.YellowCard:
            icon = '🟨';
            color = 'text-brand-yellow';
            eventName = t('yellowCards');
            break;
        case GameEventType.RedCard:
            icon = '🟥';
            color = 'text-brand-red';
            eventName = t('redCards');
            break;
        case GameEventType.Substitution:
            icon = '🔄';
            color = 'text-brand-blue';
            eventName = t('substitutions');
            details = t('subEvent').replace('{relatedPlayerName}', event.relatedPlayerName!).replace('{playerName}', event.playerName);
            break;
        default:
             eventName = t('goals');
    }

    return (
        <div className="flex items-center gap-4 py-2 border-b border-dark-surface">
            <span className="font-mono text-dark-text-secondary">{event.time}</span>
            <span className={`text-2xl ${color}`}>{icon}</span>
            <div className="flex-grow">
                <p className="font-semibold text-dark-text">{eventName}</p>
                <p className="text-sm text-dark-text-secondary">
                    {event.teamName} - {details}
                </p>
            </div>
        </div>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ matchState, onClearReport }) => {
  const { teamA, teamB, events } = matchState;
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const { t } = useLanguage();

  const getCardCount = (team: Team, cardType: 'yellow' | 'red') => {
    if (cardType === 'yellow') {
        return team.players.reduce((acc, p) => acc + p.yellowCards, 0);
    }
    return team.players.filter(p => p.redCard).length;
  };

  const handleSaveReport = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    const checkPageBreak = () => {
        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(t('matchReport'), doc.internal.pageSize.width / 2, y, { align: 'center' });
    y += lineHeight * 2;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const finalScoreText = `${t('finalScore')}: ${teamA.name} ${teamA.score} - ${teamB.score} ${teamB.name}`;
    doc.text(finalScoreText, doc.internal.pageSize.width / 2, y, { align: 'center' });
    y += lineHeight * 3;

    const addTeamSection = (team: Team) => {
        checkPageBreak();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`--- ${team.name.toUpperCase()} ---`, margin, y);
        y += lineHeight * 2;
        
        const addEventCategory = (titleKey: string, type: GameEventType) => {
            checkPageBreak();
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(t(titleKey), margin, y);
            y += lineHeight;
            doc.setFont('helvetica', 'normal');
            const teamEvents = events.filter(e => e.type === type && e.teamName === team.name);
            if (teamEvents.length === 0) {
                doc.text(`  ${t('noSubstitutions')}`, margin, y);
                y += lineHeight;
            } else {
                teamEvents.forEach(e => {
                    checkPageBreak();
                    doc.text(`  - ${e.playerName} at ${e.time}`, margin, y);
                    y += lineHeight;
                });
            }
            y += lineHeight;
        };

        addEventCategory('goals', GameEventType.Goal);
        addEventCategory('yellowCards', GameEventType.YellowCard);
        addEventCategory('redCards', GameEventType.RedCard);
        
        checkPageBreak();
        doc.setFont('helvetica', 'bold');
        doc.text(t('substitutions'), margin, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        const subs = events.filter(e => e.type === GameEventType.Substitution && e.teamName === team.name);
         if (subs.length === 0) {
            doc.text(`  ${t('noSubstitutions')}`, margin, y);
            y += lineHeight;
        } else {
            subs.forEach(e => {
                checkPageBreak();
                const subText = t('subEvent').replace('{relatedPlayerName}', e.relatedPlayerName!).replace('{playerName}', e.playerName);
                doc.text(`  - ${subText} at ${e.time}`, margin, y);
                y += lineHeight;
            });
        }
        y += lineHeight * 2;
    };
    
    addTeamSection(teamA);
    addTeamSection(teamB);
    
    checkPageBreak();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`--- ${t('matchTimeline').toUpperCase()} ---`, margin, y);
    y += lineHeight * 2;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    [...events].reverse().forEach(e => {
        checkPageBreak();
        let eventString = `${e.time} | ${e.teamName} | ${e.type}: ${e.playerName}`;
        if (e.type === GameEventType.Substitution) {
            eventString = `${e.time} | ${e.teamName} | ${e.type}: ${t('subEvent').replace('{relatedPlayerName}', e.relatedPlayerName!).replace('{playerName}', e.playerName)}`;
        }
        doc.text(eventString, margin, y);
        y += 5;
    });

    doc.save(`report_${teamA.name.replace(' ', '_')}_vs_${teamB.name.replace(' ', '_')}.pdf`);
  };


  return (
    <div className="p-4 md:p-6 text-dark-text h-full overflow-y-auto">
       <style>{`
        .btn-action {
          padding: 8px 12px;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.2s, opacity 0.2s;
          font-size: 0.875rem;
        }
       `}</style>
      <header className="bg-dark-card p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex items-center justify-around">
          <div className="flex items-center gap-4">
            <img src={teamA.flag || 'https://picsum.photos/60'} alt={`${teamA.name} flag`} className="w-16 h-16 rounded-full object-cover" />
            <h2 className="text-3xl font-bold">{teamA.name}</h2>
          </div>
          <div className="text-6xl font-bold px-8">
            {teamA.score} - {teamB.score}
          </div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">{teamB.name}</h2>
            <img src={teamB.flag || 'https://picsum.photos/60'} alt={`${teamB.name} flag`} className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title={t('goals')} teamAValue={teamA.score} teamBValue={teamB.score} />
        <StatCard title={t('yellowCards')} teamAValue={getCardCount(teamA, 'yellow')} teamBValue={getCardCount(teamB, 'yellow')} />
        <StatCard title={t('redCards')} teamAValue={getCardCount(teamA, 'red')} teamBValue={getCardCount(teamB, 'red')} />
      </div>

      <div className="bg-dark-card p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-dark-surface pb-2 gap-4">
            <h3 className="text-xl font-bold">{t('matchTimeline')}</h3>
            <div className="flex gap-3">
                <button onClick={handleSaveReport} className="btn-action bg-brand-blue hover:bg-blue-700 flex items-center gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    {t('saveReport')}
                </button>
                <button onClick={() => setIsClearModalOpen(true)} className="btn-action bg-brand-red hover:bg-red-700 flex items-center gap-2">
                    <TrashIcon className="h-4 w-4" />
                    {t('clearReport')}
                </button>
            </div>
        </div>
        <div className="max-h-96 overflow-y-auto pr-2">
            {events.length > 0 ? (
                events.map(event => <EventRow key={event.id} event={event} t={t} />)
            ) : (
                <p className="text-dark-text-secondary text-center py-8">{t('noEvents')}</p>
            )}
        </div>
      </div>
      
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card p-6 rounded-lg w-full max-w-md shadow-2xl text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
                    <AlertTriangleIcon className="h-6 w-6 text-brand-red" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('clearMatchDataTitle')}</h3>
                <p className="text-sm text-dark-text-secondary mb-6">
                    {t('clearMatchDataBody')}
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setIsClearModalOpen(false)}
                        className="px-6 py-2 rounded-md bg-dark-surface hover:bg-gray-700 text-dark-text transition-colors w-full"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={() => {
                            onClearReport();
                            setIsClearModalOpen(false);
                        }}
                        className="px-6 py-2 rounded-md bg-brand-red hover:bg-red-700 text-white transition-colors w-full"
                    >
                        {t('confirmClear')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
