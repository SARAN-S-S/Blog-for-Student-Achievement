import "./post.css";
import { Link } from "react-router-dom";

export default function Post({ post }) {
  const PF = "http://localhost:7733/images/";
  return (
    <Link to={`/post/${post._id}`} className="link">
      <div className="postCard gridLayout">
        {post.photo && <img className="postImg" src={PF + post.photo} alt="" />}
        <div className="postContent">
          <div className="postTags">
            {post.tags?.map((tag, index) => (
              <span key={index} className="postTag">{tag}</span>
            ))}
          </div>
          <span className="postTitle">{post.title}</span>
          <div className="postAuthorDate">
            <span className="postAuthor">by <strong>{post.username}</strong></span>,{" "}
            <span className="postDate">{new Date(post.createdAt).toDateString()}</span>
          </div>
          <p className="postDescription">{post.desc}</p>
        </div>
      </div>
    </Link>
  );
}
