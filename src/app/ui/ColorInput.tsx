import React from "react";
import {Input} from "@/app/ui/shadcn/input";

interface ColorInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export const ColorInput: React.FC<ColorInputProps> = ({value, onChange}) => (
    <div className="flex items-center">
        <Input
            type="color"
            value={value}
            onChange={onChange}
            className="w-10 h-10 p-1 rounded-md cursor-pointer"
        />
        <span className="ml-2 text-sm text-gray-600">{value}</span>
    </div>
);