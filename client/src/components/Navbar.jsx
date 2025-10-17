import { Link } from "react-router-dom";
import './header.css'

function Navbar() {
  return (
    <nav style={{ padding: "1rem", backgroundColor: "#eee", textAlign: "center" }}>
      <Link to="/" style={{ margin: "0 10px" }}>Menu</Link>
      <Link to="/cart" style={{ margin: "0 10px" }}>Cart</Link>
      <Link to="/reserve" style={{ margin: "0 10px" }}>Reservations</Link>
      <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
      <Link to="/signup" style={{ margin: "0 10px" }}>Signup</Link>
    </nav>
  );
}

export default Navbar;
