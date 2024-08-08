import {Unit} from '@/app/types/Unit';
import {GlobalSettings} from "@/app/types/GlobalSettings";

export async function callGenerateUnitSVG(unit: Unit, globalSettings: GlobalSettings): Promise<string> {
    const response = await fetch('/api/generate-unit-svg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({unit, globalSettings}),
    });

    if (!response.ok) {
        throw new Error('Failed to generate unit SVG');
    }

    const data = await response.json();
    return data.svg;
}

export async function callGenerateFullSVG(rows: Unit[][], globalSettings: GlobalSettings): Promise<string> {
    const response = await fetch('/api/generate-full-svg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({rows, globalSettings}),
    });

    if (!response.ok) {
        throw new Error('Failed to generate full SVG');
    }

    const data = await response.json();
    return data.svg;
}