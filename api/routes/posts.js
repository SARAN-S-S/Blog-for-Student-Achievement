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
            $match: { username },
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
            $match: { tags: tag },
          },
          {
            $addFields: {
              email: "$user.email", // Add email to the response
            },
          },
        ]);
      } else if (category && year) {
        // Filter by both category and year
        posts = await Post.find({ tags: { $all: [category, year] } });
      } else if (category) {
        // Filter by category only
        posts = await Post.find({ tags: category });
      } else if (year) {
        // Filter by year only
        posts = await Post.find({ tags: year });
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

//unlike a post
router.post("/:id/unlike", async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post and decrement likes (ensure likes don't go below 0)
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: -1 } }, // Decrement likes by 1
      { new: true } // Return the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

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



module.exports = router;
