import { Button } from "@tremor/react";

interface AuthSubmitButtonProps {
  isLogin: boolean;
}

export const AuthSubmitButton = ({ isLogin }: AuthSubmitButtonProps) => (
  <Button
    type="submit"
    className="w-full rounded-lg bg-gradient-to-r from-pandora-yellow to-orange-400 hover:from-pandora-yellow-dark hover:to-orange-500 text-white font-semibold py-3 px-6 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
    size="xl"
  >
    <span className="flex items-center justify-center">
      {isLogin ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Iniciar Sesión
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Crear Cuenta
        </>
      )}
    </span>
  </Button>
);