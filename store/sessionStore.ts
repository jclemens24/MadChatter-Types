import { SocketData } from '../app';

abstract class SessionStore {
  findSession(id: string) {}

  saveSession(id: string, session: SocketData) {}

  findAllSessions(): void {}
}

export class InMemorySessionStore extends SessionStore {
  public sessions: Map<string, SocketData>;
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id: string): SocketData | undefined {
    if (this.sessions.has(id)) {
      return this.sessions.get(id);
    } else {
      return undefined;
    }
  }

  saveSession(id: string, session: SocketData): void {
    this.sessions.set(id, session);
  }

  findAllSessions(): SocketData[] {
    return [...this.sessions.values()];
  }
}
