import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../services/auth-service";

export function RequireAuth() {
  const token = authService.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireRole({ role }: { role: "admin" | "employee" }) {
  const token = authService.getToken();
  if (!token) return <Navigate to="/login" replace />;

  const userRole = (authService.getRole() as "admin" | "employee" | null) ?? "employee";
  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/user" replace />;
  }
  return <Outlet />;
}
