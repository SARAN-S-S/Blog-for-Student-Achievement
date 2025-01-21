import { Link } from "react-router-dom"
import "./register.css"
import { useState } from "react"
import axios from "axios"

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e)=> {
    e.preventDefault();  //it will prevent the refresh of page while submiting
    setError(false);
    
    try {
      const res = await axios.post("http://localhost:7733/api/auth/register", {
        username,
        email,
        password,
      });
      res.data && window.location.replace("/login");
      // Optionally handle successful registration here
    } catch (err) {
          setError(true);
    }
  };

  return (
    <div className="register">
        <div className="registerContainer">
            <span className="registerTitle">Register</span>
            
            <form className="registerForm" onSubmit={handleSubmit}>
                <label>Username</label>
                <input type="text" className="registerInput" placeholder="Enter username.."
                       onChange={(e) => setUsername(e.target.value)} required
                />


                <label>Email</label>
                <input type="email" className="registerInput" placeholder="Enter your Email Id.." 
                       onChange={(e) => setEmail(e.target.value)} required
                />

                <label>Password</label>
                <input type="password" className="registerInput" placeholder="Enter your password.."
                       onChange={(e) => setPassword(e.target.value)} required
                />

                <button className="registerSubmit" type="submit">Register</button>
            </form>

            {error && <span style={{color: "red", marginTop: "10px "}}><b>The username or Email is already exists...!</b></span>}
        </div>
        <button className="registerLoginSubmit">
          <Link className="link" to = "/login">Login</Link>
        </button>
        
    </div>
  );
}
