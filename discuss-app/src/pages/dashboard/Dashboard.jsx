import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import {
  Users,
  FileText,
  Clock,
  Settings2,
  BarChart3,
  Filter,
} from "lucide-react";
import "./dashboard.css";

export default function Dashboard() {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  const menuItems = [
    { title: "Total Students", icon: <Users size={40} />, route: "/users" },
    { title: "Total Posts", icon: <FileText size={40} />, route: "/allposts" },
    { title: "Approval Pending", icon: <Clock size={40} />, route: "/approval-pending" },
    { title: "Manage Posts", icon: <Settings2 size={40} />, route: "/manageposts" },
    { title: "Statistics", icon: <BarChart3 size={40} />, route: "/statistics" },
    { title: "Filter Posts", icon: <Filter size={40} />, route: "/filter-posts" },
  ];

  return (
    <div className="dashboard">
      <div className="background-animation"></div>
      <h1>Admin Dashboard</h1>
      <div className="dashboardGrid">
        {menuItems.map((item, index) => (
          <div key={index} className="card" onClick={() => navigate(item.route)}>
            <div className="icon">{item.icon}</div>
            <h2>{item.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
