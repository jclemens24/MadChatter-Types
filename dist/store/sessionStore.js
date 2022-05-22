"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySessionStore = void 0;
class SessionStore {
    findSession(id) { }
    saveSession(id, session) { }
    findAllSessions() { }
}
class InMemorySessionStore extends SessionStore {
    constructor() {
        super();
        this.sessions = new Map();
    }
    findSession(id) {
        if (this.sessions.has(id)) {
            return this.sessions.get(id);
        }
        else {
            return undefined;
        }
    }
    saveSession(id, session) {
        this.sessions.set(id, session);
    }
    findAllSessions() {
        return [...this.sessions.values()];
    }
}
exports.InMemorySessionStore = InMemorySessionStore;
//# sourceMappingURL=sessionStore.js.map