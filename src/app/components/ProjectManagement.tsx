import { useSession } from "@/app/contexts/SessionContext";
import ImportButton from "@/app/ui/ImportButton";
import { Button } from "@/app/ui/shadcn/button";
import { toast } from "@/app/ui/shadcn/use-toast";
import { saveAs } from "file-saver";
import { useTranslations } from "next-intl";
import React from "react";
import IconManager from "./IconManager";

const ProjectManagement: React.FC = () => {
  const { currentSession, importSession } = useSession();
  const t = useTranslations("ProjectManagement");

  const exportProject = () => {
    if (currentSession) {
      const projectData = {
        name: currentSession.name,
        rows: currentSession.rows,
        globalSettings: currentSession.globalSettings,
        lastModified: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: "application/json",
      });
      saveAs(
        blob,
        `${currentSession.name.replace(
          /\s+/g,
          "_"
        )}_${new Date().toISOString()}.json`
      );
    } else {
      toast({
        title: t("exportFailed"),
        description: t("noActiveSession"),
        variant: "destructive",
      });
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        const isValidFormat =
          importedData.name &&
          Array.isArray(importedData.rows) &&
          importedData.globalSettings;
        if (isValidFormat) {
          importSession(importedData);
          toast({
            title: t("importSuccessful"),
            description: t("importedProject", { name: importedData.name }),
          });
        } else {
          handleInvalidFileFormat();
        }
      } catch (error) {
        handleInvalidFileFormat();
      }
    };
    reader.readAsText(file);
  };

  const handleInvalidFileFormat = () => {
    toast({
      title: t("importFailed"),
      description: t("invalidFileFormat"),
      variant: "destructive",
    });
  };

  return (
    <div
      className={`flex flex-col md:flex-row gap-4 w-full md:w-auto tour-project-management`}
    >
      <Button onClick={exportProject} className="w-full md:w-auto">
        {t("exportProject")}
      </Button>
      <ImportButton onImport={handleImport} className="w-full md:w-auto" />
      <IconManager
        onIconsChange={() => {
          window.dispatchEvent(new Event("custom-icons-changed"));
        }}
      />
    </div>
  );
};

export default ProjectManagement;
