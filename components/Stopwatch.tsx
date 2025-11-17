
import React, { useState } from 'react';
import { PlayIcon, PauseIcon, RefreshIcon, PlusIcon } from './icons';
import { useLanguage } from '../LanguageContext';

interface StopwatchProps {
  time: number;
  totalTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSetTotalTime: (minutes: number) => void;
  onAddTime: (minutes: number) => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({ time, totalTime, isRunning, onStart, onStop, onReset, onSetTotalTime, onAddTime }) => {
  const [extraTimeInput, setExtraTimeInput] = useState('');
  const { t } = useLanguage();

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleAddExtraTime = () => {
    const minutes = parseInt(extraTimeInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onAddTime(minutes);
      setExtraTimeInput('');
    }
  };

  const remainingTime = Math.max(0, totalTime - time);

  const buttonBaseClasses = "flex items-center justify-center w-20 h-20 text-white rounded-full shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:bg-gray-600";
  const activeClasses = "hover:scale-105";

  return (
    <div className="flex flex-col items-center justify-between p-8 bg-dark-card rounded-lg shadow-2xl h-full">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="total-time" className="block text-sm font-medium text-dark-text-secondary mb-1">{t('totalTime')}</label>
            <input
              id="total-time"
              type="number"
              value={totalTime / 60}
              onChange={(e) => onSetTotalTime(parseInt(e.target.value, 10) || 0)}
              disabled={time > 0}
              className="input-field w-full disabled:bg-dark-bg disabled:text-dark-text-secondary"
              aria-label={t('totalTime')}
            />
          </div>
          <div className="flex-1">
             <label htmlFor="extra-time" className="block text-sm font-medium text-dark-text-secondary mb-1">{t('addExtraTime')}</label>
            <div className="flex gap-2">
              <input
                id="extra-time"
                type="number"
                value={extraTimeInput}
                onChange={(e) => setExtraTimeInput(e.target.value)}
                placeholder={t('addExtraTimePlaceholder')}
                className="input-field w-full"
              />
              <button onClick={handleAddExtraTime} className="btn-icon bg-brand-blue hover:bg-blue-700 px-4" aria-label={t('addExtraTimeButton')}>
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center my-6">
        <div className="text-8xl md:text-9xl font-mono text-dark-text tracking-widest p-4 rounded-lg bg-dark-surface shadow-inner">
          {formatTime(remainingTime)}
        </div>
        <div className="mt-2 text-xl text-dark-text-secondary font-mono">
          {t('elapsedTime')}: {formatTime(time)}
        </div>
      </div>

      <div className="flex space-x-4 md:space-x-6">
        <button
          onClick={onStart}
          className={`${buttonBaseClasses} bg-brand-green ${!isRunning ? activeClasses : ''} hover:bg-green-600 focus:ring-green-500`}
          aria-label="Start/Resume Timer"
          disabled={isRunning}
        >
          <PlayIcon className="h-10 w-10" />
        </button>
        
        <button
          onClick={onStop}
          className={`${buttonBaseClasses} bg-brand-yellow ${isRunning ? activeClasses : ''} hover:bg-yellow-600 focus:ring-yellow-500`}
          aria-label="Pause Timer"
          disabled={!isRunning}
        >
          <PauseIcon className="h-10 w-10" />
        </button>
        
        <button
          onClick={onReset}
          className={`${buttonBaseClasses} bg-brand-red ${time > 0 ? activeClasses : ''} hover:bg-red-600 focus:ring-red-500`}
          aria-label="Reset Timer"
          disabled={time === 0}
        >
          <RefreshIcon className="h-10 w-10" />
        </button>
      </div>
      <style>{`
        .input-field {
          background-color: #1e1e1e;
          border: 1px solid #3a3a3a;
          color: #e0e0e0;
          padding: 8px 12px;
          border-radius: 6px;
          transition: border-color 0.2s, box-shadow 0.2s;
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
      `}</style>
    </div>
  );
};

export default Stopwatch;
