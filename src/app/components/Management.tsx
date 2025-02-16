import { useSession } from "@/app/contexts/SessionContext";
import ProjectManagement from "@/components/ProjectManagement";
import SessionManagement from "@/components/SessionManagement";
import { useTranslations } from "next-intl";
import React from "react";

const Management: React.FC = () => {
  const t = useTranslations("Management");
  const { currentSession } = useSession();

  return (
    <div className="rounded-xl bg-gradient shadow-lg p-4 md:p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-center md:text-left">
        {t("title")}
      </h2>
      {currentSession && (
        <div className="text-center md:text-left mb-4">
          <span className="text-md font-medium">
            {t("session.currentSession")}:
          </span>
          <span className="ml-2 text-lg font-semibold text-primary">
            {currentSession.name || t("session.unnamedSession")}
          </span>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <SessionManagement />
        <ProjectManagement />
      </div>
    </div>
  );
};

export default Management;
