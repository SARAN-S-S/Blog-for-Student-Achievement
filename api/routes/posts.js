const  router = require("express").Router();
const User = require("../models/User");  
const Post = require("../models/Post");  

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
    const username = req.query.user;
    const tag = req.query.tag; // New query parameter for tag filtering
  
    try {
      let posts;
      if (username) {
        posts = await Post.find({ username });
      } else if (tag) {
        posts = await Post.find({ tags: tag }); // Filter posts by tag
      } else {
        posts = await Post.find();
      }
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
  });



module.exports = router;
