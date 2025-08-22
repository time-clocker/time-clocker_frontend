import { Card, Title, Button, Text, Divider } from "@tremor/react";
import { useState } from "react";
import { AuthForm } from "../components/auth/auth-form";

import PANDORA from "../assets/PANDORA.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    typeDocument: "Cédula de ciudadanía", 
    documentNumber: "", 
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Login attempt:", { email: formData.email, password: formData.password });
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      console.log("Register attempt:", formData);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-pandora-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className=" bg-white rounded-xl shadow-xl border-0">
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <img
              src={PANDORA}
              alt="Logo PANDORA"
              className="h-40 w-auto mb-4"
            />
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Al {isLogin ? "iniciar sesión" : "registrarte"}, aceptas nuestros Términos y Condiciones</p>
        </div>
      </div>
    </div>
  );
}