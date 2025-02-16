// src/app/services/CustomIconManager.ts

import { CustomIcon } from "./SVGValidationService";

const STORAGE_KEY = "custom-icons";
const STORAGE_EVENT = "custom-icons-changed";

export class CustomIconError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "CustomIconError";
  }
}

export class CustomIconManager {
  private icons: CustomIcon[] = [];
  private initialized = false;

  constructor() {
    this.init();
    this.setupStorageListener();
  }

  private init(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.icons = stored ? JSON.parse(stored) : [];
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize CustomIconManager:", error);
      this.icons = [];
    }
  }

  private setupStorageListener(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        try {
          this.icons = event.newValue ? JSON.parse(event.newValue) : [];
          window.dispatchEvent(new Event(STORAGE_EVENT));
        } catch (error) {
          console.error("Failed to process storage event:", error);
        }
      }
    });
  }

  private save(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.icons));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch (error) {
      throw new CustomIconError(
        "Failed to save icons to storage",
        "STORAGE_ERROR"
      );
    }
  }

  public getIcons(): CustomIcon[] {
    if (!this.initialized) this.init();
    return [...this.icons];
  }

  public getIcon(id: string): CustomIcon | undefined {
    console.log("IN GET ICON", this.icons);
    return this.icons.find((icon) => icon.id === id);
  }

  public addIcon(
    icon: Omit<CustomIcon, "id" | "dateAdded" | "fileName"> & {
      dataUrl: string;
    }
  ): CustomIcon {
    // Modified type and parameter
    if (!this.initialized) this.init();

    // Validate icon data (keep name and translations, remove fileName)
    if (!icon.name || !icon.translations || !icon.dataUrl) {
      // Added dataUrl validation
      throw new CustomIconError(
        "Invalid icon data: missing required fields",
        "VALIDATION_ERROR"
      );
    }
    // No duplicate check needed (localStorage handles overwriting)

    const newIcon: CustomIcon = {
      ...icon,
      id: crypto.randomUUID(),
      isCustom: true,
      dateAdded: new Date().toISOString(),
    };

    this.icons.push(newIcon);
    this.save();

    return newIcon;
  }

  public updateIcon(id: string, updates: Partial<CustomIcon>): CustomIcon {
    const index = this.icons.findIndex((icon) => icon.id === id);
    if (index === -1) {
      throw new CustomIconError("Icon not found", "NOT_FOUND_ERROR");
    }

    // Prevent updating immutable fields: id, dateAdded, isCustom, AND dataUrl
    const {
      id: _,
      dateAdded: __,
      isCustom: ___,
      dataUrl: ____,
      ...validUpdates
    } = updates;

    const updatedIcon = {
      ...this.icons[index],
      ...validUpdates,
    };

    this.icons[index] = updatedIcon;
    this.save();

    return updatedIcon;
  }

  public deleteIcon(id: string): void {
    const index = this.icons.findIndex((icon) => icon.id === id);
    if (index === -1) {
      throw new CustomIconError("Icon not found", "NOT_FOUND_ERROR");
    }

    this.icons.splice(index, 1);
    this.save();
  }

  public clear(): void {
    this.icons = [];
    this.save();
  }
}

// Create singleton instance
export const customIconManager = new CustomIconManager();
