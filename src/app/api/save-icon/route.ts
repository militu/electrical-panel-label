// src/app/api/save-icon/route.ts

import { SVGValidationService } from "@/app/services/SVGValidationService";
import * as fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const svgValidator = new SVGValidationService();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const translations = JSON.parse(formData.get("translations") as string);

    if (!file || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read the file content
    const fileContent = await file.text();

    // Validate file size
    if (!svgValidator.validateSize(fileContent)) {
      return NextResponse.json(
        { error: "SVG file is too large" },
        { status: 400 }
      );
    }

    try {
      // Validate and normalize the SVG
      const normalizedSvg = svgValidator.validateAndSanitizeSVG(fileContent);

      // Generate a unique filename
      const fileName = svgValidator.validateFileName(
        `${name}-${uuidv4().slice(0, 8)}`
      );
      const filePath = path.join(
        process.cwd(),
        "public",
        "icons",
        `${fileName}.svg`
      );

      // Save the normalized SVG
      await fs.writeFile(filePath, normalizedSvg, "utf-8");

      // Return the icon data
      const iconData = {
        id: uuidv4(),
        name,
        translations,
        fileName,
        isCustom: true as const,
        dateAdded: new Date().toISOString(),
      };

      return NextResponse.json(iconData);
    } catch (svgError) {
      return NextResponse.json(
        { error: `Invalid SVG: ${svgError.message}` },
        { status: 400 }
      );
    }
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

    // Check if file exists and is within the icons directory
    const realPath = path.resolve(filePath);
    const iconsDirPath = path.resolve(
      path.join(process.cwd(), "public", "icons")
    );

    if (!realPath.startsWith(iconsDirPath)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting icon:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
