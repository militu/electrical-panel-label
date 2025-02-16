// src/app/api/save-icon/route.ts

import DOMPurify from "dompurify";
import * as fs from "fs/promises";
import { JSDOM } from "jsdom";
import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 50 * 1024; // 50KB

async function sanitizeSVG(svgContent: string): Promise<string> {
  const { window } = new JSDOM("");
  const purify = DOMPurify(window);

  const sanitizedSVG = purify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script"],
    FORBID_ATTR: ["on*", "style"],
  });

  const { document } = new JSDOM(sanitizedSVG).window;
  const svgElement = document.querySelector("svg");

  if (!svgElement) {
    throw new Error("No SVG element found after sanitization");
  }

  return svgElement.outerHTML;
}

async function validateAndNormalizeSVG(content: string): Promise<string> {
  const { window } = new JSDOM("");
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(content, "image/svg+xml");

  // Check for parsing errors
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid SVG format");
  }

  // Sanitize the SVG
  return await sanitizeSVG(content);
}

function validateFileName(fileName: string): string {
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const translationsString = formData.get("translations") as string;

    if (!file || !name || !translationsString) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.includes("svg")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    let translations: Record<string, string>;
    try {
      translations = JSON.parse(translationsString);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid translations data" },
        { status: 400 }
      );
    }

    // Read and validate SVG content
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileContent = fileBuffer.toString("utf-8");

    let normalizedSvg: string;
    try {
      normalizedSvg = await validateAndNormalizeSVG(fileContent);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `Invalid SVG: ${error.message}` },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Invalid SVG: Unknown error" },
          { status: 400 }
        );
      }
    }

    // Generate unique filename
    const fileName = validateFileName(`${name}-${uuidv4().slice(0, 8)}`);
    const filePath = path.join(
      process.cwd(),
      "public",
      "icons",
      `${fileName}.svg`
    );

    // Ensure directory exists
    await fs.mkdir(path.join(process.cwd(), "public", "icons"), {
      recursive: true,
    });

    // Save the file
    await fs.writeFile(filePath, normalizedSvg, "utf-8");

    return NextResponse.json({ fileName });
  } catch (error) {
    console.error("Error saving icon:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      "icons",
      `${fileName}.svg`
    );
    const iconsDirPath = path.resolve(
      path.join(process.cwd(), "public", "icons")
    );
    const realPath = path.resolve(filePath);

    // Security check: ensure the file is within the icons directory
    if (!realPath.startsWith(iconsDirPath)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code !== "ENOENT"
      ) {
        // Ignore if file doesn't exist
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting icon:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
