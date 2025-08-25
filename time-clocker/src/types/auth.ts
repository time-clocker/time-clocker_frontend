import axios from 'axios';

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

const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginRequest {
  email: string;
  password: string;
  returnSecureToken: boolean;
}

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  email: string;
  localId: string;
}

export interface AuthError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

export const documentTypes = [
  { value: "Cédula de ciudadanía", label: "Cédula de ciudadanía" },
  { value: "Cédula de extranjería", label: "Cédula de extranjería" },
  { value: "Pasaporte", label: "Pasaporte" },
  { value: "Tarjeta de identidad", label: "Tarjeta de identidad" },
] as const;