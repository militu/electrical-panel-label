import { Button } from "@/app/ui/shadcn/button";
import { useTranslations } from "next-intl";
import React, { useRef } from "react";

interface ImportButtonProps {
  onImport: (file: File) => void;
  className?: string;
}

const ImportButton: React.FC<ImportButtonProps> = ({ onImport, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("ImportButton");

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button onClick={handleClick} className={className}>
        {t("importProject")}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: "none" }}
      />
    </>
  );
};

export default ImportButton;
