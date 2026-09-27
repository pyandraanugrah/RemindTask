"use client";

import { SUBJECT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  name?: string;
}

export function ColorPicker({ value, onChange, name = "color" }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-foreground">Warna</label>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-4 gap-3">
        {SUBJECT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "relative w-10 h-10 rounded-lg transition-all border-2",
              value === color.value
                ? "border-foreground ring-2 ring-accent ring-offset-2"
                : "border-border hover:border-accent/50"
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {value === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
