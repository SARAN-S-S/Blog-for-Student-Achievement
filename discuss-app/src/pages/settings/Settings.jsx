import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Context } from "../../context/Context";
import "./settings.css";
import Sidebar from "../../components/sidebar/Sidebar";

export default function Settings() {
  const { user, dispatch } = useContext(Context);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);

  // Synchronize local state with the updated user object
  useEffect(() => {
    setUsername(user.username);
  }, [user.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch({ type: "UPDATE_START" });
    const updatedUser = {
      userId: user._id,
      username,
      password: user.role === "admin" ? password : undefined,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      updatedUser.profilePic = filename;
      try {
        await axios.post("/api/upload", data);
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }

    try {
      const res = await axios.put(`/api/users/${user._id}`, updatedUser);
      setSuccess(true);

      // Update the user in the context with the new data
      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });

      // Clear the form fields
      setUsername(res.data.username);
      setPassword("");
      setFile(null);
    } catch (err) {
      setSuccess(false);
      dispatch({ type: "UPDATE_FAILURE" });
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="settings">
      <div className="settingsWrapper">
        <div className="settingsTitle">
          <span className="settingsUpdateTitle">Update Your Account</span>
        </div>
        <form className="settingsForm" onSubmit={handleSubmit}>
          <label>Profile Picture</label>
          <div className="settingsPP">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : user.profilePic
                  ? `/images/${user.profilePic}`
                  : "/profile.jpg"
              }
              alt=""
            />
            <label htmlFor="fileInput">
              <i className="settingsPPIcon fa-regular fa-circle-user"></i>
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <label>User Details</label>
          <br></br>

          <label>Email</label>
          <input
            type="email"
            value={user.email}
            readOnly
            style={{ fontWeight: 'bold' }}
          />

          <label>Username</label>
          <input
            type="text"
            placeholder={user.username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {user.role === "admin" && (
            <>
              <label>Password</label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}
          <button className="settingsSubmit" type="submit">
            Update
          </button>
          {success && (
            <span style={{ color: "green", textAlign: "center" }}>
              Profile updated successfully!
            </span>
          )}
        </form>
      </div>

      <Sidebar />
    </div>
  );
}