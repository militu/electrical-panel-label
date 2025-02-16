import { Unit } from "@/app/types/Unit";
import { ColorInput } from "@/app/ui/ColorInput";
import { FormField } from "@/app/ui/UnitForm/FormField";
import { useTranslations } from "next-intl";
import React from "react";

interface BottomSectionProps {
  unit: Unit;
  onChange: (updates: Partial<Unit>) => void;
}

const BottomSection: React.FC<BottomSectionProps> = ({ unit, onChange }) => {
  const t = useTranslations("UnitForm");

  return (
    <FormField label={t("bottomColor")} name="bottom_color">
      <ColorInput
        value={unit.bottom_color}
        onChange={(e) => onChange({ bottom_color: e.target.value })}
      />
    </FormField>
  );
};

export default BottomSection;
