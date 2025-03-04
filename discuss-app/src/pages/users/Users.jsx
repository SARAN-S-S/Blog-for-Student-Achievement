import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../../components/BarChart/BarChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./users.css";

const UsersPage = () => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/api/stats/users");
      setStudentsCount(res.data.students || 0);
      setAdminsCount(res.data.admins || 0);
      setUsers(res.data.users || []);
    };
    fetchData();
  }, []);

  const totalUsers = studentsCount + adminsCount;
  const studentsPercentage = totalUsers > 0 ? ((studentsCount / totalUsers) * 100).toFixed(2) : 0;
  const adminsPercentage = totalUsers > 0 ? ((adminsCount / totalUsers) * 100).toFixed(2) : 0;

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the filtered users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="usersPage">
      <h1>User Statistics</h1>

      <span><h2>Users Counts</h2></span>
      {/* Count Grid Section */}
      <div className="chartInfo">
        {/* Total Users Count */}
        <div className="countContainer">
          <h3>Total Users</h3>
          <div className="countValue">{totalUsers || 0}</div>
        </div>

        {/* Students Count */}
        <div className="countContainer">
          <h3>Students</h3>
          <div className="countValue">{studentsCount || 0}</div>
          <div className="percentage">{studentsPercentage}%</div>
        </div>

        {/* Admins Count */}
        <div className="countContainer">
          <h3>Admins</h3>
          <div className="countValue">{adminsCount || 0}</div>
          <div className="percentage">{adminsPercentage}%</div>
        </div>
      </div>

      {/* BarChart Section */}
      <div className="barChartContainer">
        <span><h2>Users Percentage Charts</h2></span>
        <BarChart
          data={[studentsPercentage, adminsPercentage]}
          labels={["Students", "Admins"]}
          title="User Count"
          backgroundColor={["#36a2eb", "#ff6384"]}
          borderColor={["#36a2eb", "#ff6384"]}
        />
      </div>

      <div className="boxgrid">
        
        <div className="searchBar">
          <FontAwesomeIcon icon={faSearch} className="searchIcon" />
          <input
            type="text"
            placeholder="Search by username or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* User Table */}
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Posts</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.email}>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.postCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
