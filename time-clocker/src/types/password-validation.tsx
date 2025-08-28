export interface PasswordValidationProps {
  password: string;
}

export type ValidationRule = {
  test: (password: string) => boolean;
  message: string;
};