import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "1rem", backgroundColor: "#eee", textAlign: "center" }}>
      <Link to="/" style={{ margin: "0 10px" }}>Home</Link>
      <Link to="/about" style={{ margin: "0 10px" }}>About</Link>
      <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
      <Link to="/signup" style={{ margin: "0 10px" }}>Signup</Link>
      <Link to="/profession" style={{ margin: "0 10px" }}>Profession</Link>
    </nav>
  );
}

export default Navbar;
