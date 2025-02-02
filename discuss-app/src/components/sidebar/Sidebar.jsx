import { Link } from "react-router-dom";
import "./sidebar.css";
import Category from "../category/Category";

export default function Sidebar() {
  return (
    <div className="sidebarWrapper">
      {/* Sidebar Container */}
      <div className="sidebar">
        <div className="sidebarItem">
          <Link className="link" to="/about">
            <span className="sidebarTitle"><b><i>ABOUT STUDENT ACHIEVEMENTS</i></b></span>
          </Link>
          <img className="sidebarImg" src="/achievement.jpg" alt="Achievement" />
          <p>
            Welcome to our Student Achievement Blog, a space dedicated to celebrating the incredible accomplishments of students. Here, we showcase inspiring stories, milestones, and achievements that highlight their hard work and determination.
          </p>
        </div>
      </div>

      {/* Category Container (Now Outside Sidebar) */}
      <div className="categoryContainer">
        <Category />
      </div>
    </div>
  );
}
