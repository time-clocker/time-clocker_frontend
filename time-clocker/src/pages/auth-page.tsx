import { Card, Title, Button, Text, Divider } from "@tremor/react";
import { useState } from "react";
import { AuthForm } from "../components/auth/auth-form";
import { authService } from "../services/auth-service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import PANDORA from "../assets/PANDORA.png";
import type { LoginRequest } from "../types/auth";

const DOC_TYPE_MAP: Record<string, string> = {
  "Cédula de ciudadanía": "CC",
  "Cédula de extranjería": "CE",
  "Tarjeta de identidad": "TI",
  "Pasaporte": "PAS",
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    typeDocument: "Cédula de ciudadanía",
    documentNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // --- LOGIN ---
      setIsLoading(true);
      try {
        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password,
          returnSecureToken: true,
        };

        const { role } = await authService.login(loginData);

        toast.success("¡Inicio de sesión exitoso!");

        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/user", { replace: true });
        }
      } catch (error: any) {
        toast.error(error.message || "Error en el inicio de sesión");
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- REGISTRO ---
      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }

      setIsLoading(true);
      try {
        const payload = {
          full_name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          doc_type: DOC_TYPE_MAP[formData.typeDocument] ?? formData.typeDocument,
          doc_number: formData.documentNumber.trim(),
        };

        const registerData = await authService.register(payload);

        toast.success("¡Registro exitoso!");
        const role = (registerData?.role as string) ?? "employee";

        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/user", { replace: true });
        }
      } catch (error: any) {
        toast.error(error?.message || "Error en el registro");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-pandora-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className=" bg-white rounded-xl shadow-xl border-0">
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <img src={PANDORA} alt="Logo PANDORA" className="h-40 w-auto mb-4" />
          </div>
          <div className="text-center mb-6">
            <Title className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </Title>
            <Text className="text-gray-600">
              {isLogin ? "Ingresa a tu cuenta" : "Regístrate para comenzar"}
            </Text>
          </div>

          <AuthForm
            isLogin={isLogin}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleSelectChange={handleSelectChange}
            isLoading={isLoading}
          />

          <Divider className="my-6">o</Divider>

          <div className="text-center">
            <Text className="text-gray-600">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            </Text>
            <Button
              variant="light"
              className="mt-2 text-pandora-green hover:text-pandora-green-dark transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center text-ml text-black">
          <p>
            Al {isLogin ? "iniciar sesión" : "registrarte"}, aceptas nuestros
            Términos y Condiciones
          </p>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Pandora Restaurante, Inc. All rights reserved.</p>
          <p>Desarrollado por JDT Software</p>
        </div>
      </div>
    </div>
  );
}
