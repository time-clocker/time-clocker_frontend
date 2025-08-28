import { authService } from "./auth-service";
import { API } from "../constants/auth-service";

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
