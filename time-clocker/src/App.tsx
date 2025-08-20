import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AdminDashboard from "./pages/admin-dashboard";
import UserDashboard from "./pages/user-dashboard";
import './index.css'

function App() {

  return (
    <>
      <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow p-4 flex gap-4">
          <Link to="/admin" className="text-blue-600 font-semibold">Admin Dashboard</Link>
          <Link to="/user" className="text-green-600 font-semibold">User Dashboard</Link>
        </nav>
        <div className="p-6">
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </>
  )
}

export default App
