import { Card, Title, TextInput, Button, Text, Divider } from "@tremor/react";
import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-xl shadow-xl border-0">
          <Title className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Title>
          <Text className="text-center text-gray-600 mb-6">
            {isLogin ? "Ingresa a tu cuenta" : "Regístrate para comenzar"}
          </Text>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Text className="mb-1 text-gray-700">Nombre completo</Text>
                <TextInput
                  name="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="rounded-lg"
                />
              </div>
            )}

            <div>
              <Text className="mb-1 text-gray-700">Correo electrónico</Text>
              <TextInput
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="rounded-lg"
              />
            </div>

            <div>
              <Text className="mb-1 text-gray-700">Contraseña</Text>
              <TextInput
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="rounded-lg"
              />
            </div>

            {!isLogin && (
              <div>
                <Text className="mb-1 text-gray-700">Confirmar contraseña</Text>
                <TextInput
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="rounded-lg"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 border-0 transition-colors"
              size="xl"
            >
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>
          </form>

          <Divider className="my-6">o</Divider>

          <div className="text-center">
            <Text className="text-gray-600">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            </Text>
            <Button
              variant="light"
              className="mt-2 text-blue-500 hover:text-blue-700 transition-colors"
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