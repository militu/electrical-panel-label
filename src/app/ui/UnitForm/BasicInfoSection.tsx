import { useTranslatedIconList } from "@/app/hooks/useTranslatedIconList";
import { IconName } from "@/app/types/Icon";
import { Unit } from "@/app/types/Unit";
import { Checkbox } from "@/app/ui/shadcn/checkbox";
import { Input } from "@/app/ui/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/shadcn/select";
import { FormField } from "@/app/ui/UnitForm/FormField";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

interface BasicInfoSectionProps {
  unit: Unit;
  onChange: (updates: Partial<Unit>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  unit,
  onChange,
}) => {
  const t = useTranslations("UnitForm");
  const unsortedIconList = useTranslatedIconList();
  const [allowHalfSizes, setAllowHalfSizes] = useState(unit.allow_half_sizes);

  const iconList = [...unsortedIconList].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, {
      sensitivity: "base",
      ignorePunctuation: true,
    })
  );

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const minSize = allowHalfSizes ? 0.5 : 1;
    const size = Math.min(Math.max(minSize, value), 18);
    onChange({ size });
  };

  const handleLogoChange = (value: string) => {
    onChange({ logo: value === "__NO_ICON__" ? null : (value as IconName) });
  };

  const handleHalfSizesChange = (checked: boolean) => {
    setAllowHalfSizes(checked);
    onChange({ allow_half_sizes: checked });
    if (!checked && unit.size % 1 !== 0) {
      onChange({
        size: Math.ceil(unit.size),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label={t("moduleSize")} name="size">
        <div className="space-y-3">
          <Input
            type="number"
            value={unit.size}
            onChange={handleSizeChange}
            step={allowHalfSizes ? 0.5 : 1}
            min={allowHalfSizes ? 0.5 : 1}
            max={18}
          />
          <div className="flex items-center space-x-2 pl-1">
            <Checkbox
              id="allowHalfSizes"
              checked={unit.allow_half_sizes}
              onCheckedChange={handleHalfSizesChange}
            />
            <label
              htmlFor="allowHalfSizes"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {t("allowHalfSizes")}
            </label>
          </div>
        </div>
      </FormField>

      <FormField label={t("icon")} name="logo">
        <Select
          onValueChange={handleLogoChange}
          value={unit.logo ?? "__NO_ICON__"}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectIconPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__NO_ICON__">{t("noIcon")}</SelectItem>
            {iconList.map((icon) => (
              <SelectItem key={icon.value} value={icon.value}>
                <div className="flex items-center">
                  <Image
                    src={`/icons/${icon.value}.svg`}
                    width={16}
                    height={16}
                    alt={icon.label}
                    className="mr-2"
                  />
                  {icon.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
};

export default BasicInfoSection;
