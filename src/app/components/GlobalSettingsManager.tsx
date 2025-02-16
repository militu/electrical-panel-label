import { useSession } from "@/app/contexts/SessionContext";
import { GlobalSettingsService } from "@/app/services/GlobalSettingsService";
import { GlobalSettings } from "@/app/types/GlobalSettings";
import GlobalSettingsForm from "@/app/ui/GlobalSettingsForm";
import { Button } from "@/app/ui/shadcn/button";
import { Dialog, DialogContent } from "@/app/ui/shadcn/dialog";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

interface GlobalSettingsManagerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const GlobalSettingsManager: React.FC<GlobalSettingsManagerProps> = ({
  isOpen,
  onOpen,
  onClose,
}) => {
  const t = useTranslations("GlobalSettings");
  const { currentSession, updateGlobalSettings } = useSession();
  const globalSettingsService = useMemo(() => new GlobalSettingsService(), []);

  const [localSettings, setLocalSettings] =
    React.useState<GlobalSettings | null>(null);

  React.useEffect(() => {
    if (currentSession) {
      setLocalSettings(currentSession.globalSettings);
    }
  }, [currentSession]);

  const handleUpdateGlobalSettings = (newSettings: GlobalSettings) => {
    updateGlobalSettings(newSettings);
    setLocalSettings(newSettings);
    onClose();
  };

  const handleResetGlobalSettings = () => {
    const defaultSettings = globalSettingsService.getDefaultSettings();
    updateGlobalSettings(defaultSettings);
    setLocalSettings(defaultSettings);
    return defaultSettings;
  };

  return (
    <>
      <Button
        onClick={onOpen}
        variant="outline"
        className="w-full tour-global-settings"
      >
        {t("title")}
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => (open ? onOpen() : onClose())}
      >
        <DialogContent className="max-w-fit">
          {currentSession && localSettings && (
            <GlobalSettingsForm
              settings={localSettings}
              onSave={handleUpdateGlobalSettings}
              onReset={handleResetGlobalSettings}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSettingsManager;
