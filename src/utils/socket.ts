import { UserSaveData } from '../types/game';

export interface RemotePlayer {
  id: string;
  name: string;
  avatar: string;
  truckId: string;
  equippedParts: {
    engine: string;
    nitro: string;
    gear: string;
    tires: string;
  };
  isReady: boolean;
  distance: number;
  speed: number;
  cps: number;
  alertness: number;
  nitroActive: boolean;
  finished: boolean;
  finishTime: number | null;
  roundRank: number | null;
  roundScore: number;
  totalScore: number;
  roundsWon: number;
}

export interface MultiplayerRoom {
  code: string;
  currentRound: number;
  status: 'CONFIGURING' | 'COUNTDOWN' | 'RACING' | 'ROUND_PODIUM';
  configTimerRemaining: number;
  countdownSeconds: number;
  raceTargetDistance: number;
  players: Record<string, RemotePlayer>;
  roundWinners: Array<{
    round: number;
    championId: string;
    championName: string;
    championSpeed: number;
    time: number;
  }>;
}

type MessageHandler = (data: any) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: number | null = null;
  public isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notify({ type: 'SOCKET_CONNECTED' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notify(data);
        } catch {}
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notify({ type: 'SOCKET_DISCONNECTED' });
        // Attempt reconnect after 2s
        if (!this.reconnectTimer) {
          this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 2000);
        }
      };

      this.ws.onerror = () => {
        // error handling
      };
    } catch {}
  }

  public subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private notify(data: any) {
    for (const h of this.handlers) {
      h(data);
    }
  }

  public send(type: string, roomCode?: string, payload?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type, roomCode, payload }));
        }
      }, 500);
      return;
    }
    this.ws.send(JSON.stringify({ type, roomCode, payload }));
  }
}

export const socketClient = new SocketClient();
