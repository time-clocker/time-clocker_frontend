import { TextInput, Text } from "@tremor/react";
import type { ReactNode } from "react";

interface AuthInputFieldProps {
  label: string;
  name: string;
  type: "text" | "password" | "email" | "number" | "search" | "tel" | "url";
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon: ReactNode;
  inputMode?: "numeric" | "text" | "email" | "tel" | "search" | "url" | "none" | "decimal";
  pattern?: string;
}

export const AuthInputField = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  icon,
  inputMode,
  pattern
}: AuthInputFieldProps) => (
  <div className="animate-fade-in">
    <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
    <TextInput
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
      icon={() => icon}
      {...(inputMode && { inputMode })}
      {...(pattern && { pattern })}
    />
  </div>
);