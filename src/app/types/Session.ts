import { GlobalSettings } from "./GlobalSettings";
import { Unit } from "./Unit";

export interface Session {
  id: string;
  name: string;
  rows: Unit[][];
  globalSettings: GlobalSettings;
  lastModified: string;
}
