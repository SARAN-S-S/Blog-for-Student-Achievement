const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    desc: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: true,
    },
    tags: {
      type: [String], // Array of strings for event type and student year
      default: [],
    },
    likes: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    rejectionReason: {
        type: String,
        default: "",
    },
}, 
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
