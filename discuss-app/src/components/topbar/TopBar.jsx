import { Link } from "react-router-dom";
import "./topbar.css"
import { useContext } from "react";
import { Context } from "../../context/Context";

export default function TopBar() {
  const { user, dispatch } = useContext(Context);
  const PF = "http://localhost:7733/images/";
  const defaultProfilePic = "/profile.jpg"; // Path to the default image

  
  const handleLogout = () => {
    dispatch({type:"LOGOUT"});
  };

  

  

    

  return (
    <div className="top">
      
            <Link className="link" to="/about" >
              <div className="topLeft">
                <i  className="fa-solid fa-graduation-cap"></i>
                <p className="profile-text"><b>AchieveHub</b></p>
              </div>
            </Link>

      <div className="topCorner">
        <ul className="topList">
            <li className="topListItem">
              <Link className="link" to = "/" >HOME</Link>
            </li>
            <li className="topListItem">
              <Link className="link" to = "/about" >ABOUT</Link>
            </li>
            <li className="topListItem">
              <Link className="link" to = "/contact" >CONTACT</Link>
            </li>
            <li className="topListItem">
              <Link className="link" to = "/write" >WRITE</Link>
            </li>
            <li className="topListItem" onClick={handleLogout}>
              {user && "LOGOUT"}
            </li>  
        </ul>
      </div>
      <div className="topRight">

        
        {
          user ? (
            <Link to="/settings" className="link" >
              <img className="topImg"
              src={user.profilePic ? PF + user.profilePic : defaultProfilePic}   alt="profile" />
              <p className="profile-text">profile</p>
              
            </Link>
            
            
          ) :  (
            <ul className="topList">
              <li className="topListItem">
                <Link className="link" to = "/login" >LOGIN</Link>
              </li>
              <li className="topListItem">
                <Link className="link" to = "/register" >REGISTER</Link>
              </li>
                
            </ul>
          )

        }
        
        

        {/* <i className ="topSearchIcon fa-solid fa-magnifying-glass"></i>*/}
        


      </div>

    </div>
  )
}
