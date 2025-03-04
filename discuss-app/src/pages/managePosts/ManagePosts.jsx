import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./managePosts.css";

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  // Wrap fetchPosts with useCallback to prevent unnecessary re-creations
  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`/api/posts?search=${search}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }, [search]); // Dependency: search

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, currentPage]); // Include fetchPosts & currentPage as dependencies

  const handleBulkDelete = async () => {
    try {
      await axios.post("/api/posts/bulk-delete", { postIds: selectedPosts });
      fetchPosts();
      setSelectedPosts([]); // Clear selected posts after deletion
    } catch (err) {
      console.error("Error deleting posts:", err);
    }
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="managePosts">
      <h1>Manage Posts</h1>
      <div className="container">
      <div className="searchContainer">
        <div className="searchWrapper">
          <FontAwesomeIcon icon={faSearch} className="searchIcon" />
          <input
            type="text"
            placeholder="Search by title, username, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          </div>
          <button className="bulkDeleteButton" onClick={handleBulkDelete}>
            Bulk Delete
          </button>
        </div>


        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Title</th>
              <th>Author</th>
              <th>Email</th>
              <th>Date</th>
              <th>Category</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((post) => (
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
                <td>{post.email}</td>
                <td>{new Date(post.createdAt).toDateString()}</td>
                <td>{post.tags[0]}</td>
                <td>{post.photo ? "Image" : "No Image"}</td>
                <td>
                  <Link to={`/post/${post._id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastPost >= posts.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
