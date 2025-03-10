import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle, faTimesCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import "./approvalPending.css";

export default function ApprovalPending() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectionReason, setRejectionReason] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const postsPerPage = 10;

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/posts/pending?page=${currentPage}&limit=${postsPerPage}`);
      setPosts(res.data.posts);

      // Ensure total is a valid number and greater than 0
      const total = res.data.total || 0;
      setTotalPages(Math.ceil(total / postsPerPage) || 1); // Default to 1 if total is 0
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setSelectedPosts([]);
  }, [currentPage]);

  const handleApprove = async (postId) => {
    try {
      await axios.put(`/api/posts/approve/${postId}`);
      fetchPosts();
    } catch (err) {
      console.error("Error approving post:", err);
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedPosts.map((postId) => axios.put(`/api/posts/approve/${postId}`)));
      fetchPosts();
      setSelectedPosts([]);
    } catch (err) {
      console.error("Error bulk approving posts:", err);
    }
  };

  const handleReject = async (postId) => {
    if (!rejectionReason[postId]) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.put(`/api/posts/reject/${postId}`, { reason: rejectionReason[postId] });
      setRejectionReason((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      console.error("Error rejecting post:", err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.username?.toLowerCase().includes(search.toLowerCase()) ||
      post.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="approvalPending">
      <h1>Pending Posts</h1>
      <div className="container">
        <div className="searchContainer">
          <div className="searchWrapper">
            <FontAwesomeIcon icon={faSearch} className="searchIcon" />
            <input
              type="text"
              placeholder="Search by title, username, or email"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button
            className="bulkApproveButton"
            onClick={handleBulkApprove}
            disabled={selectedPosts.length === 0}
          >
            Bulk Approve ({selectedPosts.length})
          </button>
        </div>

        {isLoading ? (
          <div className="loadingContainer">
            <p className="loadingMessage">Loading posts...</p>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="tableContainer">
              <table>
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
                    <th>Review</th>
                    <th>Approve</th>
                    <th>Reject</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post._id)}
                          onChange={(e) => {
                            setSelectedPosts((prev) =>
                              e.target.checked
                                ? [...prev, post._id]
                                : prev.filter((id) => id !== post._id)
                            );
                          }}
                        />
                      </td>
                      <td>{post.title}</td>
                      <td>{post.username}</td>
                      <td>{post.email}</td>
                      <td>{new Date(post.createdAt).toDateString()}</td>
                      <td>{post.tags[0]}</td>
                      <td>{post.tags[1]}</td>
                      <td>{post.photo ? "Image" : "No Image"}</td>
                      <td>
                        <Link to={`/review-post/${post._id}`} className="actionLink">
                          <FontAwesomeIcon icon={faEye} /> Review
                        </Link>
                      </td>
                      <td>
                        <span className="actionButton approveButton" onClick={() => handleApprove(post._id)}>
                          <FontAwesomeIcon icon={faCheckCircle} /> Approve
                        </span>
                      </td>
                      <td>
                        <span className="actionButton rejectButton" onClick={() => handleReject(post._id)}>
                          <FontAwesomeIcon icon={faTimesCircle} /> Reject
                        </span>
                      </td>
                      <td>
                        <textarea
                          placeholder="Reason for rejection"
                          value={rejectionReason[post._id] || ""}
                          onChange={(e) =>
                            setRejectionReason({ ...rejectionReason, [post._id]: e.target.value })
                          }
                          className="reasonTextarea" required
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paginationContainer">
              <button
                className="paginationButton"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pageInfo">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="paginationButton"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}