import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import "./topbar.css";

export default function TopBar() {
  const { user, dispatch } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login"); // Redirect to login after logout
  };

  if (!user) return null; // If no user is logged in, return nothing

  return (
    <div className="top">
      <div className="topLeft">
        <Link className="link" to="/about">
          <i className="fa-solid fa-graduation-cap"></i>
          <span className="profile-text"><b>AchieveHub</b></span>
        </Link>
        <ul className="topList"> {/* Moved topCenter contents here */}
          <li className="topListItem">
            <Link className="link" to="/">
              Home
            </Link>
          </li>
          <li className="topListItem">
            <Link className="link" to="/about">
              About
            </Link>
          </li>
          <li className="topListItem">
            <Link className="link" to="/contact">
              Contact
            </Link>
          </li>
          <li className="topListItem">
            <Link className="link" to="/write">
              Post
            </Link>
          </li>
        </ul>
      </div>
      <div className="topRight">
        <ul>
          <li>
            <Link to="/settings">
              <img
                className="topImg"
                src={user.profilePic ? `/images/${user.profilePic}` : "/profile.jpg"}
                alt="Profile"
              />
            </Link>
          </li>
          <li className="topListItem">
            <Link className="link" to="/settings">
              {user.username}
            </Link>
          </li>
          <li className="topListItem">
            <span className="link" onClick={handleLogout} style={{ cursor: "pointer" }}>
              Logout
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
