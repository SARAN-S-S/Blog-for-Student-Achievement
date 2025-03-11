import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect, useContext, useRef } from "react"; // Import useRef
import "./singlePost.css";
import axios from "axios";
import { Context } from "../../context/Context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faPaperPlane, faReply, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState({});
  const PF = "http://localhost:7733/images/";
  const { user } = useContext(Context);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [updateMode, setUpdateMode] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [category, setCategory] = useState("");
  const [category2, setCategory2] = useState(""); // New state for additional optional category
  const [year, setYear] = useState("");

  const [file, setFile] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [initialPhoto, setInitialPhoto] = useState(null);

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  // Create a ref for the textarea
  const textareaRef = useRef(null);

  // Auto-focus the textarea and set cursor position at the end when editingComment changes
  useEffect(() => {
    if (editingComment && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor position at the end of the text
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [editingComment]);

  useEffect(() => {
    const getPostData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`/api/posts/${path}`),
          axios.get(`/api/comments/${path}`)
        ]);
        const postData = postRes.data;
        setPost(postData);
        setTitle(postData.title);
        setDesc(postData.desc);
        setCategory(postData.tags[0] || ""); // Set initial category (Event Type 1)
        setCategory2(postData.tags[2] || ""); // Set initial category2 (Event Type 2)
        setYear(postData.tags[1] || ""); // Set initial year (Student Year)
        setInitialPhoto(postData.photo || null);
        setLikes(postData.likes || 0);
        setComments(commentsRes.data);

        if (user) {
          const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
          setLiked(likedPosts.includes(postData._id));
        }
      } catch (err) {
        console.error("Error fetching post or comments:", err);
      }
    };
    getPostData();
  }, [path, user]);

  const handleLike = async () => {
    try {
      if (!user) {
        alert("You must be logged in to like a post.");
        return;
      }

      if (liked) {
        // Unlike the post
        await axios.post(`/api/posts/${post._id}/unlike`);
        setLikes(prevLikes => prevLikes - 1);
        setLiked(false);

        // Remove post ID from liked posts in localStorage
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts.filter(id => id !== post._id)));
      } else {
        // Like the post
        await axios.post(`/api/posts/${post._id}/like`);
        setLikes(prevLikes => prevLikes + 1);
        setLiked(true);

        // Add post ID to liked posts in localStorage
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, post._id]));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/posts/${post._id}`, { data: { username: user.username } });
      window.location.replace("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedPost = {
        username: user.username,
        title,
        desc,
        category,
        category2,
        year,
        tags: [category, year, category2].filter(Boolean), // Ensure consistent order in tags array
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

      const res = await axios.put(`/api/posts/${post._id}`, updatedPost);
      setPost(res.data);
      setUpdateMode(false);
      setFile(null);
      setNewPhoto(null);
      setInitialPhoto(res.data.photo);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }
    try {
      const res = await axios.post("/api/comments", {
        postId: post._id,
        userId: user._id,
        username: user.username,
        text: newComment,
        parentCommentId: replyingToComment,
      });

      if (replyingToComment) {
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment._id === replyingToComment) {
              return {
                ...comment,
                replies: [res.data, ...(comment.replies || [])],
              };
            }
            return comment;
          });
        });
      } else {
        setComments([res.data, ...comments]);
      }

      setNewComment("");
      setReplyingToComment(null);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const comment = findCommentById(comments, commentId);

      // Allow admin or comment author to delete
      if (user._id === comment.userId || user.role === "admin") {
        await axios.delete(`/api/comments/${commentId}`, { 
          data: { userId: user._id } // Include userId in the request body
        });

        setComments(prevComments => {
          return removeCommentFromState(prevComments, commentId);
        });
      } else {
        alert("You can only delete your own comments.");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const findCommentById = (commentsArray, commentId) => {
    for (const comment of commentsArray) {
      if (comment._id === commentId) {
        return comment;
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  const removeCommentFromState = (commentsArray, commentId) => {
    return commentsArray.filter(comment => {
      if (comment._id === commentId) {
        return false;
      }
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = removeCommentFromState(comment.replies, commentId);
      }
      return true;
    });
  };

  const handleEditComment = (comment) => {
    // Allow admin or comment author to edit
    if (user._id === comment.userId || user.role === "admin") {
      setEditingComment(comment._id);
      setEditedCommentText(comment.text);
    } else {
      alert("You can only edit your own comments.");
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const comment = findCommentById(comments, commentId);
      if (user._id === comment.userId || user.role === "admin") {
        const res = await axios.put(`/api/comments/${commentId}`, {
          userId: user._id, // Include userId in the request body
          text: editedCommentText,
        });

        setComments(prevComments => {
          return prevComments.map(c => updateCommentText(c, commentId, res.data.text));
        });

        setEditingComment(null);
      } else {
        alert("You can only update your own comments.");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const updateCommentText = (comment, commentId, newText) => {
    if (comment._id === commentId) {
      return { ...comment, text: newText };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => updateCommentText(reply, commentId, newText)),
      };
    }
    return comment;
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleReply = (comment) => {
    setReplyingToComment(comment._id);
    setReplyText("");
  };

  const handlePostReply = async (commentId) => {
    try {
      const res = await axios.post("/api/comments", {
        postId: post._id,
        userId: user._id,
        username: user.username,
        text: replyText,
        parentCommentId: commentId,
      });

      setComments(prevComments => {
        return prevComments.map(c => updateCommentReplies(c, commentId, res.data));
      });

      setReplyText("");
      setReplyingToComment(null);
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const updateCommentReplies = (comment, commentId, newReply) => {
    if (comment._id === commentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => updateCommentReplies(reply, commentId, newReply)),
      };
    }
    return comment;
  };

  const renderComment = (comment, level = 0) => {
    const isAuthor = user && (comment.userId === user._id || user.role === "admin");
    return (
      <div className={`comment ${level > 0 ? 'reply' : ''}`} key={comment._id}>
        <div className="commentInfo">
          <span>{comment.username}</span>
          <span>{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        {editingComment === comment._id ? (
          <div className="comment-edit-form">
            <textarea
              ref={textareaRef} // Attach the ref to the textarea
              className="comment-edit-textarea"
              value={editedCommentText}
              onChange={(e) => setEditedCommentText(e.target.value)}
            />
            <div className="comment-edit-buttons">
              <button
                className="comment-edit-update"
                onClick={() => handleUpdateComment(comment._id)}
              >
                Update
              </button>
              <button
                className="comment-edit-cancel"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>{comment.text}</p>
        )}

        <div className="comment-controls">
          {user && (
            <>
              {isAuthor && (
                <>
                  <FontAwesomeIcon className="commentIcon edit-icon" icon={faPenToSquare} onClick={() => handleEditComment(comment)} />
                  <FontAwesomeIcon className="commentIcon delete-icon" icon={faTrashCan} onClick={() => handleDeleteComment(comment._id)} />
                </>
              )}
              <FontAwesomeIcon className="commentIcon reply-icon" icon={faReply} onClick={() => handleReply(comment)} />
            </>
          )}
        </div>

        {replyingToComment === comment._id && (
          <div className="reply-form">
            <textarea placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
            <button onClick={() => handlePostReply(comment._id)}>Post Reply</button>
            <button onClick={() => setReplyingToComment(null)}>Cancel</button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          comment.replies.map(reply => renderComment(reply, level + 1))
        )}
      </div>
    );
  };

  return (
    <div className="singlePost">
      <div className="singlePostWrapper">
        {updateMode ? (
          <form onSubmit={handleUpdate}>
            <div className="image-edit-section">
              {newPhoto ? (
                <img className="writeImg" src={newPhoto} alt="New Post Preview" />
              ) : initialPhoto ? (
                <img className="singlePostImg" src={PF + initialPhoto} alt={post.title} />
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
                />
              </div>
            </div>

            <div className="writeFormGroup">
              <select className="writeInput" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="Project">Project</option>
                <option value="Patent">Patent</option>
                <option value="Paper">Paper</option>
                <option value="Journal">Journal</option>
                <option value="Competition">Competition</option>
                <option value="Product">Product</option> {/* New Option */}
                <option value="Placement">Placement</option> {/* New Option */}
              </select>

              <select className="writeInput" value={year} onChange={(e) => setYear(e.target.value)} required>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Final Year">Final Year</option>
              </select>

              <select className="writeInput" value={category2} onChange={(e) => setCategory2(e.target.value)}>
                <option value="">Select Category 2 (Optional)</option>
                <option value="Project">Project</option>
                <option value="Patent">Patent</option>
                <option value="Paper">Paper</option>
                <option value="Journal">Journal</option>
                <option value="Competition">Competition</option>
                <option value="Product">Product</option> {/* New Option */}
                <option value="Placement">Placement</option> {/* New Option */}
              </select>
            </div>
            <textarea className="singlePostDescInput" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <button className="singlePostButton" type="submit">Update</button>
          </form>
        ) : (
          <div>
            {post.photo && (
              <img className="singlePostImg" src={PF + post.photo} alt={post.title} />
            )}
            <h1 className="siglePostTitle">
              {title}
              {(post.username === user?.username || user?.role === "admin") && (
                <div className="singlePostEdit">
                  <i
                    className="singlePostIcon fa-regular fa-pen-to-square"
                    onClick={() => setUpdateMode(true)}
                  ></i>
                  <i
                    className="singlePostIcon fa-regular fa-trash-can"
                    onClick={handleDelete}
                  ></i>
                </div>
              )}
            </h1>
            <div className="postTags">
              <strong>Tags:</strong>
              {post.tags && post.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="singlePostInfo">
              <span className="singlePostAuthor">
                Author:
                <Link to={`/?user=${post.username}`} className="link">
                  <b>{post.username}</b>
                </Link>
              </span>
              <span className="singlePostDate">
                {new Date(post.createdAt).toDateString()}
              </span>
            </div>
            <div className="like-container">
              <div className="like-section" onClick={handleLike}>
                <FontAwesomeIcon icon={faThumbsUp} className={`like-icon ${liked ? "liked" : ""}`} />
                <span className="like-count">{likes}</span>
              </div>
            </div>
            <br></br>
            <p className="singlePostDesc">{desc}</p>
          </div>
        )}
        <div className="comments">
          <h3>Comments</h3>
          {comments.map(comment => renderComment(comment))}
          {user && (
            <form className="commentForm" onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
              <button type="submit">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}