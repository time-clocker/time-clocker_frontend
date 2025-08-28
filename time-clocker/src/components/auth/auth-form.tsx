import { Select, SelectItem, Text } from "@tremor/react";
import { AuthInputField } from "./auth-input-field";
import { AuthSubmitButton } from "./auth-submit-button";
import { UserIcon, DocumentIcon, EmailIcon, PasswordIcon, ConfirmIcon } from "./icons/auth-icons";
import { type AuthFormProps, documentTypes } from "../../types/auth";

export const AuthForm = ({
  isLogin,
  formData,
  handleInputChange,
  handleSelectChange,
  handleSubmit,
  isLoading = false,
}: AuthFormProps & { isLoading?: boolean }) => {
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      handleInputChange(e);
    }
  };

  const commonInputProps = {
    onChange: handleInputChange,
    required: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isLogin && (
        <>
          <AuthInputField
            {...commonInputProps}
            label="Nombre completo"
            name="name"
            type="text"
            placeholder="Ingresa tu nombre completo"
            value={formData.name}
            icon={<UserIcon />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <Text className="mb-2 text-gray-700 font-medium">Tipo de documento</Text>
              <Select
                value={formData.typeDocument}
                onValueChange={(value) => handleSelectChange("typeDocument", value)}
                required
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
              {...commonInputProps}
              label="Número de documento"
              name="documentNumber"
              type="text"
              placeholder="1234567890"
              value={formData.documentNumber}
              onChange={handleNumberInput}
              icon={<DocumentIcon />}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </>
      )}

      <AuthInputField
        {...commonInputProps}
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="tu.email@ejemplo.com"
        value={formData.email}
        icon={<EmailIcon />}
      />

      <AuthInputField
        {...commonInputProps}
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        icon={<PasswordIcon />}
      />

      {!isLogin && (
        <AuthInputField
          {...commonInputProps}
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          icon={<ConfirmIcon />}
        />
      )}

      <AuthSubmitButton isLogin={isLogin} isLoading={isLoading} />
    </form>
  );
};
