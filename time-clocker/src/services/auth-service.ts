import type { LoginRequest, RegisterRequest } from "../types/auth";

import { API, JSON_HEADERS, ROLE_KEY, TOKEN_KEY, USER_DATA_KEY } from "../constants/auth-service";

async function handleResponse(res: Response, errorMsg: string) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || errorMsg);
  }
  return res.json();
}

function saveUserData(data: any, role: string) {
  const userData = { ...data, role };
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  return userData;
}

export const authService = {
  async login(data: LoginRequest) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ ...data, returnSecureToken: true }),
    });

    const loginData = await handleResponse(res, "Login failed");
    const token = loginData?.idToken;

    if (!token) throw new Error("No idToken received from backend");
    localStorage.setItem(TOKEN_KEY, token);

    try {
      const me = await this.getMe();
      const role = (me?.role ?? me?.claims?.role ?? "employee") as string;
      localStorage.setItem(ROLE_KEY, role);

      try {
        const employeeProfile = await this.getEmployeeProfile();
        const userData = saveUserData(employeeProfile, role);

        return {
          token,
          role,
          user: userData,
          refreshToken: loginData.refreshToken,
          expiresIn: loginData.expiresIn,
        };
      } catch {
        return {
          token,
          role,
          refreshToken: loginData.refreshToken,
          expiresIn: loginData.expiresIn,
        };
      }
    } catch {
      this.logout();
      throw new Error(
        "Login successful but failed to fetch user role and data"
      );
    }
  },

  async register(data: RegisterRequest) {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    const registerData = await handleResponse(res, "Registration failed");
    const token = registerData?.idToken;
    if (token) localStorage.setItem(TOKEN_KEY, token);

    return registerData;
  },

  async getEmployeeProfile(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API}/employees/me/profile`, {
      headers: { ...this.getAuthorizationHeader(), Accept: "application/json" },
    });

    if (res.status === 401) {
      this.logout();
      throw new Error("Session expired. Please login again.");
    }

    return handleResponse(res, "Failed to fetch employee profile");
  },

  async getMe(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API}/auth/me`, {
      headers: { ...this.getAuthorizationHeader(), Accept: "application/json" },
    });

    return handleResponse(res, "Session invalid or expired");
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRole() {
    return localStorage.getItem(ROLE_KEY);
  },

  getUserData() {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  getUserName() {
    const userData = this.getUserData();
    return userData?.full_name || userData?.name || "Usuario";
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  getAuthorizationHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
