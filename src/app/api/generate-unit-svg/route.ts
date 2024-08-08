import {NextResponse} from 'next/server'
import {z} from 'zod'
import {Unit} from '@/app/types/Unit'
import {GlobalSettings} from "@/app/types/GlobalSettings";
import {SVGService} from "@/app/services/SVGService";

const RequestSchema = z.object({
    unit: z.custom<Unit>(),
    globalSettings: z.custom<GlobalSettings>()
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {unit, globalSettings} = RequestSchema.parse(body)

        const svgService = new SVGService(globalSettings)
        const svgContent = await svgService.createUnitSvg(unit)

        return NextResponse.json({svg: svgContent})
    } catch (error) {
        console.error('Error generating unit SVG:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({error: 'Invalid input data'}, {status: 400})
        }
        return NextResponse.json({error: 'Failed to generate unit SVG'}, {status: 500})
    }
}