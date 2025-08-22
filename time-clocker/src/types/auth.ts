export interface AuthFormData {
  name: string;
  email: string;
  typeDocument: string;
  documentNumber: string;
  password: string;
  confirmPassword: string;
}

export interface AuthFormProps {
  isLogin: boolean;
  formData: AuthFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const documentTypes = [
  { value: "Cédula de ciudadanía", label: "Cédula de ciudadanía" },
  { value: "Cédula de extranjería", label: "Cédula de extranjería" },
  { value: "Pasaporte", label: "Pasaporte" },
  { value: "Tarjeta de identidad", label: "Tarjeta de identidad" },
] as const;