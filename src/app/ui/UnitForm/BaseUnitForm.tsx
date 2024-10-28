import { Unit } from "@/app/types/Unit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui/shadcn/accordion";
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
import BasicInfoSection from "@/app/ui/UnitForm/BasicInfoSection";
import BottomSection from "@/app/ui/UnitForm/BottomSection";
import DescriptionSection from "@/app/ui/UnitForm/DescriptionSection";
import SidebarSection from "@/app/ui/UnitForm/SidebarSection";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface BaseUnitFormProps {
  initialData: Partial<Unit>;
  onSubmit: (updatedData: Unit) => void;
  onCancel: () => void;
  submitLabel: string;
  showDelete?: boolean;
  onDelete?: () => void;
  onChange?: (updatedData: Partial<Unit>) => void;
  isSmallScreen: boolean;
}

const BaseUnitForm: React.FC<BaseUnitFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
  showDelete = false,
  onDelete,
  onChange,
  isSmallScreen,
}) => {
  const t = useTranslations("UnitForm");
  const [formData, setFormData] = useState<Unit>({ ...initialData } as Unit);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleChange = (updates: Partial<Unit>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...updates };
      onChange?.(newData);
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  React.useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } =
          scrollContainerRef.current;
        const hasScrollableContent = scrollHeight > clientHeight;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
        setShowScrollIndicator(
          hasScrollableContent && !isNearBottom && !hasScrolled
        );
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll);
      scrollContainer.addEventListener("scroll", () => setHasScrolled(true));
    }

    const timer = setTimeout(() => setHasScrolled(true), 5000);

    return () => {
      window.removeEventListener("resize", checkScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScroll);
        scrollContainer.removeEventListener("scroll", () =>
          setHasScrolled(true)
        );
      }
      clearTimeout(timer);
    };
  }, [hasScrolled]);

  const renderForm = () => (
    <>
      <BasicInfoSection unit={formData as Unit} onChange={handleChange} />
      <DescriptionSection unit={formData as Unit} onChange={handleChange} />
      <SidebarSection unit={formData as Unit} onChange={handleChange} />
      <BottomSection unit={formData as Unit} onChange={handleChange} />
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full relative">
      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {isSmallScreen ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="basic-info">
              <AccordionTrigger>{t("basicInfo")}</AccordionTrigger>
              <AccordionContent>
                <BasicInfoSection
                  unit={formData as Unit}
                  onChange={handleChange}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="description">
              <AccordionTrigger>{t("descriptionSettings")}</AccordionTrigger>
              <AccordionContent>
                <DescriptionSection
                  unit={formData as Unit}
                  onChange={handleChange}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sidebar">
              <AccordionTrigger>{t("sidebarSettings")}</AccordionTrigger>
              <AccordionContent>
                <SidebarSection
                  unit={formData as Unit}
                  onChange={handleChange}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="bottom">
              <AccordionTrigger>{t("bottomSettings")}</AccordionTrigger>
              <AccordionContent>
                <BottomSection
                  unit={formData as Unit}
                  onChange={handleChange}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          renderForm()
        )}
      </div>
      {showScrollIndicator && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center animate-bounce">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      )}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background p-4">
        <Button type="submit" className="w-full sm:w-auto">
          {submitLabel}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {t("cancel")}
        </Button>
        {showDelete && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                {t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  );
};

export default BaseUnitForm;
