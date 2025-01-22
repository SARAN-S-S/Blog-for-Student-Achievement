import { Link } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebarItem">
        <Link className="link" to="/about">
          <span className="sidebarTitle"><b><i>ABOUT STUDENT ACHIEVEMENTS</i></b></span>
        </Link>
        <img
          className="sidebarImg"
          src="\achievement.jpg"
          alt=""
        />
        <p>
          Welcome to our Student Achievement Blog, a space dedicated to celebrating the incredible accomplishments of students. Here, we showcase inspiring stories, milestones, and achievements that highlight their hard work and determination. Whether it's academic excellence, sports victories, or community contributions, this blog is a testament to the limitless potential of students. Explore these inspiring stories and join us in applauding the efforts and successes of young achievers.
        </p>
      </div>
    </div>
  );
}
