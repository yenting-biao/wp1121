import React from "react";

// Run: npx shadcn-ui@latest add input label
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  type: React.HTMLInputTypeAttribute;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export default function AuthInput({ label, type, value, setValue }: Props) {
  return (
    <div className="w-full">
      <Label className="text-md">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
}
