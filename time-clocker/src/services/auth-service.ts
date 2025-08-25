export type LoginRequest = {
  email: string;
  password: string;
  returnSecureToken?: boolean;
};

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "authToken";
const ROLE_KEY = "role";

export const authService = {
  async login(data: LoginRequest) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...data, returnSecureToken: true }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Login failed");
    }
    const json = await res.json();
    const token = json?.idToken as string;
    if (!token) throw new Error("No idToken from backend");
    localStorage.setItem(TOKEN_KEY, token);
    const me = await this.getMe();
    const role = (me?.role ?? me?.claims?.role ?? "employee") as string;
    localStorage.setItem(ROLE_KEY, role);

    return { token, role };
  },

  async getMe(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Session invalid or expired");
    return res.json();
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRole() {
    return localStorage.getItem(ROLE_KEY);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
  getAuthorizationHeader(): Record<string, string | undefined> {
  const token = this.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
  }

};
