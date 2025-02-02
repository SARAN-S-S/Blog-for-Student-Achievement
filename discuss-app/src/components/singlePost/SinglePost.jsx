import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import "./singlePost.css";
import axios from "axios";
import { Context } from "../../context/Context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faPaperPlane, faReply } from '@fortawesome/free-solid-svg-icons';

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
    const [year, setYear] = useState("");
    const [tags, setTags] = useState([]);
    
    

    useEffect(() => {
        const getPost = async () => {
            try {
                const res = await axios.get("/api/posts/" + path);
                setPost(res.data);
                setTitle(res.data.title);
                setDesc(res.data.desc);
                
                // Initialize all states from the fetched data
                setCategory(res.data.category || "");
                setYear(res.data.year || "");
                setTags(res.data.tags || []);


                const commentsRes = await axios.get(`/api/comments/${res.data._id}`);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("Error fetching post or comments:", err);
            }
        };
        getPost();
    }, [path]);

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/posts/${post._id}`, { data: { username: user.username } });
            window.location.replace("/");
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put(`/api/posts/${post._id}`, {
                username: user.username,
                title,
                desc,
                category,
                year,
                tags,
            });
            setPost(res.data);
            setUpdateMode(false);

            // Update initial values *after* successful update
            setCategory(category);
            setYear(year);

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

            if (user._id === comment.userId) {
                await axios.delete(`/api/comments/${commentId}`, { data: { userId: user._id } });

                // Update the state to remove the deleted comment
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

    // Helper function to find a comment by ID
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

    // Helper function to remove a comment from the state
    const removeCommentFromState = (commentsArray, commentId) => {
        return commentsArray.filter(comment => {
            if (comment._id === commentId) {
                return false; // Remove the comment
            }
            if (comment.replies && comment.replies.length > 0) {
                comment.replies = removeCommentFromState(comment.replies, commentId); // Recursively remove from replies
            }
            return true; // Keep the comment
        });
    };

    const handleEditComment = (comment) => {
        if (user._id === comment.userId) {
            setEditingComment(comment._id);
            setEditedCommentText(comment.text);
        } else {
            alert("You can only edit your own comments.");
        }
    };

    const handleUpdateComment = async (commentId) => {
        try {
            const comment = findCommentById(comments, commentId);
            if (user._id === comment.userId) {
                const res = await axios.put(`/api/comments/${commentId}`, {
                    userId: user._id,
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
        const isAuthor = user && comment.userId === user._id;
        return (
            <div className={`comment ${level > 0 ? 'reply' : ''}`} key={comment._id}>
                <div className="commentInfo">
                    <span>{comment.username}</span>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                {editingComment === comment._id ? (
                    <div>
                        <textarea value={editedCommentText} onChange={e => setEditedCommentText(e.target.value)} />
                        <button className="update" onClick={() => handleUpdateComment(comment._id)}>Update</button>
                        <button className="cancel" onClick={handleCancelEdit}>Cancel</button>
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
                {post.photo && (
                    <img className="singlePostImg" src={PF + post.photo} alt=""/>
                )}

                {updateMode ? (
                    <>
                        <input
                            type="text"
                            value={title}
                            className="singlePostTitleInput"
                            autoFocus
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <div className="writeFormGroup">
                            <select className="writeInput" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                
                                <option value="Project">Project</option>
                                <option value="Patent">Patent</option>
                                <option value="Paper">Paper</option>
                                <option value="Journal">Journal</option>
                                <option value="Competition">Competition</option>
                            </select>

                            <select className="writeInput" value={year} onChange={(e) => setYear(e.target.value)} required>
                                <option value="First Year">First Year</option>
                                <option value="Second Year">Second Year</option>
                                <option value="Third Year">Third Year</option>
                                <option value="Final Year">Final Year</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <h1 className="siglePostTitle">
                        {title}
                        {post.username === user?.username && (
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
                )}

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

                {updateMode && (
                    <button className="singlePostButton" onClick={handleUpdate}>
                        Update
                    </button>
                )}

                {updateMode ? (
                    <textarea className="singlePostDescInput" value={desc} onChange={(e) => setDesc(e.target.value)} />
                ) : (
                    <p className="singlePostDesc">{desc}</p>
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