const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        postId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        parentCommentId: {
            type: String,
            default: null,
        },
        replies: [{ // Add this field
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment' // Reference the Comment model
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);