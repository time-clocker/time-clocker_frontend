import { Text } from "@tremor/react";
import { RiCheckboxCircleFill, RiErrorWarningFill } from "react-icons/ri";

interface PasswordValidationProps {
  password: string;
}

type ValidationRule = {
  test: (password: string) => boolean;
  message: string;
};

const passwordRules: ValidationRule[] = [
  {
    test: (password) => password.length >= 8,
    message: "Mínimo 8 caracteres",
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: "Al menos una mayúscula",
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: "Al menos una minúscula",
  },
  {
    test: (password) => /[0-9]/.test(password),
    message: "Al menos un número",
  },
  {
    test: (password) => /[*!"#@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    message: "Al menos un carácter especial (*!\"#@$%^&*)",
  },
];

const ValidationItem = ({
  valid,
  message,
}: {
  valid: boolean;
  message: string;
}) => (
  <div className="flex items-center">
    {valid ? (
      <RiCheckboxCircleFill className="h-4 w-4 text-green-500 mr-2" />
    ) : (
      <RiErrorWarningFill className="h-4 w-4 text-red-500 mr-2" />
    )}
    <Text
      className={`text-xs ${
        valid ? "text-green-600" : "text-red-600"
      }`}
    >
      {message}
    </Text>
  </div>
);

export const PasswordValidation = ({ password }: PasswordValidationProps) => {
  const validations = passwordRules.map((rule) => ({
    message: rule.message,
    valid: rule.test(password),
  }));

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        La contraseña debe contener:
      </Text>
      <div className="space-y-1">
        {validations.map((v, index) => (
          <ValidationItem key={index} valid={v.valid} message={v.message} />
        ))}
      </div>
    </div>
  );
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors = passwordRules
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.message);

  return {
    isValid: errors.length === 0,
    errors,
  };
};
