import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass =
    "px-4 py-2 rounded hover:bg-gray-700 transition";

  const activeClass =
    "bg-gray-900";

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <h1 className="font-bold text-lg">
          ERP System
        </h1>
        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Sales
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Products
        </NavLink>
        <NavLink
          to="/ledger"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Ledger
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <span className="text-sm">
          {user?.name} ({user?.role})
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
