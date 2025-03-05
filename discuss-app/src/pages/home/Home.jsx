import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/Sidebar";
import "./home.css";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 8;
  const { search } = useLocation();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/posts" + search);
        setPosts(res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [search]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFirstPage = () => {
    if (currentPage > 1) setCurrentPage(1);
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) setCurrentPage(totalPages);
  };

  return (
    <>
      <Header />
      <div className="home">
        <div className="posts-container">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <Posts posts={currentPosts} />
          )}

          {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={handleFirstPage} disabled={currentPage === 1} className="first-last-btn">
              First
            </button>
            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="prev-next-btn">
              Previous
            </button>

            {/* Display Only 3 Pages with Conditional Styling */}
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-number-btn ${
                    page === currentPage
                      ? "active-page"    // Current page style
                      : "adjacent-page"  // Adjacent pages style
                  }`}
                >
                  {page}
                </button>
              ))}

            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="prev-next-btn">
              Next
            </button>
            <button onClick={handleLastPage} disabled={currentPage === totalPages} className="first-last-btn">
              Last
            </button>
          </div>

          {/* Page Info Container */}
          <div className="page-info-container">
            <span style={{ margin: "0 10px" }}>Page {currentPage} of {totalPages}</span>
          </div>

        </div>
        <Sidebar />
      </div>
    </>
  );
}
