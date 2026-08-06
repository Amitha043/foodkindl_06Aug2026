import { ChefHat, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="site-header">
      <Link to="/" className="navbar-logo">
    <img
        src="public/images/icon.png"
        alt="FoodKindl"
    />
</Link>

      <button className="mobile-menu-button" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? "nav open" : "nav"}>
        <a href="/#connect" onClick={close}>Connect</a>
        {/* <a href="/#food-service" onClick={close}>Food Service</a> */}
        {/* <a href="/#products" onClick={close}>Products</a> */}
        {/* <a href="/#waitlist" onClick={close}>Join Waitlist</a> */}

        {user ? (
          <>
            <Link to="/dashboard" onClick={close}>Dashboard</Link>
            <button className="nav-button" onClick={() => { logout(); close(); }}>Logout</button>
          </>
        ) : (
          <Link className="launch-button" to="/login" onClick={close}>
            Launch App
          </Link>
        )}
      </nav>
    </header>
  );
}
