import { SocketData } from '../app';

abstract class SessionStore {
  findSession(id: string) {}

  saveSession(id: string, session: any) {}

  findAllSessions(): void {}
}

export class InMemorySessionStore extends SessionStore {
  public sessions: Map<string, SocketData>;
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id: string): SocketData | undefined {
    return this.sessions.get(id);
  }

  saveSession(id: string, session: any): void {
    this.sessions.set(id, session);
  }

  findAllSessions(): any[] {
    return [...this.sessions.values()];
  }
}
