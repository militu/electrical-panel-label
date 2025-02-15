// src/app/components/IconManager/IconManager.tsx

import { Locale, locales } from "@/app/config/locales";
import {
  CustomIcon,
  CustomIconStorage,
  SVGValidationService,
} from "@/app/services/SVGValidationService";
import { Button } from "@/app/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/ui/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/shadcn/dialog";
import { Input } from "@/app/ui/shadcn/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/shadcn/tabs";
import { toast } from "@/app/ui/shadcn/use-toast";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

const iconStorage = new CustomIconStorage();

interface IconManagerProps {
  onIconsChange?: () => void;
}

const IconManager: React.FC<IconManagerProps> = ({ onIconsChange }) => {
  const t = useTranslations("IconManager");
  const currentLocale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>(() =>
    iconStorage.getCustomIcons()
  );
  const [newIcon, setNewIcon] = useState<{
    file: File | null;
    name: string;
    translations: Record<string, string>;
  }>({
    file: null,
    name: "",
    translations: {},
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !file.name.toLowerCase().endsWith(".svg")) {
      toast({
        title: t("invalidFileType"),
        description: t("svgOnly"),
        variant: "destructive",
      });
      return;
    }
    setNewIcon((prev) => ({ ...prev, file: file || null }));
  };

  const handleNameChange = (locale: string, value: string) => {
    if (locale === currentLocale) {
      setNewIcon((prev) => ({ ...prev, name: value }));
    }
    setNewIcon((prev) => ({
      ...prev,
      translations: { ...prev.translations, [locale]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIcon.file || !newIcon.name) {
      toast({
        title: t("missingFields"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Read and validate the SVG on the client side
      const fileContent = await newIcon.file.text();
      const svgValidator = new SVGValidationService();

      try {
        svgValidator.validateAndSanitizeSVG(fileContent);
      } catch (error) {
        toast({
          title: t("invalidSvg"),
          description:
            error instanceof Error ? error.message : t("unknownError"),
          variant: "destructive",
        });
        return;
      }

      if (!svgValidator.validateSize(fileContent)) {
        toast({
          title: t("fileTooLarge"),
          description: t("maxSize50KB"),
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", newIcon.file);
      formData.append("name", newIcon.name);
      formData.append("translations", JSON.stringify(newIcon.translations));

      const response = await fetch("/api/save-icon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save icon");
      }

      const savedIcon = await response.json();
      iconStorage.addCustomIcon(savedIcon);
      setCustomIcons((prev) => [...prev, savedIcon]);

      toast({
        title: t("iconSaved"),
      });

      setNewIcon({
        file: null,
        name: "",
        translations: {},
      });

      onIconsChange?.();
    } catch (error) {
      toast({
        title: t("saveFailed"),
        description: error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteIcon = async (icon: CustomIcon) => {
    try {
      const response = await fetch("/api/save-icon", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: icon.fileName }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete icon");
      }

      iconStorage.removeCustomIcon(icon.id);
      setCustomIcons((prev) => prev.filter((i) => i.id !== icon.id));

      toast({
        title: t("iconDeleted"),
      });

      onIconsChange?.();
    } catch (error) {
      toast({
        title: t("deleteFailed"),
        description: error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("manageIcons")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">{t("uploadNew")}</TabsTrigger>
            <TabsTrigger value="manage">{t("manageExisting")}</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>{t("uploadTitle")}</CardTitle>
                <CardDescription>{t("uploadDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">{t("svgRequirements")}</h4>
                    <p
                      className="text-sm mt-2 text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: t("svgRequirementsDetails"),
                      }}
                    />
                    <p className="text-sm mt-2 text-muted-foreground">
                      {t("svgWillBeNormalized")}
                    </p>
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept=".svg"
                      onChange={handleFileChange}
                      className="mb-4"
                    />
                  </div>

                  {locales.map((locale) => (
                    <div key={locale} className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("nameIn", { locale: locale.toUpperCase() })}
                      </label>
                      <Input
                        value={newIcon.translations[locale] || ""}
                        onChange={(e) =>
                          handleNameChange(locale, e.target.value)
                        }
                        placeholder={t("namePlaceholder")}
                      />
                    </div>
                  ))}

                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? t("uploading") : t("upload")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>{t("customIcons")}</CardTitle>
                <CardDescription>{t("customIconsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {customIcons.map((icon) => (
                    <div key={icon.id} className="relative group">
                      <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                        <div className="relative w-16 h-16 mx-auto mb-2">
                          <Image
                            src={`/icons/${icon.fileName}.svg`}
                            alt={icon.translations[currentLocale] || icon.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-sm text-center font-medium">
                          {icon.translations[currentLocale] || icon.name}
                        </p>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteIcon(icon)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IconManager;
