import {v4 as uuidv4} from 'uuid';
import {Unit} from '@/app/types/Unit';

export class UnitService {
    private defaultUnitValues: Omit<Unit, 'id'> = {
        size: 1,
        description: '',
        description_color: '#000000',
        description_font_size: 15,
        logo: null,
        sidebar_color: '#009e4d',
        sidebar_width: 1,
        bottom_color: '#f0f0f0',
    };

    createUnit(partial?: Partial<Unit>): Unit {
        return {
            ...this.defaultUnitValues,
            id: uuidv4(),
            ...partial
        };
    }

    updateUnit(unit: Unit, updates: Partial<Unit>): Unit {
        return {...unit, ...updates};
    }

    validateUnitSize(size: number): number {
        return Math.min(Math.max(1, size), 18);
    }

    duplicateUnit(unit: Unit): Unit {
        const {id, ...unitWithoutId} = unit;
        return this.createUnit(unitWithoutId);
    }
}