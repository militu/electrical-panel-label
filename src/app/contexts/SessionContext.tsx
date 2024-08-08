'use client';

import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {Session} from '@/app/types/Session';
import {Unit} from '@/app/types/Unit';
import {GlobalSettings} from '@/app/types/GlobalSettings';
import {SessionService} from '@/app/services/SessionService';
import {UnitService} from '@/app/services/UnitService';
import {GlobalSettingsService} from '@/app/services/GlobalSettingsService';
import {LocalStorageService} from '@/app/services/LocalStorageService';

interface SessionContextValue {
    sessions: Session[];
    currentSession: Session | null;
    setCurrentSession: (session: Session | null) => void;
    setCurrentSessionByID: (sessionId: string) => void;
    getSessionNameById: (sessionId: string) => string;
    createSession: (name: string) => void;
    updateSession: (updater: (session: Session) => Session) => void;
    deleteSession: (sessionId: string) => void;
    importSession: (sessionData: Session) => void;
    updateGlobalSettings: (settings: GlobalSettings) => void;
    addRow: () => void;
    updateRow: (rowIndex: number, updater: (row: Unit[]) => Unit[]) => void;
    deleteRow: (rowIndex: number) => void;
    duplicateRow: (rowIndex: number) => void;
    addUnit: (rowIndex: number, addCount: number) => void;
    updateUnit: (rowIndex: number, unitId: string, updates: Partial<Unit>) => void;
    updateMultipleUnits: (rowIndex: number, updatedUnits: Unit[]) => void;
    deleteUnit: (rowIndex: number, unitId: string) => void;
    deleteUnits: (rowIndex: number, unitIds: string[]) => void;
    duplicateUnit: (rowIndex: number, unitId: string) => void;
    duplicateUnits: (rowIndex: number, unitIds: string[], count: number) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const localStorageService = useMemo(() => new LocalStorageService(), []);
    const globalSettingsService = useMemo(() => new GlobalSettingsService(), []);
    const unitService = useMemo(() => new UnitService(), []);
    const sessionService = useMemo(() => new SessionService(localStorageService, globalSettingsService, unitService),
        [localStorageService, globalSettingsService, unitService]);

    const [sessions, setSessions] = useState<Session[]>(() => {
        const existingSessions = sessionService.getSessions();
        if (existingSessions.length === 0) {
            const defaultSession = sessionService.createDefaultSession();
            return [defaultSession];
        }
        return existingSessions;
    });

    const [currentSession, setCurrentSession] = useState<Session | null>(() => {
        const currentSessionId = localStorageService.getItem('currentSessionId');
        if (currentSessionId) {
            return sessions.find(s => s.id === currentSessionId) || sessions[0] || null;
        }
        return sessions[0] || null;
    });

    const setCurrentSessionAndPersist = useCallback((session: Session | null) => {
        setCurrentSession(session);
        if (session) {
            localStorageService.setItem('currentSessionId', session.id);
        } else {
            localStorageService.removeItem('currentSessionId');
        }
    }, [localStorageService]);

    const createSession = useCallback((name: string) => {
        const newSession = sessionService.createSession(name);
        setSessions(prev => [...prev, newSession]);
        setCurrentSessionAndPersist(newSession);
    }, [sessionService, setCurrentSessionAndPersist]);

    const updateSession = useCallback((updater: (session: Session) => Session) => {
        if (!currentSession) return;
        const updatedSession = updater(currentSession);
        sessionService.saveSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        setCurrentSessionAndPersist(updatedSession);
    }, [currentSession, sessionService, setCurrentSessionAndPersist]);

    const deleteSession = useCallback((sessionId: string) => {
        sessionService.deleteSession(sessionId);
        setSessions(prev => prev.filter(s => s.id !== sessionId));

        if (currentSession?.id === sessionId) {
            const remainingSessions = sessions.filter(s => s.id !== sessionId);
            if (remainingSessions.length > 0) {
                setCurrentSessionAndPersist(remainingSessions[remainingSessions.length - 1]);
            } else {
                const newDefaultSession = sessionService.createDefaultSession();
                setSessions([newDefaultSession]);
                setCurrentSessionAndPersist(newDefaultSession);
            }
        }
    }, [currentSession, sessions, sessionService, setCurrentSessionAndPersist]);

    const importSession = useCallback((importedSession: Session) => {
        const existingSession = sessions.find(s => s.name === importedSession.name);
        if (existingSession) {
            let newName = importedSession.name;
            let counter = 1;
            while (sessions.some(s => s.name === newName)) {
                newName = `${importedSession.name} (${counter})`;
                counter++;
            }
            importedSession.name = newName;
        }

        const newSession = sessionService.createSession(importedSession.name);
        const updatedSession = {
            ...newSession,
            rows: importedSession.rows,
            globalSettings: importedSession.globalSettings
        };
        sessionService.saveSession(updatedSession);
        setSessions(prev => [...prev, updatedSession]);
        setCurrentSessionAndPersist(updatedSession);
    }, [sessions, sessionService, setCurrentSessionAndPersist]);

    const setCurrentSessionByID = useCallback((sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId) || null;
        setCurrentSessionAndPersist(session);
    }, [setCurrentSessionAndPersist, sessions]);

    const getSessionNameById = (id: string) => {
        const session = sessions.find(s => s.id === id);
        return session ? session.name : '';
    };

    const updateGlobalSettings = useCallback((settings: GlobalSettings) => {
        updateSession(session => ({...session, globalSettings: settings}));
    }, [updateSession]);

    const addRow = useCallback(() => {
        updateSession(session => ({...session, rows: [...session.rows, []]}));
    }, [updateSession]);

    const updateRow = useCallback((rowIndex: number, updater: (row: Unit[]) => Unit[]) => {
        updateSession(session => ({
            ...session,
            rows: session.rows.map((row, index) => index === rowIndex ? updater(row) : row)
        }));
    }, [updateSession]);

    const deleteRow = useCallback((rowIndex: number) => {
        updateSession(session => ({
            ...session,
            rows: session.rows.filter((_, index) => index !== rowIndex)
        }));
    }, [updateSession]);

    const duplicateRow = useCallback((rowIndex: number) => {
        updateSession(session => {
            const rowToDuplicate = session.rows[rowIndex];
            console.log(rowToDuplicate);
            if (!rowToDuplicate) return session;

            const duplicatedRow = rowToDuplicate.map(unit => unitService.duplicateUnit(unit));
            const newRows = [...session.rows];
            newRows.splice(rowIndex + 1, 0, duplicatedRow);

            return {...session, rows: newRows};
        });
    }, [updateSession, unitService]);

    const addUnit = useCallback((rowIndex: number, addCount: number) => {
        updateRow(rowIndex, row => {
            const newUnits = Array.from({length: addCount}, () => unitService.createUnit());
            return [...row, ...newUnits];
        });
    }, [updateRow, unitService]);

    const updateUnit = useCallback((rowIndex: number, unitId: string, updates: Partial<Unit>) => {
        updateRow(rowIndex, row => row.map(unit =>
            unit.id === unitId ? unitService.updateUnit(unit, updates) : unit
        ));
    }, [updateRow, unitService]);

    const updateMultipleUnits = useCallback((rowIndex: number, updatedUnits: Unit[]) => {
        updateSession(session => {
            const newRows = [...session.rows];
            newRows[rowIndex] = newRows[rowIndex].map(unit => {
                const updatedUnit = updatedUnits.find(u => u.id === unit.id);
                return updatedUnit ? {...unit, ...updatedUnit} : unit;
            });
            return {...session, rows: newRows};
        });
    }, [updateSession]);

    const deleteUnit = useCallback((rowIndex: number, unitId: string) => {
        updateRow(rowIndex, row => row.filter(unit => unit.id !== unitId));
    }, [updateRow]);

    const deleteUnits = useCallback((rowIndex: number, unitIds: string[]) => {
        updateRow(rowIndex, row => row.filter(unit => !unitIds.includes(unit.id)));
    }, [updateRow]);

    const duplicateUnit = useCallback((rowIndex: number, unitId: string) => {
        updateRow(rowIndex, row => {
            const unitToDuplicate = row.find(unit => unit.id === unitId);
            if (!unitToDuplicate) return row;
            const duplicatedUnit = unitService.duplicateUnit(unitToDuplicate);
            return [...row, duplicatedUnit];
        });
    }, [updateRow, unitService]);

    const duplicateUnits = useCallback((rowIndex: number, unitIds: string[], count: number) => {
        updateRow(rowIndex, row => {
            const unitsToDuplicate = unitIds.map(unitId => row.find(unit => unit.id === unitId)).filter(Boolean);
            const newUnits = Array.from({length: count}, () =>
                unitsToDuplicate.map(unit => unitService.duplicateUnit(unit as Unit))
            ).flat();
            return [...row, ...newUnits];
        });
    }, [updateRow, unitService]);

    const contextValue: SessionContextValue = {
        sessions,
        currentSession,
        setCurrentSession,
        setCurrentSessionByID,
        getSessionNameById,
        createSession,
        updateSession,
        deleteSession,
        importSession,
        updateGlobalSettings,
        addRow,
        updateRow,
        deleteRow,
        duplicateRow,
        addUnit,
        updateUnit,
        updateMultipleUnits,
        duplicateUnit,
        duplicateUnits,
        deleteUnits,
        deleteUnit,
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = (): SessionContextValue => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};