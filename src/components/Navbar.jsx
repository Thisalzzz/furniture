import { Link } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Navbar() {
  const handleLogout = () => {
    logout();
    window.location.reload(); // Refresh to clear state
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/room-input" className="text-gray-700 hover:text-blue-600">
            Room Setup
          </Link>
          <Link to="/canvas" className="text-gray-700 hover:text-blue-600">
            Design Canvas
          </Link>
          <Link to="/designs" className="text-gray-700 hover:text-blue-600">
            My Designs
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}