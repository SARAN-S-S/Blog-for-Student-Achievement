import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import "./topbar.css";

export default function TopBar() {
  const { user, dispatch } = useContext(Context);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu toggle

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu state
  };

  if (!user) return null;

  return (
    <div className="top">
      <div className="topLeft">
        <Link className="link" to="/about">
          <i className="fa-solid fa-graduation-cap"></i>
          <span className="profile-text"><b>AchieveHub</b></span>
        </Link>
        {/* Hamburger Menu Icon */}
        <i className="fa-solid fa-bars menuIcon" onClick={toggleMenu}></i>
        <ul className={`topList ${isMenuOpen ? "active" : ""}`}>
          <Link className="link" to={user.role === "admin" ? "/dashboard" : "/"}>
            <li className="topListItem">Home</li>
          </Link>
          <Link className="link" to="/about">
            <li className="topListItem">About</li>
          </Link>
          <Link className="link" to="/contact">
            <li className="topListItem">Contact</li>
          </Link>
          <Link className="link" to="/write">
            <li className="topListItem">Post</li>
          </Link>
          <Link className="link" to="/my-posts">
            <li className="topListItem">My Posts</li>
          </Link>
        </ul>
      </div>
      <div className="topRight">
        <ul>
          <Link to="/settings">
            <li>
              <img
                className="topImg"
                src={user.profilePic ? user.profilePic : "/profile.jpg"}
                alt="Profile"
              />
            </li>
          </Link>
          <Link className="link" to="/settings">
            <li className="topListItem">{user.username}</li>
          </Link>
          <li className="topListItem" onClick={handleLogout} style={{ cursor: "pointer" }}>
            Logout
          </li>
        </ul>
      </div>
    </div>
  );
}