import { Label } from "@/app/ui/shadcn/label";
import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  children,
}) => (
  <div className="mb-4">
    <Label htmlFor={name} className="block text-sm font-bold mb-2">
      {label}
    </Label>
    {children}
  </div>
);
