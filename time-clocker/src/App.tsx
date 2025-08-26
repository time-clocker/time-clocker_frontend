import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admin-dashboard";
import UserDashboard from "./pages/user-dashboard";
import "./index.css";
import AuthPage from "./pages/auth-page";
import Navbar from "./components/navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { RequireAuth, RequireRole } from "./routes/guards";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/user" element={<UserDashboard />} />
            </Route>
            <Route element={<RequireRole role="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
