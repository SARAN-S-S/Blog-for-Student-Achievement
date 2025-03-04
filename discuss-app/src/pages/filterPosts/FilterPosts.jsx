import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Posts from "../../components/posts/Posts";
import "./filterPosts.css";

export default function FilterPosts() {
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/posts?category=${category}&year=${year}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    }
    setLoading(false);
  }, [category, year]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="filterPosts">
      <span className="head"><h2>FILTER POSTS</h2></span>
      
      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="Project">Project</option>
          <option value="Patent">Patent</option>
          <option value="Paper">Paper</option>
          <option value="Journal">Journal</option>
          <option value="Competition">Competition</option>
        </select>
        
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
          <option value="Third Year">Third Year</option>
          <option value="Final Year">Final Year</option>
        </select>
      </div>

      {loading ? (
        <div className="message-container">
          <p className="loading">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="message-container">
          <p className="error">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="message-container">
          <p className="no-posts">No posts found for this category and year.</p>
        </div>
      ) : (
        <div className="postsContainer">
          <Posts posts={posts} />
        </div>
      )}

    </div>
  );
}
