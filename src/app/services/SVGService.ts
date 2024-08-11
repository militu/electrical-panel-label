import {Unit} from '@/app/types/Unit';
import {JSDOM} from 'jsdom';
import {GlobalSettings} from "@/app/types/GlobalSettings";
import * as fs from 'fs/promises';
import * as path from 'path';

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class SVGService {
    private config: GlobalSettings;
    private currentX: number;
    private currentY: number;
    private rowStartX: number;
    private rowStartY: number;
    private maxX: number;
    private pages: string[];

    constructor(config: GlobalSettings) {
        this.config = config;
        this.currentX = this.config.BORDER_MARGIN;
        this.currentY = this.config.BORDER_MARGIN;
        this.rowStartX = this.config.BORDER_MARGIN;
        this.rowStartY = this.config.BORDER_MARGIN;
        this.maxX = this.config.BORDER_MARGIN;
        this.pages = [];
    }

    /**
     * Creates an SVG for a single unit, mainly used for preview purposes.
     * @param unit The unit to create an SVG for
     * @returns A promise that resolves to the SVG string
     */
    public async createUnitSvg(unit: Unit): Promise<string> {
        const padding = 5
        const unitWidth = this.config.UNIT_WIDTH * unit.size;
        const unitHeight = this.config.UNIT_HEIGHT;
        const viewBoxWidth = this.mmToPixels(unitWidth + padding * 2);
        const viewBoxHeight = this.mmToPixels(unitHeight + padding * 2);

        const svgContent = `
            <svg xmlns="${SVG_NAMESPACE}" version="1.1"
                 viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
                 width="100%" height="100%"
                 preserveAspectRatio="xMidYMid meet">
        `;

        let unitSvg = await this.createUnit(unit, padding, padding);
        unitSvg += this.addCrosses(padding, padding, unitWidth, unitHeight);

        return svgContent + unitSvg + '</svg>';
    }

    /**
     * Creates an SVG containing all units arranged in rows and pages.
     * @param rows An array of arrays, each containing Unit objects
     * @returns A promise that resolves to the complete SVG string
     */
    public async createSvg(rows: Unit[][]): Promise<string> {
        this.pages = [];
        let currentPageContent = '';

        for (const row of rows) {
            for (const unit of row) {
                if (this.needNewRow(unit)) {
                    currentPageContent += this.addRowCrosses();
                    if (this.needNewPage()) {
                        this.finalizePage(currentPageContent);
                        currentPageContent = '';
                    } else {
                        this.startNewRow();
                    }
                }

                // Check again if we need a new page after starting a new row
                if (this.needNewPage()) {
                    this.finalizePage(currentPageContent);
                    currentPageContent = '';
                    this.resetPageCoordinates();
                }

                currentPageContent += await this.addUnit(unit);
            }
            currentPageContent += this.addRowCrosses();
            this.startNewRow();
        }

        if (currentPageContent) {
            this.finalizePage(currentPageContent);
        }

        return this.wrapPagesInSingleSvg();
    }

    /**
     * Adds a unit to the current page and updates coordinates.
     * @param unit The unit to add
     * @returns A promise that resolves to the SVG string for the unit
     */
    private async addUnit(unit: Unit): Promise<string> {
        const unitWidth = this.config.UNIT_WIDTH * unit.size;
        const unitContent = await this.createUnit(unit, this.currentX, this.currentY);

        this.currentX += unitWidth;
        this.maxX = Math.max(this.maxX, this.currentX);

        return unitContent;
    }

    /**
     * Checks if a new row is needed based on the current X position and the unit width.
     * @param unit The unit to be added
     * @returns True if a new row is needed, false otherwise
     */
    private needNewRow(unit: Unit): boolean {
        const unitWidth = this.config.UNIT_WIDTH * unit.size;
        return this.currentX + unitWidth + this.config.BORDER_MARGIN > this.config.PAGE_WIDTH;
    }

    /**
     * Checks if a new page is needed based on the current Y position.
     * @returns True if a new page is needed, false otherwise
     */
    private needNewPage(): boolean {
        return this.currentY + this.config.UNIT_HEIGHT + this.config.BORDER_MARGIN > this.config.PAGE_HEIGHT;
    }

    /**
     * Starts a new row by resetting X coordinate and updating Y coordinate.
     */
    private startNewRow(): void {
        this.currentX = this.config.BORDER_MARGIN;
        this.currentY += this.config.UNIT_HEIGHT + this.config.BORDER_MARGIN;
        this.rowStartX = this.currentX;
        this.rowStartY = this.currentY;
        this.maxX = this.currentX;
    }

    /**
     * Converts millimeters to pixels.
     * @param mm Millimeters to convert
     * @param dpi Dots per inch (default: 96)
     * @returns The equivalent number of pixels
     */
    private mmToPixels(mm: number, dpi: number = 96): number {
        const inches = mm / 25.4;
        return inches * dpi;
    }

    /**
     * Converts pixels to millimeters.
     * @param pixels Pixels to convert
     * @param dpi Dots per inch (default: 96)
     * @returns The equivalent number of millimeters
     */
    private pixelsToMm(pixels: number, dpi: number = 96): number {
        const inches = pixels / dpi;
        return inches * 25.4;
    }

    /**
     * Finalizes the current page by adding it to the pages array and resetting coordinates.
     * @param content The SVG content of the current page
     */
    private finalizePage(content: string): void {
        this.pages.push(content);
        this.resetPageCoordinates();
    }

    /**
     * Wraps all pages in a single SVG document.
     * @returns The complete SVG string containing all pages
     */
    private wrapPagesInSingleSvg(): string {
        const pageWidth = this.config.PAGE_WIDTH;
        const pageHeight = this.config.PAGE_HEIGHT;
        const totalHeight = pageHeight * this.pages.length;

        let svgContent = `<svg xmlns="${SVG_NAMESPACE}" version="1.1" 
        width="${pageWidth}mm" 
        height="${totalHeight}mm" 
        viewBox="0 0 ${this.mmToPixels(pageWidth)} ${this.mmToPixels(totalHeight)}">`;

        this.pages.forEach((page, index) => {
            const yOffset = index * pageHeight;
            svgContent += `<svg y="${yOffset}mm" width="${pageWidth}mm" height="${pageHeight}mm">`;
            svgContent += page;
            svgContent += '</svg>';
        });

        svgContent += '</svg>';
        return svgContent;
    }

    /**
     * Resets the page coordinates to their initial values.
     */
    private resetPageCoordinates(): void {
        this.currentX = this.config.BORDER_MARGIN;
        this.currentY = this.config.BORDER_MARGIN;
        this.rowStartX = this.config.BORDER_MARGIN;
        this.rowStartY = this.config.BORDER_MARGIN;
        this.maxX = this.config.BORDER_MARGIN;
    }

    /**
     * Creates the SVG content for a single unit.
     * @param unit The unit to create
     * @param x The x-coordinate of the unit
     * @param y The y-coordinate of the unit
     * @returns A promise that resolves to the SVG string for the unit
     */
    private async createUnit(unit: Unit, x: number, y: number): Promise<string> {
        const unitWidth = Number(this.config.UNIT_WIDTH * unit.size);
        const unitHeight = Number(this.config.UNIT_HEIGHT);
        const sidebarWidth = Number(unit.sidebar_width);

        let content = '';

        // Top rectangle (white background)
        content += this.addRectangle(x, y, unitWidth, unitHeight / 2, this.config.TOP_COLOR);

        // Logo
        if (unit.logo) {
            content += await this.addLogo(x, y, unitWidth, unitHeight / 2, unit.logo);
        }

        // Bottom rectangle
        content += this.addRectangle(x, y + unitHeight / 2, unitWidth, unitHeight / 2, unit.bottom_color);

        // Sidebar rectangle
        content += this.addRectangle(x, y + unitHeight / 2, unit.sidebar_width, unitHeight / 2, unit.sidebar_color);

        // Text
        const halfWidth = (unitWidth - sidebarWidth) / 2;
        const textX = x + sidebarWidth + halfWidth;

        content += this.addDescription(
            textX,
            y + unitHeight / 2,
            unit.description,
            unitHeight / 2,
            unit.description_color,
            unit.description_font_size
        );

        return content;
    }

    /**
     * Adds a rectangle to the SVG.
     * @param x X-coordinate of the rectangle
     * @param y Y-coordinate of the rectangle
     * @param width Width of the rectangle
     * @param height Height of the rectangle
     * @param fill Fill color of the rectangle
     * @param stroke Stroke color of the rectangle (optional)
     * @returns The SVG string for the rectangle
     */
    private addRectangle(x: number, y: number, width: number, height: number, fill: string, stroke?: string): string {
        return `<rect x="${x}mm" y="${y}mm" width="${width}mm" height="${height}mm" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''} />`;
    }

    /**
     * Adds a logo to the SVG.
     * @param x X-coordinate of the logo container
     * @param y Y-coordinate of the logo container
     * @param containerWidth Width of the logo container
     * @param containerHeight Height of the logo container
     * @param logoName Name of the logo file
     * @returns A promise that resolves to the SVG string for the logo
     */
    private async addLogo(x: number, y: number, containerWidth: number, containerHeight: number, logoName: string): Promise<string> {
        try {
            const logoWidth = Math.min(containerWidth, containerHeight) * 0.95;
            const logoHeight = logoWidth;
            const logoX = x + (containerWidth - logoWidth) / 2;
            const logoY = y + (containerHeight - logoHeight) / 2;

            const svgContent = await this.fetchSvgContent(logoName);
            return this.resizeAndPositionPixelSvg(svgContent, logoWidth, logoHeight, logoX, logoY);
        } catch (error) {
            console.error(`Error loading logo '${logoName}':`, error);
            return '';
        }
    }

    /**
     * Fetches the content of an SVG file.
     * @param iconName Name of the icon file
     * @returns A promise that resolves to the content of the SVG file
     */
    private async fetchSvgContent(iconName: string): Promise<string> {
        const filePath = path.join(process.cwd(), 'public', 'icons', `${iconName}.svg`);
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * Resizes and positions an SVG element.
     * @param svgContent The original SVG content
     * @param widthMm Desired width in millimeters
     * @param heightMm Desired height in millimeters
     * @param xMm X-coordinate in millimeters
     * @param yMm Y-coordinate in millimeters
     * @returns The resized and positioned SVG string
     */
    private resizeAndPositionPixelSvg(svgContent: string, widthMm: number, heightMm: number, xMm: number, yMm: number): string {
        const dom = new JSDOM();
        const parser = new dom.window.DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        const viewBox = svgElement.getAttribute('viewBox');
        let vbWidth, vbHeight;
        if (viewBox) {
            [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
        } else {
            vbWidth = parseFloat((svgElement.getAttribute('width') || '50').replace('px', ''));
            vbHeight = parseFloat((svgElement.getAttribute('height') || '50').replace('px', ''));
        }

        const scaleX = this.mmToPixels(widthMm) / vbWidth;
        const scaleY = this.mmToPixels(heightMm) / vbHeight;
        const scale = Math.min(scaleX, scaleY);

        const transform = `translate(${this.mmToPixels(xMm)},${this.mmToPixels(yMm)}) scale(${scale})`;
        return `<g transform="${transform}">${svgElement.innerHTML}</g>`;
    }

    /**
     * Adds description text to the SVG.
     * @param x X-coordinate of the text
     * @param y Y-coordinate of the text
     * @param text The description text
     * @param containerHeight Height of the container
     * @param fill Fill color of the text
     * @param fontSize Font size of the text
     * @returns The SVG string for the description text
     */
    private addDescription(x: number, y: number, text: string, containerHeight: number, fill: string, fontSize: number): string {
        const lines = text.split('\n');
        const lineHeight = this.pixelsToMm(fontSize * 1.2);
        const fontSizeMm = this.pixelsToMm(fontSize);

        return `
        <text x="${x}mm" y="${y + containerHeight / 2}mm" 
              font-size="${fontSizeMm}mm"
              text-anchor="middle"
              dominant-baseline="middle"
              font-weight="bold"
              font-family="Arial,sans-serif"
              fill="${fill}">
            ${lines.map((line, index) =>
            `<tspan x="${x}mm" dy="${index === 0 ? 0 : lineHeight}mm">${this.escapeXml(line.trim())}</tspan>`
        ).join('')}
        </text>
    `;
    }

    /**
     * Escapes special XML characters in a string.
     * @param unsafe The string to escape
     * @returns The escaped string
     */
    private escapeXml(unsafe: string): string {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case "'":
                    return '&apos;';
                case '"':
                    return '&quot;';
            }
            return c;
        });
    }

    /**
     * Adds crosses to mark the corners of a row.
     * @returns The SVG string for the row crosses
     */
    private addRowCrosses(): string {
        return this.addCrosses(this.rowStartX, this.rowStartY, this.maxX - this.rowStartX, this.config.UNIT_HEIGHT);
    }

    /**
     * Adds crosses to mark the corners of a rectangle.
     * @param x X-coordinate of the top-left corner
     * @param y Y-coordinate of the top-left corner
     * @param width Width of the rectangle
     * @param height Height of the rectangle
     * @returns The SVG string for the crosses
     */
    private addCrosses(x: number, y: number, width: number, height: number): string {
        return this.addCross(x, y) +
            this.addCross(x, y + height) +
            this.addCross(x + width, y) +
            this.addCross(x + width, y + height);
    }

    /**
     * Adds a single cross mark.
     * @param x X-coordinate of the cross center
     * @param y Y-coordinate of the cross center
     * @returns The SVG string for the cross
     */
    private addCross(x: number, y: number): string {
        const halfSize = this.config.CROSS_SIZE / 2;
        return `<line x1="${x - halfSize}mm" y1="${y}mm" x2="${x + halfSize}mm" y2="${y}mm" stroke="black" stroke-width="0.1mm" />` +
            `<line x1="${x}mm" y1="${y - halfSize}mm" x2="${x}mm" y2="${y + halfSize}mm" stroke="black" stroke-width="0.1mm" />`;
    }
}

export {SVGService};