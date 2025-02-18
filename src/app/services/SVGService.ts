// src/app/services/SVGService.ts

import { GlobalSettings } from "@/app/types/GlobalSettings";
import { Unit } from "@/app/types/Unit";
import * as fs from "fs/promises";
import * as path from "path";
import { Config, optimize } from "svgo";
import { XastElement, XastParent } from "svgo/lib/types";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class SVGService {
  private config: GlobalSettings;
  private currentX: number;
  private currentY: number;
  private rowStartX: number;
  private rowStartY: number;
  private maxX: number;
  private pages: string[];

  // SVGO configuration

  private svgoConfig: Config = {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      {
        name: "convertStyleToAttrs",
      },
      {
        name: "removeUselessStrokeAndFill",
        params: {
          removeNone: false,
        },
      },
      {
        name: "convertColors",
        params: {
          currentColor: true,
          names2hex: false,
          rgb2hex: true,
          shorthex: false,
        },
      },
      {
        name: "cleanupIds",
        params: {
          remove: false,
        },
      },
      {
        name: "prefixIds",
        params: {
          prefix: false,
        },
      },
      {
        name: "customAttributeInheritance",
        fn: () => ({
          element: {
            enter: (node: XastElement, parentNode: XastParent) => {
              if (node.type === "element") {
                const parent = parentNode as XastElement;
                if (parent?.type === "element" && parent.attributes?.stroke) {
                  if (!node.attributes.stroke) {
                    node.attributes.stroke = parent.attributes.stroke;
                  }
                  if (
                    !node.attributes["stroke-width"] &&
                    parent.attributes["stroke-width"]
                  ) {
                    node.attributes["stroke-width"] =
                      parent.attributes["stroke-width"];
                  }
                  if (
                    !node.attributes["stroke-linecap"] &&
                    parent.attributes["stroke-linecap"]
                  ) {
                    node.attributes["stroke-linecap"] =
                      parent.attributes["stroke-linecap"];
                  }
                  if (
                    !node.attributes["stroke-linejoin"] &&
                    parent.attributes["stroke-linejoin"]
                  ) {
                    node.attributes["stroke-linejoin"] =
                      parent.attributes["stroke-linejoin"];
                  }
                }

                // Preserve fill="none" when it's set in parent
                if (
                  parent?.type === "element" &&
                  parent.attributes?.fill === "none"
                ) {
                  if (!node.attributes.fill) {
                    node.attributes.fill = "none";
                  }
                }
              }
            },
          },
        }),
      },
    ],
  };

  /**
   * Constructs an SVGService instance.
   * @param config The global settings object.
   */
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
   * Optimizes an SVG string using SVGO.
   * @param svgContent The SVG content to optimize.
   * @returns A promise that resolves to the optimized SVG string.
   */
  private async optimizeSvg(svgContent: string): Promise<string> {
    try {
      const result = optimize(svgContent, this.svgoConfig);
      return result.data;
    } catch (error) {
      console.error("Error optimizing SVG:", error);
      return svgContent;
    }
  }

  /**
   * Converts millimeters to pixels.
   * @param mm The value in millimeters.
   * @param dpi The DPI value (default: 96).
   * @returns The equivalent value in pixels.
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
   * Transforms an SVG string by scaling and positioning it.
   * @param svgContent The SVG content to transform.
   * @param widthMm The target width in millimeters.
   * @param heightMm The target height in millimeters.
   * @param xMm The target x position in millimeters.
   * @param yMm The target y position in millimeters.
   * @returns A promise that resolves to the transformed SVG string.
   */
  private async transformSvg(
    svgContent: string,
    widthMm: number,
    heightMm: number,
    xMm: number,
    yMm: number
  ): Promise<string> {
    try {
      // First optimize the SVG
      const optimizedSvg = await this.optimizeSvg(svgContent);

      // Extract viewBox from optimized SVG
      const viewBoxMatch = optimizedSvg.match(/viewBox=["']([^"']+)["']/);
      let vbWidth, vbHeight;
      let vbX = 0,
        vbY = 0;

      if (viewBoxMatch) {
        const [x, y, w, h] = viewBoxMatch[1].split(/\s+/).map(Number);
        vbX = x || 0;
        vbY = y || 0;
        vbWidth = w;
        vbHeight = h;
      } else {
        // Default values if no viewBox found
        vbWidth = parseFloat(
          (svgContent.match(/width=["']([^"']+)["']/) || ["", "50"])[1].replace(
            /[^\d.]/g,
            ""
          )
        );
        vbHeight = parseFloat(
          (svgContent.match(/height=["']([^"']+)["']/) || [
            "",
            "50",
          ])[1].replace(/[^\d.]/g, "")
        );
      }

      // Calculate scale to fit the target dimensions while maintaining aspect ratio
      const scaleX = this.mmToPixels(widthMm) / vbWidth;
      const scaleY = this.mmToPixels(heightMm) / vbHeight;
      const scale = Math.min(scaleX, scaleY);

      // Calculate centering offsets
      const scaledWidth = vbWidth * scale;
      const scaledHeight = vbHeight * scale;
      const xOffset =
        this.mmToPixels(xMm) + (this.mmToPixels(widthMm) - scaledWidth) / 2;
      const yOffset =
        this.mmToPixels(yMm) + (this.mmToPixels(heightMm) - scaledHeight) / 2;

      // Extract the inner content of the SVG
      const contentMatch = optimizedSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      const innerContent = contentMatch ? contentMatch[1] : optimizedSvg;

      // Create new transformed SVG with proper positioning and scaling
      const transform = `translate(${xOffset},${yOffset}) scale(${scale})`;
      if (vbX !== 0 || vbY !== 0) {
        // If the original SVG had a non-zero viewBox origin, compensate for it
        return `<g transform="${transform} translate(${-vbX},${-vbY})">${innerContent}</g>`;
      }
      return `<g transform="${transform}">${innerContent}</g>`;
    } catch (error) {
      console.error("Error transforming SVG:", error);
      return "";
    }
  }
  /**
   * Creates an SVG for a single unit, mainly used for preview purposes.
   * @param unit The unit to create the SVG for.
   * @returns A promise that resolves to the SVG string.
   */
  public async createUnitSvg(unit: Unit): Promise<string> {
    const padding = 5;
    const unitWidth = this.config.UNIT_WIDTH * unit.size;
    const unitHeight = this.config.UNIT_HEIGHT;
    const viewBoxWidth = this.mmToPixels(unitWidth + padding * 2);
    const viewBoxHeight = this.mmToPixels(unitHeight + padding * 2);
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
           viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
           width="100%" height="100%"
           preserveAspectRatio="xMidYMid meet">
    `;

    const unitSvg = await this.createUnit(unit, padding, padding);
    const crosses = this.addCrosses(padding, padding, unitWidth, unitHeight);

    return svgContent + unitSvg + crosses + "</svg>";
  }

  /**
   * Creates an SVG containing all units arranged in rows and pages.
   * @param rows An array of arrays, each containing Unit objects.
   * @returns A promise that resolves to the complete SVG string.
   */
  public async createSvg(rows: Unit[][]): Promise<string> {
    this.pages = [];
    let currentPageContent = "";

    for (const row of rows) {
      for (const unit of row) {
        if (this.needNewRow(unit)) {
          currentPageContent += this.addRowCrosses();
          if (this.needNewPage()) {
            this.finalizePage(currentPageContent);
            currentPageContent = "";
          } else {
            this.startNewRow();
          }
        }

        // Check again if we need a new page after starting a new row
        if (this.needNewPage()) {
          this.finalizePage(currentPageContent);
          currentPageContent = "";
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
   * @param unit The unit to add.
   * @returns A promise that resolves to the SVG string for the unit.
   */
  private async addUnit(unit: Unit): Promise<string> {
    const unitWidth = this.config.UNIT_WIDTH * unit.size;
    const unitContent = await this.createUnit(
      unit,
      this.currentX,
      this.currentY
    );

    this.currentX += unitWidth;
    this.maxX = Math.max(this.maxX, this.currentX);

    return unitContent;
  }

  /**
   * Checks if a new row is needed based on the current X position and the unit width.
   * @param unit The unit to be added.
   * @returns True if a new row is needed, false otherwise.
   */
  private needNewRow(unit: Unit): boolean {
    const unitWidth = this.config.UNIT_WIDTH * unit.size;
    return (
      this.currentX + unitWidth + this.config.BORDER_MARGIN >
      this.config.PAGE_WIDTH
    );
  }

  /**
   * Checks if a new page is needed based on the current Y position.
   * @returns True if a new page is needed, false otherwise.
   */
  private needNewPage(): boolean {
    return (
      this.currentY + this.config.UNIT_HEIGHT + this.config.BORDER_MARGIN >
      this.config.PAGE_HEIGHT
    );
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
   * Finalizes the current page by adding it to the pages array and resetting coordinates.
   * @param content The SVG content of the current page.
   */
  private finalizePage(content: string): void {
    this.pages.push(content);
    this.resetPageCoordinates();
  }

  /**
   * Wraps all pages in a single SVG document.
   * @returns The complete SVG string containing all pages.
   */
  private wrapPagesInSingleSvg(): string {
    const pageWidth = this.config.PAGE_WIDTH;
    const pageHeight = this.config.PAGE_HEIGHT;
    const totalHeight = pageHeight * this.pages.length;

    let svgContent = `<svg xmlns="${SVG_NAMESPACE}" version="1.1" 
        width="${pageWidth}mm" 
        height="${totalHeight}mm" 
        viewBox="0 0 ${this.mmToPixels(pageWidth)} ${this.mmToPixels(
      totalHeight
    )}">`;

    this.pages.forEach((page, index) => {
      const yOffset = index * pageHeight;
      svgContent += `<svg y="${yOffset}mm" width="${pageWidth}mm" height="${pageHeight}mm">`;
      svgContent += page;
      svgContent += "</svg>";
    });

    svgContent += "</svg>";
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
   * @param unit The unit to create the SVG for.
   * @param x The x coordinate of the unit.
   * @param y The y coordinate of the unit.
   * @returns A promise that resolves to the SVG string for the unit.
   */
  private async createUnit(unit: Unit, x: number, y: number): Promise<string> {
    const unitWidth = Number(this.config.UNIT_WIDTH * unit.size);
    const unitHeight = Number(this.config.UNIT_HEIGHT);
    const sidebarWidth = Number(unit.sidebar_width);

    let content = "";

    // Top rectangle (white background)
    content += this.addRectangle(
      x,
      y,
      unitWidth,
      unitHeight / 2,
      this.config.TOP_COLOR
    );

    // Logo
    if (unit.logo) {
      content += await this.addLogo(
        x,
        y,
        unitWidth,
        unitHeight / 2,
        unit.logo,
        unit.logoData
      );
    }

    // Bottom half
    const bottomY = y + unitHeight / 2;
    content += this.addRectangle(
      x,
      bottomY,
      unitWidth,
      unitHeight / 2,
      unit.bottom_color
    );

    content += this.addRectangle(
      x,
      bottomY,
      sidebarWidth,
      unitHeight / 2,
      unit.sidebar_color
    );

    // Text area dimensions
    const textAreaWidth = unitWidth - sidebarWidth;
    const textAreaX = x + sidebarWidth;
    const textAreaHeight = unitHeight / 2;

    // Center text in available space
    content += this.addDescription(
      textAreaX + textAreaWidth / 2, // Center of available width
      bottomY, // Start of bottom rectangle
      unit.description,
      textAreaHeight, // Height of bottom rectangle
      unit.description_color,
      unit.description_font_size
    );

    return content;
  }

  /**
   * Calculates text measurements and positioning
   * @param text The text to measure
   * @param fontSize Font size in pixels
   * @returns Object with text measurements and position
   */
  private calculateTextMetrics(text: string, fontSize: number) {
    const lines = text.split("\n");
    const fontSizeMm = this.pixelsToMm(fontSize);
    // Scale line height based on font size - using standard typographic ratio
    const lineHeight = fontSizeMm * 1.2;

    return {
      lines,
      fontSizeMm,
      lineHeight,
    };
  }

  /**
   * Adds a rectangle to the SVG content.
   * @param x The x coordinate of the rectangle.
   * @param y The y coordinate of the rectangle.
   * @param width The width of the rectangle.
   * @param height The height of the rectangle.
   * @param fill The fill color of the rectangle.
   * @param stroke The stroke color of the rectangle (optional).
   * @returns The SVG string for the rectangle.
   */
  private addRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    stroke?: string
  ): string {
    return `<rect x="${x}mm" y="${y}mm" width="${width}mm" height="${height}mm" fill="${fill}"${
      stroke ? ` stroke="${stroke}"` : ""
    } />`;
  }

  /**
   * Adds a logo to the SVG content.
   * @param x The x coordinate of the logo container.
   * @param y The y coordinate of the logo container.
   * @param containerWidth The width of the logo container.
   * @param containerHeight The height of the logo container.
   * @param logoName The name of the logo file.
   * @param logoData The base64 of custom icons.
   * @returns A promise that resolves to the SVG string for the logo.
   */
  private async addLogo(
    x: number,
    y: number,
    containerWidth: number,
    containerHeight: number,
    logoName: string,
    logoData?: string
  ): Promise<string> {
    try {
      const logoWidth = Math.min(containerWidth, containerHeight) * 0.95;
      const logoHeight = logoWidth;
      const logoX = x + (containerWidth - logoWidth) / 2;
      const logoY = y + (containerHeight - logoHeight) / 2;

      // Use fetchSvgContent, which now handles both cases
      const svgContent = await this.fetchSvgContent(logoName, logoData);
      return await this.transformSvg(
        svgContent,
        logoWidth,
        logoHeight,
        logoX,
        logoY
      );
    } catch (error) {
      console.error(`Error loading logo '${logoName}':`, error);
      return "";
    }
  }

  /**
   * Fetches the SVG content from a file.
   * @param iconName The name of the icon file.
   * @returns A promise that resolves to the SVG content string.
   */
  private async fetchSvgContent(
    iconName: string,
    dataUrl?: string
  ): Promise<string> {
    if (dataUrl) {
      // Custom icon: Use the provided dataUrl
      return this.extractSvgFromDataUrl(dataUrl);
    } else {
      // Built-in icon: Fetch from the filesystem
      const filePath = path.join(
        process.cwd(),
        "public",
        "icons",
        `${iconName}.svg`
      );
      try {
        return await fs.readFile(filePath, "utf-8");
      } catch (error) {
        console.error(`Error loading built-in icon '${iconName}':`, error);
        return ""; // Or a placeholder SVG
      }
    }
  }

  private extractSvgFromDataUrl(dataUrl: string): string {
    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) {
      console.error("Invalid data URL format:", dataUrl);
      return ""; // Return empty string or a placeholder SVG
    }
    try {
      const decodedSvg = Buffer.from(base64Data, "base64").toString("utf-8");
      return decodedSvg;
    } catch (error) {
      console.error("Error decoding base64 data:", error);
      return ""; // Return empty or placeholder
    }
  }

  /**
   * Adds description text to the SVG with exact vertical and horizontal centering
   */
  private addDescription(
    x: number, // Center point for text
    y: number, // Top of container
    text: string,
    containerHeight: number,
    fill: string,
    fontSize: number
  ): string {
    const metrics = this.calculateTextMetrics(text, fontSize);
    const lines = metrics.lines;

    // Calculate spacing proportional to font size
    const lineSpacing = metrics.lineHeight - metrics.fontSizeMm; // Space between lines

    // Height of each line is the font size
    const totalLinesHeight = lines.length * metrics.fontSizeMm;
    // Total spacing between lines
    const totalSpacing = (lines.length - 1) * lineSpacing;

    // Total height of the text block
    const textBlockHeight = totalLinesHeight + totalSpacing;

    // Find vertical center of container
    const containerMiddle = y + containerHeight / 2;
    // Position first line so text block is centered
    const firstLineY =
      containerMiddle - textBlockHeight / 2 - metrics.fontSizeMm / 6;

    return `
        <text 
            x="${x}mm"
            font-family="Arial,sans-serif"
            font-size="${metrics.fontSizeMm}mm"
            font-weight="bold"
            text-anchor="middle"
            fill="${fill}">
            ${lines
              .map((line, index) => {
                // Each subsequent line is positioned by font size plus spacing
                const lineY =
                  firstLineY + index * metrics.fontSizeMm + index * lineSpacing;
                return `<tspan 
                    x="${x}mm" 
                    y="${lineY + metrics.fontSizeMm}mm"
                >${this.escapeXml(line.trim())}</tspan>`;
              })
              .join("")}
        </text>
    `;
  }

  /**
   * Escapes special characters in a string for XML/SVG.
   * @param unsafe The string to escape.
   * @returns The escaped string.
   */
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
      }
      return c;
    });
  }

  /**
   * Adds crosses at the corners of a row.
   * @returns The SVG string for the crosses.
   */
  private addRowCrosses(): string {
    return this.addCrosses(
      this.rowStartX,
      this.rowStartY,
      this.maxX - this.rowStartX,
      this.config.UNIT_HEIGHT
    );
  }

  /**
   * Adds crosses at the corners of a rectangle.
   * @param x The x coordinate of the rectangle.
   * @param y The y coordinate of the rectangle.
   * @param width The width of the rectangle.
   * @param height The height of the rectangle.
   * @returns The SVG string for the crosses.
   */
  private addCrosses(
    x: number,
    y: number,
    width: number,
    height: number
  ): string {
    return (
      this.addCross(x, y) +
      this.addCross(x, y + height) +
      this.addCross(x + width, y) +
      this.addCross(x + width, y + height)
    );
  }

  /**
   * Adds a single cross to the SVG content.
   * @param x The x coordinate of the cross.
   * @param y The y coordinate of the cross.
   * @returns The SVG string for the cross.
   */
  private addCross(x: number, y: number): string {
    const halfSize = this.config.CROSS_SIZE / 2;
    return (
      `<line x1="${x - halfSize}mm" y1="${y}mm" x2="${
        x + halfSize
      }mm" y2="${y}mm" stroke="black" stroke-width="0.1mm" />` +
      `<line x1="${x}mm" y1="${y - halfSize}mm" x2="${x}mm" y2="${
        y + halfSize
      }mm" stroke="black" stroke-width="0.1mm" />`
    );
  }
}

export { SVGService };
