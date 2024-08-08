import {v4 as uuidv4} from 'uuid';
import {Session} from '@/app/types/Session';
import {LocalStorageService} from './LocalStorageService';
import {GlobalSettingsService} from "@/app/services/GlobalSettingsService";
import {UnitService} from "@/app/services/UnitService";

export class SessionService {
    constructor(
        private localStorageService: LocalStorageService,
        private globalSettingsService: GlobalSettingsService,
        private unitService: UnitService
    ) {
    }

    getSessions(): Session[] {
        return this.localStorageService.getItem<Session[]>('sessions') || [];
    }

    saveSession(session: Session): void {
        const sessions = this.getSessions();
        const index = sessions.findIndex(s => s.id === session.id);
        if (index >= 0) {
            sessions[index] = session;
        } else {
            sessions.push(session);
        }
        this.localStorageService.setItem('sessions', sessions);
    }

    deleteSession(sessionId: string): void {
        const sessions = this.getSessions().filter(s => s.id !== sessionId);
        this.localStorageService.setItem('sessions', sessions);
    }

    createSession(name: string): Session {
        const newSession: Session = {
            id: uuidv4(),
            name,
            rows: [],
            globalSettings: this.globalSettingsService.getDefaultSettings(),
            lastModified: new Date().toISOString(),
        };
        this.saveSession(newSession);
        return newSession;
    }

    createDefaultSession(): Session {
        const newSession: Session = {
            id: uuidv4(),
            name: "Default Session",
            rows: [[
                this.unitService.createUnit(),
                this.unitService.createUnit(),
                this.unitService.createUnit()
            ]],
            globalSettings: this.globalSettingsService.getDefaultSettings(),
            lastModified: new Date().toISOString(),
        };
        this.saveSession(newSession);
        return newSession;
    }
}