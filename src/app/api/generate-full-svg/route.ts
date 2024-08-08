import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Unit } from '@/app/types/Unit'
import {GlobalSettings} from "@/app/types/GlobalSettings";
import {SVGService} from "@/app/services/SVGService";

const RequestSchema = z.object({
    rows: z.array(z.array(z.custom<Unit>())),
    globalSettings: z.custom<GlobalSettings>()
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { rows, globalSettings } = RequestSchema.parse(body)

        const svgService = new SVGService(globalSettings)
        const svgContent = await svgService.createSvg(rows)

        return NextResponse.json({ svg: svgContent })
    } catch (error) {
        console.error('Error generating SVG:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to generate SVG' }, { status: 500 })
    }
}