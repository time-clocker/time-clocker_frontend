import { Button } from "@tremor/react";
import { useNavigate, useLocation } from "react-router-dom";
import flameIcon from "../assets/flame-icon.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

   const handleLogoClick = () => {
    navigate('/user');
  };

  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-pandora-green shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <img
                src={flameIcon}
                alt="WorkTime Logo"
                className="h-12 w-12"
              />
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Button
                variant={location.pathname === '/user' ? 'primary' : 'secondary'}
                onClick={() => handleNavigate('/user')}
                className="text-white rounded-lg"
              >
                Mi Dashboard
              </Button>
              <Button
                variant={location.pathname === '/admin' ? 'primary' : 'secondary'}
                onClick={() => handleNavigate('/admin')}
                className="text-white rounded-lg"
              >
                Admin Dashboard
              </Button>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="secondary" 
              onClick={handleLogout}
              className="text-white rounded-lg  hover:bg-red-700" 
              icon={() => (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              )}
            >
                Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Button
            variant={location.pathname === '/user' ? 'primary' : 'light'}
            onClick={() => handleNavigate('/user')}
            className="w-full justify-start rounded-lg"
          >
            Mi Dashboard
          </Button>
          <Button
            variant={location.pathname === '/admin' ? 'primary' : 'light'}
            onClick={() => handleNavigate('/admin')}
            className="w-full justify-start rounded-lg"
          >
            Admin Dashboard
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;