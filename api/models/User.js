const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.role === "admin"; // Password required only for admins
    },
  },
  profilePic: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);


