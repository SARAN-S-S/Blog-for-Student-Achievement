import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./postForReview.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function PostForReview() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [file, setFile] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [initialPhoto, setInitialPhoto] = useState(null);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${postId}`);
        setPost(res.data);
        setTitle(res.data.title);
        setDesc(res.data.desc);
        setTags(res.data.tags);
        setInitialPhoto(res.data.photo || null);
        setLikes(res.data.likes || 0);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
    setLiked(likedPosts.includes(postId));
  }, [postId]);

  const handleApprove = async () => {
    try {
      await axios.put(`/api/posts/approve/${postId}`);
      navigate("/approval-pending");
    } catch (err) {
      console.error("Error approving post:", err);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      await axios.put(`/api/posts/reject/${postId}`, { reason: rejectionReason });
      navigate("/approval-pending");
    } catch (err) {
      console.error("Error rejecting post:", err);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();  // Prevents page reload
    try {
      const updatedPost = {
        title,
        desc,
        tags,
      };
  
      if (file) {
        const data = new FormData();
        const filename = Date.now() + file.name;
        data.append("name", filename);
        data.append("file", file);
        updatedPost.photo = filename;
        try {
          await axios.post("/api/upload", data);
        } catch (err) {
          console.error("Error uploading file:", err);
        }
      }
  
      await axios.put(`/api/posts/edit/${postId}`, updatedPost);
      setUpdateMode(false);
      setFile(null);
      setNewPhoto(null);
      setInitialPhoto(updatedPost.photo);
      setUpdateSuccess(true);  // Show success message
  
      setTimeout(() => setUpdateSuccess(false), 10000) // Hide message after 8 seconds
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };
  
  

  const handleActionSubmit = () => {
    if (action === "approve") {
      handleApprove();
    } else if (action === "reject") {
      if (!rejectionReason) {
        alert("Please provide a reason for rejection.");
        return;
      }
      handleReject();
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await axios.post(`/api/posts/${postId}/unlike`);
        setLikes(likes - 1);
        setLiked(false);
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts.filter((id) => id !== postId)));
      } else {
        await axios.post(`/api/posts/${postId}/like`);
        setLikes(likes + 1);
        setLiked(true);
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, postId]));
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <p className="loadingMessage">Loading posts...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="postForReview">
      <h1>Review the Post</h1>
      <div className="postForReviewWrapper">
        {updateMode ? (
          <form onSubmit={handleSave}>
          <div className="image-edit-section">
            {newPhoto ? (
              <img className="writeImg" src={newPhoto} alt="New Post Preview" />
            ) : initialPhoto ? (
              <img className="singlePostImg" src={`http://localhost:7733/images/${initialPhoto}`} alt={post.title} />
            ) : null}
        
            <div className="postContainer">
              <div className="writeFormGroup">
                <label htmlFor="fileInput">
                  <i className="writeIcon fa-solid fa-plus"></i>
                </label>
                <input
                  type="file"
                  id="fileInput"
                  className="writeFile"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    if (e.target.files && e.target.files.length > 0) {
                      setNewPhoto(URL.createObjectURL(e.target.files[0]));
                    } else {
                      setNewPhoto(null);
                    }
                  }}
                />
              </div>
              <input
                type="text"
                value={title}
                className="singlePostTitleInput"
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>
          </div>
        
          <div className="writeFormGroup">
            <select className="writeInput" value={tags[0] || ''} onChange={(e) => setTags([e.target.value, tags[1] || ''])}>
              <option value="" disabled>Select Category</option>
              <option value="Project">Project</option>
              <option value="Patent">Patent</option>
              <option value="Paper">Paper</option>
              <option value="Journal">Journal</option>
              <option value="Competition">Competition</option>
            </select>
            <select className="writeInput" value={tags[1] || ''} onChange={(e) => setTags([tags[0] || '', e.target.value])}>
              <option value="" disabled>Select Year</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Final Year">Final Year</option>
            </select>
          </div>
          
          <textarea
            className="singlePostDescInput"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Write your post description here..."
          />
        
          <button className="singlePostButton" type="submit">Update</button>
        </form>
        
        ) : (
          <div>
            {post.photo && (
              <img className="singlePostImg" src={`http://localhost:7733/images/${post.photo}`} alt={post.title} />
            )}
            <h1 className="siglePostTitle">
              {title}
              <div className="singlePostEdit">
                <i
                  className="singlePostIcon fa-regular fa-pen-to-square"
                  onClick={() => setUpdateMode(true)}
                ></i>
              </div>
            </h1>
            <div className="postTags">
              <strong>Tags:</strong>
              {tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="like-container">
                <div className="like-section" onClick={handleLike}>
                  <FontAwesomeIcon icon={faThumbsUp} className={`like-icon ${liked ? "liked" : ""}`} />
                  <span className="like-count">{likes}</span>
                </div>
            </div>
            <div className="singlePostInfo">
              <span className="singlePostAuthor">
                Author:
                <b>{post.username}</b>
              </span>
              <span className="singlePostDate">
              {new Date(post.createdAt).toDateString()}
              </span>
            </div>
            
            <p className="singlePostDesc">{desc}</p>
            
          </div>

          
        )}
        {updateSuccess && (
            <p className={`updateSuccessMessage ${updateSuccess ? '' : 'fade-out'}`}>
              Post updated successfully!
            </p>
        )}

        <div className="approvalSection">
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Select Action</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
          {action === "reject" && (
            <textarea
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          )}
          <button onClick={handleActionSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}