import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function AccountPage() {
  const [user, setUser] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUser(token);
      setUser(data);
    }
    loadUser();
  }, [token]);

  if (!user) return <p>Loading account...</p>;

  return (
    <div>
      <h2>My Account</h2>
      <table border={1}>
        <thead>
          <tr>
            <td>ID</td>
            <td>Name</td>
            <td>Email</td>
            <td>Role</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AccountPage;