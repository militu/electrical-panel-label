// UnitFormSections/DescriptionSection.tsx
import { Unit } from "@/app/types/Unit";
import { ColorInput } from "@/app/ui/ColorInput";
import { FormField } from "@/app/ui/UnitForm/FormField";
import { Input } from "@/app/ui/shadcn/input";
import { Textarea } from "@/app/ui/shadcn/textarea";
import { useTranslations } from "next-intl";
import React from "react";

interface DescriptionSectionProps {
  unit: Unit;
  onChange: (updates: Partial<Unit>) => void;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  unit,
  onChange,
}) => {
  const t = useTranslations("UnitForm");

  return (
    <>
      <FormField label={t("description")} name="description">
        <Textarea
          value={unit.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
        />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label={t("textSize")} name="description_font_size">
          <Input
            type="number"
            value={unit.description_font_size}
            onChange={(e) =>
              onChange({ description_font_size: Number(e.target.value) })
            }
            min={1}
          />
        </FormField>
        <FormField label={t("textColor")} name="description_color">
          <ColorInput
            value={unit.description_color}
            onChange={(e) => onChange({ description_color: e.target.value })}
          />
        </FormField>
      </div>
    </>
  );
};

export default DescriptionSection;
