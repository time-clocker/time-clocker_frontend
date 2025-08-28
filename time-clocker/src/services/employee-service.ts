import { authService } from "./auth-service";

const API = import.meta.env.VITE_API_URL ?? "https://time-clocker-backend.onrender.com";

export const employeeService = {
  async deleteEmployee(employeeId: string) {
    const headers = {
      "Accept": "application/json",
      ...authService.getAuthorizationHeader()
    };

    const res = await fetch(`${API}/employees/${employeeId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Error al eliminar empleado");
    }
    return true;
  }
};
