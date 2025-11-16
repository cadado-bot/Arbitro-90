export enum PlayerPosition {
  Goalkeeper = 'G',
  Defender = 'D',
  Midfielder = 'M',
  Forward = 'A',
}

export interface Player {
  id: number;
  name: string;
  number: number;
  position: PlayerPosition;
  goals: number;
  yellowCards: number;
  redCard: boolean;
  isStarter: boolean;
}

export interface Team {
  name: string;
  flag: string | null;
  players: Player[];
  score: number;
}

export enum GameEventType {
  Goal = 'GOL',
  YellowCard = 'CARTÃO AMARELO',
  RedCard = 'CARTÃO VERMELHO',
  Substitution = 'SUBSTITUIÇÃO',
}

export interface GameEvent {
  id: number;
  type: GameEventType;
  teamName: string;
  playerName: string;
  relatedPlayerName?: string; // For substitutions
  time: string; // MM:SS format
}

export interface MatchState {
  teamA: Team;
  teamB: Team;
  events: GameEvent[];
}