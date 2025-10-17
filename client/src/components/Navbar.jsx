import { NavLink } from 'react-router-dom';
import './header.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>MENU</NavLink>
      <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>CART</NavLink>
      <NavLink to="/reserve" className={({ isActive }) => isActive ? 'active' : ''}>RESERVATION</NavLink>
      <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>LOGIN</NavLink>
      <NavLink to="/signup" className={({ isActive }) => isActive ? 'active' : ''}>SIGNUP</NavLink>
    </nav>
  );
}

export default Navbar;