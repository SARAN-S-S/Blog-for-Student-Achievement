import Home from "./pages/home/Home";
import TopBar from "./components/topbar/TopBar";
import Single from "./pages/single/Single";
import Write from "./pages/write/Write";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import Contact from "./pages/contact/Contact";
import About from "./pages/about/About";
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./pages/users/Users";
import AllPosts from "./pages/allPosts/AllPosts";
import ManagePosts from "./pages/managePosts/ManagePosts";
import Statistics from "./pages/statistics/Statistics";
import FilterPosts from "./pages/filterPosts/FilterPosts";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { Context } from "./context/Context";

function App() {
  const { user } = useContext(Context);

  return (
    <Router>
      <TopBar />
      <Routes>
        <Route
          path="/"
          element={
            user?.role === "admin" ? (
              <Navigate to="/dashboard" />
            ) : (
              <Home />
            )
          }
        />
        
        <Route
          path="/dashboard"
          element={user?.role === "admin" ? <Dashboard /> : <Navigate to="/login" />}
        /> 
        <Route path="/users" element={user?.role === "admin" ? <Users /> : <Navigate to="/login" />} />
        <Route path="/allposts" element={user?.role === "admin" ? <AllPosts /> : <Navigate to="/login" />} />
        <Route path="/manageposts" element={user?.role === "admin" ? <ManagePosts /> : <Navigate to="/login" />} />
        <Route path="/statistics" element={user?.role === "admin" ? <Statistics /> : <Navigate to="/login" />} />
        <Route path="/filter-posts" element={user?.role === "admin" ? <FilterPosts /> : <Navigate to="/login" />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/write" element={user ? <Write /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/post/:postId" element={user ? <Single /> : <Navigate to="/login" />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={user ? <Contact /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;