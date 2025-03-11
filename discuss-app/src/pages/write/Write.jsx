import { useContext, useState } from "react";
import "./write.css";
import axios from "axios";
import { Context } from "../../context/Context";

export default function Write() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [category2, setCategory2] = useState(""); // New optional category
  const [year, setYear] = useState("");
  const { user } = useContext(Context);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure consistent order in the tags array
    const tags = [category, year, category2].filter(Boolean); // [Event Type 1, Student Year, Event Type 2]

    const newPost = {
      username: user.username,
      title,
      desc,
      tags, // Use the correctly ordered tags array
      approved: false,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      newPost.photo = filename;
      try {
        await axios.post("/api/upload", data);
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }

    try {
      const res = await axios.post("/api/posts", newPost);
      window.location.replace("/post/" + res.data._id);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  return (
    <div className="write">
      {file && <img className="writeImg" src={URL.createObjectURL(file)} alt="" />}
      <form className="writeForm" onSubmit={handleSubmit}>
        <div className="writeFormGroup">
          <label htmlFor="fileInput">
            <i className="writeIcon fa-solid fa-plus"></i>
          </label>
          <input
            type="file"
            id="fileInput"
            className="writeFile"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <input
            type="text"
            placeholder="Event Name | Location"
            className="writeInput"
            autoFocus={true}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="writeFormGroup">
          <select
            className="writeInput"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category 1</option>
            <option value="Project">Project</option>
            <option value="Patent">Patent</option>
            <option value="Paper">Paper</option>
            <option value="Journal">Journal</option>
            <option value="Competition">Competition</option>
            <option value="Product">Product</option> {/* New Option */}
            <option value="Placement">Placement</option> {/* New Option */}
          </select>
    
          <select
            className="writeInput"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="">Select Year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Final Year">Final Year</option>
          </select>

          <select
            className="writeInput"
            value={category2}
            onChange={(e) => setCategory2(e.target.value)}
          >
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
        <div className="writeFormGroup">
          <textarea
            placeholder="Describe the event details, your experience, and the position you secured..."
            type="text"
            className="writeInput writeText"
            onChange={(e) => setDesc(e.target.value)}
            required
          ></textarea>
        </div>
        <button className="writeSubmit" type="submit">
          Post
        </button>
      </form>
    </div>
  );
}