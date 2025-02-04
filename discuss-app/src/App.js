// App.jsx
import Home from "./pages/home/Home";
import TopBar from "./components/topbar/TopBar";
import Single from "./pages/single/Single";
import Write from "./pages/write/Write";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import Contact from "./pages/contact/Contact";
import About from "./pages/about/About";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, // Import Navigate
} from "react-router-dom";
import { useContext } from "react";
import { Context } from "./context/Context";

function App() {
  const { user } = useContext(Context);
  return (
    <Router>
      <TopBar />
      <Routes>
        
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/signup" element={user ? <Home /> : <Signup />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} /> 
        <Route  path="/write"  element={user ? <Write /> : <Navigate to="/login" />}   />
        <Route  path="/settings"  element={user ? <Settings /> : <Navigate to="/login" />}   />
        <Route  path="/post/:postId"  element={user ? <Single /> : <Navigate to="/login" />}  />
        <Route path="/about" element={<About />} />
        <Route  path="/contact"  element={user ? <Contact /> : <Navigate to="/login" />}  />
      </Routes>
    </Router>
  );
}

export default App;