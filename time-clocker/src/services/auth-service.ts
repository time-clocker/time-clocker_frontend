export type LoginRequest = {
  email: string;
  password: string;
  returnSecureToken?: boolean;
};

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const TOKEN_KEY = "authToken";
const ROLE_KEY = "role";
const USER_DATA_KEY = "userData";

export const authService = {
  async login(data: LoginRequest) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json" 
      },
      body: JSON.stringify({ ...data, returnSecureToken: true }),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Login failed");
    }
    
    const loginData = await res.json();
    const token = loginData?.idToken;
    
    if (!token) throw new Error("No idToken received from backend");
    
    localStorage.setItem(TOKEN_KEY, token);
    
    try {
      const me = await this.getMe();
      const role = (me?.role ?? me?.claims?.role ?? "employee") as string;
      localStorage.setItem(ROLE_KEY, role);
      
      try {
        const employeeProfile = await this.getEmployeeProfile();

        const userData = {
          ...employeeProfile,
          role: role 
        };
        
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        
        return { 
          token, 
          role,
          user: userData,
          refreshToken: loginData.refreshToken,
          expiresIn: loginData.expiresIn
        };
        
      } catch (profileError) {
        return { 
          token, 
          role,
          refreshToken: loginData.refreshToken,
          expiresIn: loginData.expiresIn
        };
      }
      
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      throw new Error("Login successful but failed to fetch user role and data");
    }
  },

  async getEmployeeProfile(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");
    
    const res = await fetch(`${API}/employees/me/profile`, {
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json" 
      },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        this.logout();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error("Failed to fetch employee profile");
    }
    
    return res.json();
  },

  async getMe(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");
    
    const res = await fetch(`${API}/auth/me`, {
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json" 
      },
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

  getUserData() {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  getUserName() {
    const userData = this.getUserData();
    return userData?.full_name || userData?.name || 'Usuario';
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },
  
  getAuthorizationHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { "Authorization": `Bearer ${token}` } : {};
  }
};