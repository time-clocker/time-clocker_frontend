import { Select, SelectItem, Text } from "@tremor/react";
import { AuthInputField } from "./auth-input-field";
import { AuthSubmitButton } from "./auth-submit-button";
import { 
  UserIcon, 
  DocumentIcon, 
  EmailIcon, 
  PasswordIcon, 
  ConfirmIcon 
} from "./icons/auth-icons";
import { type AuthFormProps, documentTypes } from "../../types/auth";

export const AuthForm = ({
  isLogin,
  formData,
  handleInputChange,
  handleSelectChange,
  handleSubmit
}: AuthFormProps) => {

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      handleInputChange(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isLogin && (
        <>
          <AuthInputField
            label="Nombre completo"
            name="name"
            type="text"
            placeholder="Ingresa tu nombre completo"
            value={formData.name}
            onChange={handleInputChange}
            required={!isLogin}
            icon={<UserIcon />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <Text className="mb-2 text-gray-700 font-medium">Tipo de documento</Text>
              <Select
                value={formData.typeDocument}
                onValueChange={(value) => handleSelectChange("typeDocument", value)}
                required={!isLogin}
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
              >
                {documentTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="bg-white hover:bg-blue-50 text-gray-700 transition-colors duration-150"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <AuthInputField
              label="Número de documento"
              name="documentNumber"
              type="text"
              placeholder="1234567890"
              value={formData.documentNumber}
              onChange={handleNumberInput}
              required={!isLogin}
              icon={<DocumentIcon />}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </>
      )}
      
      <AuthInputField
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="tu.email@ejemplo.com"
        value={formData.email}
        onChange={handleInputChange}
        required
        icon={<EmailIcon />}
      />

      <AuthInputField
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleInputChange}
        required
        icon={<PasswordIcon />}
      />

      {!isLogin && (
        <AuthInputField
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required={!isLogin}
          icon={<ConfirmIcon />}
        />
      )}

      <AuthSubmitButton isLogin={isLogin} />
    </form>
  );
};