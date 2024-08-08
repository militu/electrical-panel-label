import {Unit} from './Unit';
import {GlobalSettings} from './GlobalSettings';

export interface Session {
    id: string;
    name: string;
    rows: Unit[][];
    globalSettings: GlobalSettings;
    lastModified: string;
}