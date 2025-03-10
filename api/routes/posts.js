const  router = require("express").Router();
const User = require("../models/User");  
const Post = require("../models/Post");  
const express = require("express");



// CREATE POST
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        //console.error("Error saving post:", err);
        res.status(500).json(err);
    }
});

//UPDATE POST
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json("Post not found");
        }

        if (post.username === req.body.username) {
            try {
                // Construct the update object.  We need to handle the tags array differently.
                const updateObject = {
                    title: req.body.title,
                    desc: req.body.desc,
                    // ... other fields
                };

                if (req.body.category && req.body.year) { //Check if both values are present
                    updateObject.tags = [req.body.category, req.body.year]; // Directly set the tags array
                } else if (req.body.category) {
                    updateObject.tags = [req.body.category];
                } else if (req.body.year) {
                    updateObject.tags = [req.body.year];
                }

                const updatedPost = await Post.findByIdAndUpdate(
                    req.params.id,
                    { $set: updateObject }, // Use the constructed update object
                    { new: true }
                );
                res.status(200).json(updatedPost);
            } catch (err) {
                console.error("Error updating post:", err);
                res.status(500).json(err);
            }
        } else {
            res.status(401).json("You can update only your posts!");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});


//DELETE POST
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json("Post not found");
        }
        
        if (post.username === req.body.username) {
            try {
                await post.deleteOne();
                res.status(200).json("Post has been deleted...");
            } catch (err) {
                res.status(500).json("npt");
            }
        } else {
            res.status(401).json("You can delete only your posts!");
        }
    } catch (err) {
        res.status(500).json("yes");
    }
});


// Fetch pending posts (with pagination)
router.get("/pending", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    // Fetch posts with pagination
    const posts = await Post.find({ status: "pending" })
      .skip((page - 1) * limit)
      .limit(limit);

    // Fetch user details for each post
    const postsWithEmail = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ username: post.username });
        return {
          ...post._doc, // Spread the post details
          email: user ? user.email : "N/A", // Add the email field
        };
      })
    );

    const total = await Post.countDocuments({ status: "pending" });
    res.status(200).json({ posts: postsWithEmail, total });
  } catch (err) {
    res.status(500).json(err);
  }
});


//GET POST
router.get("/:id", async (req, res) => {
    try  {
        const post = await Post.findById(req.params.id);
        
        res.status(200).json(post);
    }  catch(err)  {
        res.status(500).json(err);
    }
})


// GET ALL POSTS (with optional tag filtering)
router.get("/", async (req, res) => {
  const { category, year, search, user: username, tag } = req.query;

  try {
    let posts;

    if (search) {
      // Search by title, username, or email
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            status: "approved", // Only include approved posts
            $or: [
              { title: { $regex: search, $options: "i" } },
              { username: { $regex: search, $options: "i" } },
              { "user.email": { $regex: search, $options: "i" } },
            ],
          },
        },
        {
          $addFields: {
            email: "$user.email", // Add email to the response
          },
        },
      ]);
    } else if (username) {
      // Filter by username
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: { 
            status: "approved", // Only include approved posts
            username 
          },
        },
        {
          $addFields: {
            email: "$user.email", // Add email to the response
          },
        },
      ]);
    } else if (tag) {
      // Filter by tag
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: { 
            status: "approved", // Only include approved posts
            tags: tag 
          },
        },
        {
          $addFields: {
            email: "$user.email", // Add email to the response
          },
        },
      ]);
    } else if (category && year) {
      // Filter by both category and year
      posts = await Post.find({ 
        status: "approved", // Only include approved posts
        tags: { $all: [category, year] } 
      });
    } else if (category) {
      // Filter by category only
      posts = await Post.find({ 
        status: "approved", // Only include approved posts
        tags: category 
      });
    } else if (year) {
      // Filter by year only
      posts = await Post.find({ 
        status: "approved", // Only include approved posts
        tags: year 
      });
    } else {
      // Fetch all posts with user details
      posts = await Post.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: { 
            status: "approved" // Only include approved posts
          },
        },
        {
          $addFields: {
            email: "$user.email", // Add email to the response
          },
        },
      ]);
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
  
//like a post
  router.post("/:id/like", async (req, res) => {
    try {
      const postId = req.params.id;
  
      // Find the post and increment likes
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 } }, // Increment likes by 1
        { new: true } // Return the updated document
      );
  
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      res.json({ message: "Post liked", likes: updatedPost.likes });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// UNLIKE POST with safeguard
router.post("/:id/unlike", async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const updatedLikes = Math.max(post.likes - 1, 0);
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { likes: updatedLikes },
            { new: true }
        );

        res.json({ message: "Post unliked", likes: updatedPost.likes });
    } catch (error) {
        console.error("Error unliking post:", error);
        res.status(500).json({ message: "Server error" });
    }
});





// Bulk delete posts
router.post("/bulk-delete", async (req, res) => {
  const { postIds } = req.body;
  try {
    await Post.deleteMany({ _id: { $in: postIds } });
    res.status(200).json("Posts deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});



// Approve a post
router.put("/approve/:id", async (req, res) => {
  console.log("Bulk approve route hit! tp eeh");
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});





// Reject a post
router.put("/reject/:id", async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json("Reason for rejection is required.");
  }
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: reason },
      { new: true }
    );
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Edit a post (admin can edit before approval)
router.put("/edit/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Check if req.body has at least one valid field
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json("No fields to update.");
    }

    // Create a dynamic update object with only defined and non-empty values
    const updateObject = Object.keys(req.body).reduce((acc, key) => {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    if (Object.keys(updateObject).length === 0) {
      return res.status(400).json("No valid fields to update.");
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateObject },
      { new: true, runValidators: true }  // runValidators ensures schema validation during update
    );

    if (!updatedPost) {
      return res.status(500).json("Failed to update the post.");
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err.message);  // Log error message for debugging
    res.status(500).json("Server error. Please try again later.");
  }
});


module.exports = router;
