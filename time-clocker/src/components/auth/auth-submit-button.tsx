import { Button } from "@tremor/react";

interface AuthSubmitButtonProps {
  isLogin: boolean;
  isLoading?: boolean;
}

export const AuthSubmitButton = ({ isLogin, isLoading = false }: AuthSubmitButtonProps) => {
  return (
    <Button
      type="submit"
      className="w-full rounded-lg bg-gradient-to-r from-pandora-yellow to-orange-400 hover:from-pandora-yellow-dark hover:to-orange-500 text-white font-semibold py-3 px-6 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
    size="xl"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Procesando...
        </div>
      ) : (
        isLogin ? "Iniciar Sesión" : "Crear Cuenta"
      )}
    </Button>
  );
};