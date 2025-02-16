import { GlobalSettings } from "@/app/types/GlobalSettings";

export class GlobalSettingsService {
  private defaultGlobalSettings: GlobalSettings = {
    UNIT_HEIGHT: 27,
    UNIT_WIDTH: 17.9,
    PAGE_WIDTH: 297,
    PAGE_HEIGHT: 209,
    BORDER_MARGIN: 10,
    CROSS_SIZE: 5,
    TOP_COLOR: "#ffffff",
  };

  getDefaultSettings(): GlobalSettings {
    return { ...this.defaultGlobalSettings };
  }
}
