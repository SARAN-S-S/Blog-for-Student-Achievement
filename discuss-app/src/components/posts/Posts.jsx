import React from "react";
import Post from "../post/Post";
import "./posts.css";

export default function Posts({ posts = [] }) {  // Default value to prevent undefined error
  if (posts.length === 0) {
    return <div className="no-posts">No posts available.</div>;
  }

  return (
    <div className="posts">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}
