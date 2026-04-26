import { useEffect, useState } from "react";

import { artifyApi } from "../utils/artifyApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    artifyApi
      .getAdminUsers()
      .then((response) => setUsers(response.data.data || []))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBlock = async (user) => {
    await artifyApi.updateAdminUser(user._id, {
      isBlocked: !user.isBlocked,
    });
    loadUsers();
  };

  return (
    <div className="page-stack">
      <h1>User Management</h1>
      <div className="stack-list">
        {users.map((user) => (
          <div key={user._id} className="panel">
            <div className="inline-spread">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <p>Phone: {user.phone || "-"}</p>
            <button type="button" className="btn btn-outline" onClick={() => toggleBlock(user)}>
              {user.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
