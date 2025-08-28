import { Text } from "@tremor/react";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";

interface PasswordValidationProps {
  password: string;
}

export const PasswordValidation = ({ password }: PasswordValidationProps) => {
  const validations = [
    {
      condition: password.length >= 8,
      text: "Mínimo 8 caracteres"
    },
    {
      condition: /[A-Z]/.test(password),
      text: "Al menos una mayúscula"
    },
    {
      condition: /[a-z]/.test(password),
      text: "Al menos una minúscula"
    },
    {
      condition: /[0-9]/.test(password),
      text: "Al menos un número"
    },
    {
      condition: /[*!"#@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      text: "Al menos un carácter especial (*!\"#@$%^&*)"
    }
  ];

  const isValid = validations.every(v => v.condition);

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        La contraseña debe contener:
      </Text>
      <div className="space-y-1">
        {validations.map((validation, index) => (
          <div key={index} className="flex items-center">
            {validation.condition ? (
              <RiCheckboxCircleFill className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <RiErrorWarningFill className="h-4 w-4 text-red-500 mr-2" />
            )}
            <Text className={`text-xs ${validation.condition ? 'text-green-600' : 'text-red-600'}`}>
              {validation.text}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }
  if (!/[*!"#@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial (*!\"#@$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};