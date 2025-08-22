import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AdminDashboard from "./pages/admin-dashboard";
import UserDashboard from "./pages/user-dashboard";
import './index.css'
import AuthPage from "./pages/auth-page";
import FlameIcon from "./assets/flame_icon.png";

function App() {

  return (
    <>
      <BrowserRouter>
      <div className="min-h-screen bg-gray-100 ">
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/login" element={<AuthPage />} />
          </Routes>
      </div>
    </BrowserRouter>
    </>
  )
}

export default App
