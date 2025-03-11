import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye, faTrash, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import "./myPosts.css";

export default function MyPosts() {
  const { user } = useContext(Context);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`/api/posts/my-posts?username=${user.username}&page=${currentPage}&limit=${postsPerPage}&search=${search}`);
      setPosts(res.data.posts);
      setTotalPosts(res.data.total);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }, [user, currentPage, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleBulkDelete = async () => {
    try {
      await axios.post("/api/posts/bulk-delete", { postIds: selectedPosts });
      fetchPosts();
      setSelectedPosts([]);
    } catch (err) {
      console.error("Error deleting posts:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`, { data: { username: user.username } });
      fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <div className="mypostContainer">
      <h1 className="mypostTitle">My Posts</h1>
      <div className="mypostInnerContainer">
        <div className="mypostTotalPosts">
          <span>Total Posts: {totalPosts}</span>
        </div>

        <div className="mypostSearchContainer">
          <div className="mypostSearchWrapper">
            <FontAwesomeIcon icon={faSearch} className="mypostSearchIcon" />
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mypostSearchInput"
            />
          </div>
          <button className="mypostBulkDeleteButton" onClick={handleBulkDelete}>
            Bulk Delete
          </button>
        </div>

        <div className="mypostTableContainer">
          <table className="mypostTable">
            <thead>
              <tr>
                <th>Select</th>
                <th>Title</th>
                <th>Author</th>
                <th>Email</th>
                <th>Date</th>
                <th>Student Year</th>
                <th>Event Type</th>
                <th>Image</th>
                <th>Status</th>
                <th>Rejection Reason</th>
                <th>Review</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post._id]);
                        } else {
                          setSelectedPosts(selectedPosts.filter((id) => id !== post._id));
                        }
                      }}
                    />
                  </td>
                  <td>{post.title}</td>
                  <td>{post.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(post.createdAt).toDateString()}</td>
                  <td>{post.tags[0]}</td>
                  <td>{post.tags[1]}</td>
                  <td>{post.photo ? "Image" : "No Image"}</td>
                  <td className={`mypostStatus ${post.status}`}>{post.status}</td>
                  <td className="mypostRejectionReason">{post.rejectionReason || "N/A"}</td>
                  <td>
                    {post.status === "rejected" ? (
                      <Link className="writelink" to="/write">
                        <FontAwesomeIcon icon={faPlusCircle} /> Post
                      </Link>
                    ) : (
                      <Link to={`/post/${post._id}`} className="mypostActionLink">
                        <FontAwesomeIcon icon={faEye} /> Review
                      </Link>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(post._id)} className="mypostDeleteButton">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mypostPagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="mypostPageButton"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(totalPosts / postsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= Math.ceil(totalPosts / postsPerPage)}
          className="mypostPageButton"
        >
          Next
        </button>
      </div>
    </div>
  );
}