import { Card, Title, Button, Text, Divider } from "@tremor/react";
import { useState } from "react";
import { AuthForm } from "../components/auth/auth-form";
import { authService } from "../services/auth-service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import PANDORA from "../assets/PANDORA.png";
import type { LoginRequest } from "../types/auth";
import { validatePassword } from "../components/auth/password-validation"; 

import { DOC_TYPE_MAP } from "../constants/auth-page";

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

   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" && !isLogin) {
      const { errors } = validatePassword(value);
      setPasswordErrors(errors);
    }
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

      const { isValid, errors } = validatePassword(formData.password);
      
      if (!isValid) {
        toast.error("La contraseña no cumple con los requisitos de seguridad");
        setPasswordErrors(errors);
        return;
      }

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

          {!isLogin && passwordErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-sm font-semibold text-red-700 mb-2">
                La contraseña no cumple con los siguientes requisitos:
              </Text>
              <ul className="list-disc list-inside space-y-1">
                {passwordErrors.map((err, idx) => (
                  <li key={idx} className="text-xs text-red-600">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <Divider className="my-6">o</Divider>

          <div className="text-center">
            <Text className="text-gray-600">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            </Text>
            <Button
              variant="light"
              className="mt-2 text-pandora-green hover:text-pandora-green-dark transition-colors"
               onClick={() => {
                setIsLogin(!isLogin);
                setPasswordErrors([]);
              }}
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
