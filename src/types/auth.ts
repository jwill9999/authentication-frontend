export interface User {
  id?: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: User;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  api?: string;
}
