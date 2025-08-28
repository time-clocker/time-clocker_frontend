import { authService } from "./auth-service";
import { API } from "../constants/auth-service";

type HeadersMap = Record<string, string>;

function buildHeaders(extra?: HeadersMap): HeadersMap {
  const authHeader = authService.getAuthorizationHeader?.() ?? {};
  return {
    Accept: "application/json",
    ...authHeader,
    ...(extra ?? {}),
  };
}

export const employeeService = {
  async getEmployee(employeeId: string) {
    const res = await fetch(`${API}/employees/${employeeId}`, {
      method: "GET",
      headers: buildHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Error al obtener empleado (${res.status})`);
    }
    return res.json(); 
  },

  async updateEmployee(employeeId: string, payload: Record<string, unknown>) {
    const res = await fetch(`${API}/employees/${employeeId}`, {
      method: "PATCH",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Error al actualizar empleado (${res.status})`);
    }
    return res.json();
  },

  async deleteEmployee(employeeId: string) {
    const res = await fetch(`${API}/employees/${employeeId}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Error al eliminar empleado");
    }
    return true;
  },
};
