// src/app/services/SVGValidationService.ts

import { parseHTML } from "linkedom";

export class SVGValidationService {
  private readonly PX_TO_MM = 0.26458333;
  private readonly TARGET_SIZE_PX = 50;
  private readonly ALLOWED_SVG_ATTRIBUTES = new Set([
    "viewBox",
    "width",
    "height",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "d",
    "points",
    "x",
    "y",
    "transform",
    "class",
    "style",
    "xmlns",
    "cx",
    "cy",
    "r",
  ]);

  private readonly ALLOWED_SVG_ELEMENTS = new Set([
    "svg",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "g",
  ]);

  public validateAndSanitizeSVG(svgContent: string): string {
    const { document } = parseHTML(svgContent);

    // Get the root SVG element
    const svgElement = document.querySelector("svg");
    if (!svgElement) {
      throw new Error("No SVG element found");
    }

    // Normalize the viewBox
    this.normalizeViewBox(svgElement);

    // Remove any scripts or event handlers
    this.removeUnsafeContent(svgElement);

    // Replace currentColor with a solid color
    this.replaceCurrentColor(svgElement);

    // Sanitize the SVG
    this.sanitizeElement(svgElement);

    // Ensure proper namespace
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    return svgElement.outerHTML;
  }

  private normalizeViewBox(svgElement: Element): void {
    let viewBox = svgElement.getAttribute("viewBox");
    let width = svgElement.getAttribute("width");
    let height = svgElement.getAttribute("height");

    // If no viewBox but has width/height, create viewBox
    if (!viewBox && width && height) {
      viewBox = `0 0 ${width} ${height}`;
    }

    // If still no viewBox, set default
    if (!viewBox) {
      viewBox = "0 0 24 24"; // Default for most icon sets
    }

    // Parse viewBox values
    const [minX, minY, vbWidth, vbHeight] = viewBox.split(/[\s,]+/).map(Number);

    // Calculate the scale to fit our target size (50px)
    const scale = Math.max(vbWidth, vbHeight) / this.TARGET_SIZE_PX;

    // Calculate new viewBox dimensions in mm
    const newWidth = (vbWidth / scale) * this.PX_TO_MM;
    const newHeight = (vbHeight / scale) * this.PX_TO_MM;

    // Center the content
    const xOffset = (13.229166 - newWidth) / 2 - (minX * this.PX_TO_MM) / scale;
    const yOffset =
      (13.229166 - newHeight) / 2 - (minY * this.PX_TO_MM) / scale;

    // Set new attributes
    svgElement.setAttribute("width", "50");
    svgElement.setAttribute("height", "50");
    svgElement.setAttribute("viewBox", `0 0 13.229166 13.229167`);

    // Wrap existing content in a group with transform
    const content = svgElement.innerHTML;
    svgElement.innerHTML = `<g transform="translate(${xOffset},${yOffset}) scale(${
      this.PX_TO_MM / scale
    })">${content}</g>`;
  }

  private replaceCurrentColor(element: Element): void {
    const elementsWithCurrentColor = element.querySelectorAll(
      '[fill="currentColor"], [stroke="currentColor"]'
    );
    elementsWithCurrentColor.forEach((el) => {
      if (el.getAttribute("fill") === "currentColor") {
        el.setAttribute("fill", "#000000");
      }
      if (el.getAttribute("stroke") === "currentColor") {
        el.setAttribute("stroke", "#000000");
      }
    });

    if (element.getAttribute("fill") === "currentColor") {
      element.setAttribute("fill", "#000000");
    }
    if (element.getAttribute("stroke") === "currentColor") {
      element.setAttribute("stroke", "#000000");
    }
  }

  private removeUnsafeContent(element: Element): void {
    const scripts = element.getElementsByTagName("script");
    Array.from(scripts).forEach((script) => script.remove());

    const elements = element.getElementsByTagName("*");
    Array.from(elements).forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith("on")) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  private sanitizeElement(element: Element): void {
    if (!this.ALLOWED_SVG_ELEMENTS.has(element.tagName.toLowerCase())) {
      element.remove();
      return;
    }

    Array.from(element.attributes).forEach((attr) => {
      if (!this.ALLOWED_SVG_ATTRIBUTES.has(attr.name.toLowerCase())) {
        element.removeAttribute(attr.name);
      }
    });

    Array.from(element.children).forEach((child) => {
      this.sanitizeElement(child);
    });
  }

  public validateSize(svgContent: string): boolean {
    const maxSize = 50 * 1024; // 50KB
    return svgContent.length <= maxSize;
  }

  public validateFileName(fileName: string): string {
    const sanitized = fileName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (sanitized.length < 1) {
      throw new Error("Invalid file name");
    }

    return sanitized;
  }
}

export interface CustomIcon {
  id: string;
  name: string;
  translations: Record<string, string>;
  fileName: string;
  isCustom: true;
  dateAdded: string;
}

export class CustomIconStorage {
  private readonly STORAGE_KEY = "custom-icons";

  /**
   * Gets all stored custom icons
   */
  public getCustomIcons(): CustomIcon[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Adds a new custom icon
   */
  public addCustomIcon(icon: CustomIcon): void {
    if (typeof window === "undefined") return;
    const icons = this.getCustomIcons();
    icons.push(icon);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(icons));
  }

  /**
   * Removes a custom icon
   */
  public removeCustomIcon(iconId: string): void {
    if (typeof window === "undefined") return;
    const icons = this.getCustomIcons();
    const filtered = icons.filter((icon) => icon.id !== iconId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Updates a custom icon's metadata
   */
  public updateCustomIcon(iconId: string, updates: Partial<CustomIcon>): void {
    if (typeof window === "undefined") return;
    const icons = this.getCustomIcons();
    const index = icons.findIndex((icon) => icon.id === iconId);
    if (index !== -1) {
      icons[index] = { ...icons[index], ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(icons));
    }
  }
}
