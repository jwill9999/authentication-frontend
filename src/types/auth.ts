export interface User {
  id?: string;
  email: string;
  name?: string;
}

export interface ApiMessageFields {
  // Canonical user-facing error/message field for new backend responses
  message?: string;
  // Legacy/backward-compatible alias used by some existing endpoints
  error?: string;
}

export interface AuthResponse extends ApiMessageFields {
  success: boolean;
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

export interface RefreshResponse extends ApiMessageFields {
  success: boolean;
  token?: string;
}
