import React from "react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();
  return <h2>Welcome, {user?.email}! You are now logged in.</h2>;
}

export default Home;
