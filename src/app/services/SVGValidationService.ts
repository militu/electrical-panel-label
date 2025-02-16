// src/app/services/SVGValidationService.ts

export interface CustomIcon {
  id: string;
  name: string;
  translations: Record<string, string>;
  fileName: string;
  isCustom: true;
  dateAdded: string;
}

export class SVGValidationService {
  private readonly MAX_SIZE = 50 * 1024; // 50KB

  public validateFileSize(file: File): boolean {
    return file.size <= this.MAX_SIZE;
  }

  public validateFileType(file: File): boolean {
    // Accept both MIME type and extension
    return (
      file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
    );
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

  public async validateSVGContent(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      console.log("SVG content:", text.substring(0, 200) + "..."); // Log the start of the content

      // First try parsing with DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");

      // Check for parsing errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        console.error("SVG parsing error:", parserError.textContent);
        return false;
      }

      // Get the root element
      const rootElement = doc.documentElement;
      console.log("Root element tag:", rootElement.tagName);

      // Basic validation: check if it's an SVG element with basic required attributes
      if (rootElement.tagName.toLowerCase() !== "svg") {
        console.error("Root element is not svg");
        return false;
      }

      // Check for basic SVG validity (has either viewBox or width/height)
      const hasViewBox = rootElement.hasAttribute("viewBox");
      const hasWidthHeight =
        rootElement.hasAttribute("width") && rootElement.hasAttribute("height");
      const hasNamespace = rootElement.hasAttribute("xmlns");

      console.log("SVG attributes:", {
        hasViewBox,
        hasWidthHeight,
        hasNamespace,
      });

      // More lenient validation - only require the xmlns attribute
      return hasNamespace;
    } catch (error) {
      console.error("SVG validation error:", error);
      return false;
    }
  }
}

// Create singleton instance
export const svgValidationService = new SVGValidationService();
