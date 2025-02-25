// src/app/components/IconManager.tsx

import { Locale, locales } from "@/app/config/locales";
import { useCustomIcons } from "@/app/hooks/useCustomIcons";
import {
  CustomIcon,
  svgValidationService,
} from "@/app/services/SVGValidationService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/ui/shadcn/alert-dialog";
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
import { Loader2, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useCallback, useState } from "react";

interface IconManagerProps {
  onIconsChange?: () => void;
  className?: string;
}

const IconManager: React.FC<IconManagerProps> = ({
  onIconsChange,
  className,
}) => {
  const t = useTranslations("IconManager");
  const currentLocale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [iconToDelete, setIconToDelete] = useState<CustomIcon | null>(null);
  const { icons, isLoading, error, addIcon, deleteIcon } = useCustomIcons();

  const [newIcon, setNewIcon] = useState<{
    file: File | null;
    name: string;
    translations: Record<string, string>;
  }>({
    file: null,
    name: "",
    translations: {},
  });

  const resetForm = useCallback(() => {
    setNewIcon({
      file: null,
      name: "",
      translations: {},
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newIcon.file || !newIcon.name) {
        toast({ title: t("missingFields"), variant: "destructive" });
        return;
      }

      // Client-side validation
      if (!svgValidationService.validateFileSize(newIcon.file)) {
        toast({ title: t("fileTooLarge"), variant: "destructive" });
        return;
      }

      if (!svgValidationService.validateFileType(newIcon.file)) {
        toast({ title: t("invalidFileType"), variant: "destructive" });
        return;
      }

      console.log("Starting SVG validation for file:", newIcon.file.name);
      const isValidSVG = await svgValidationService.validateSVGContent(
        newIcon.file
      );
      if (!isValidSVG) {
        console.error("SVG validation failed for file:", newIcon.file.name);
        toast({
          title: t("invalidSVGContent"),
          description: "Check console for detailed validation errors",
          variant: "destructive",
        });
        return;
      }
      console.log("SVG validation passed for file:", newIcon.file.name);

      setIsUploading(true);

      try {
        // Convert the file to a Data URL (Base64)
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target && typeof event.target.result === "string") {
            const dataUrl = event.target.result;

            // Add to local storage via the hook
            await addIcon({
              name: newIcon.name,
              translations: newIcon.translations,
              dataUrl: dataUrl,
              isCustom: true,
            });
            toast({ title: t("iconSaved") });
            resetForm();
            onIconsChange?.();
          }
        };
        reader.onerror = () => {
          toast({
            title: t("saveFailed"),
            description: t("fileReadError"),
            variant: "destructive",
          });
          setIsUploading(false);
        };
        reader.readAsDataURL(newIcon.file);
      } catch (error) {
        toast({
          title: t("saveFailed"),
          description:
            error instanceof Error ? error.message : t("unknownError"),
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [newIcon, addIcon, onIconsChange, resetForm, t]
  );

  const handleDeleteIcon = useCallback(
    async (icon: CustomIcon) => {
      try {
        await deleteIcon(icon.id);
        setIconToDelete(null);

        toast({ title: t("iconDeleted") });
        onIconsChange?.();
      } catch (error) {
        toast({
          title: t("deleteFailed"),
          description:
            error instanceof Error ? error.message : t("unknownError"),
          variant: "destructive",
        });
      }
    },
    [deleteIcon, onIconsChange, t]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!svgValidationService.validateFileType(file)) {
      toast({
        title: t("invalidFileType"),
        description: t("svgOnly"),
        variant: "destructive",
      });
      return;
    }

    setNewIcon((prev) => ({ ...prev, file }));
  };

  if (error) {
    toast({
      title: t("error"),
      description: error.message,
      variant: "destructive",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          {t("manageIcons")}
        </Button>
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
                  </div>

                  <div>
                    <Input
                      type="file"
                      accept=".svg"
                      onChange={handleFileChange}
                      className="mb-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("iconName")}
                    </label>
                    <Input
                      value={newIcon.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        // Update both name and translations with the same value
                        setNewIcon((prev) => ({
                          ...prev,
                          name,
                          translations: locales.reduce(
                            (acc, locale) => ({
                              ...acc,
                              [locale]: name,
                            }),
                            {}
                          ),
                        }));
                      }}
                      placeholder={t("namePlaceholder")}
                    />
                  </div>

                  <Button type="submit" disabled={isUploading}>
                    {isUploading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
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
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {icons.map((icon) => (
                      <div key={icon.id} className="relative group">
                        <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <Image
                              src={icon.dataUrl!}
                              alt={
                                icon.translations[currentLocale] || icon.name
                              }
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-center font-medium">
                            {icon.translations[currentLocale] || icon.name}
                          </p>
                          <AlertDialog
                            open={iconToDelete?.id === icon.id}
                            onOpenChange={(open) => {
                              if (!open) setIconToDelete(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setIconToDelete(icon)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("deleteIconTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("deleteIconDescription")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteIcon(icon)}
                                >
                                  {t("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IconManager;
