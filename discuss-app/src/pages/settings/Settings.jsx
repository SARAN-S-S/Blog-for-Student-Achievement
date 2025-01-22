import "./settings.css"
import Sidebar from "../../components/sidebar/Sidebar"
import { useContext, useState } from "react"
import { Context } from "../../context/Context"
import axios from "axios";


export default function Settings() {

    const [file,setFile] = useState(null);
    const [username,setUsername] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [success,setSuccess] = useState(false);
    

    const {user, dispatch} = useContext(Context);
    const PF = "http://localhost:7733/images/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({type: "UPDATE_START"});
        const updatedUser = {
          userId: user._id,
          username,
          email,
          password,
        };
        if(file) {
          const data = new FormData();
          const filename = Date.now() + file.name;
          data.append("name", filename);
          data.append("file", file);
          updatedUser.profilePic = filename;
          
          try {
            await axios.post("/api/upload", data)
            
          }  
          catch(err)  {
    
          }
        }
        try {
            const res = await axios.put(`/api/users/${user._id}`, updatedUser);
            setSuccess(true);
            dispatch({type: "UPDATE_SUCCESS", payload: res.data});
        }
        catch(err)  {
            dispatch({type: "UPDATE_FAILURE"});
        }
      }

  const handleDelete = async () => {
        try {
            await axios.delete(`/api/users/${user._id}`, { data: { userId: user._id } });
            dispatch({ type: "LOGOUT" });
            window.location.replace("/") // Redirect to homepage or login page
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    }

    
    //console.log("Profile Image URL:", file ? URL.createObjectURL(file) : PF + user.profilePic);

    const defaultProfilePic = "/profile.jpg"; // Path to the default image

  return (
    <div className="settings">

        <div className="settingsWrapper">

            <div className="settingsTitle">
                <span className="settingsUpdateTitle">Account Details</span>
                
                <button className="settingsDeleteTitle" type="submit" onClick={handleDelete} ><strong>Delete Account</strong></button>
            </div>

            <form className="settingsForm" onSubmit={handleSubmit}>
                <label>Profile Picture</label>
                <div className="settingsPP">
                    <img className="settingsImg"
                    src={file ? URL.createObjectURL(file) : user.profilePic ? PF + user.profilePic : defaultProfilePic}  alt="" />
                    <label htmlFor="fileInput">
                    <i className="settingsPPIcon fa-regular fa-circle-user"></i> 
                    </label>
                    <input type="file" className="fileInput" id="fileInput"
                    onChange={e=>setFile(e.target.files[0])}/>
                </div>
                
                <label>Username</label>
                <input type="text" placeholder={user.username} onChange={e=>setUsername(e.target.value)} required />
                <label>Email</label>
                <input type="email" placeholder={user.email}  onChange={e=>setEmail(e.target.value)} required/>
                <label>Password</label>
                <input type="password" onChange={e=>setPassword(e.target.value)} required/>
                <button className="settingsSubmit" type="submit" ><strong>Update</strong></button>

                {success && <span style={{color: "green", textAlign: "center", marginTop: "20px"}}>Profile has been Updated successfully...</span>}
            </form>

        </div>
        <Sidebar/>
    </div>
  )
}
