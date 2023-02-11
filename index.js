const express = require("express");
const firebase = require("firebase-admin");

const app = express();
const port = process.env.PORT || 5000;

const serviceAccount = require("./blog-post-cdd49-firebase-adminsdk-qkn6r-02d454b812.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://blog-post-cdd49.firebaseio.com"
});

const db = firebase.firestore();

app.use(express.json());

// Create a post
app.post('/posts', (req, res) => {
  const post = req.body;
  db.collection('posts')
    .add(post)
    .then(ref => {
      res.status(200).json({
        message: 'Post created successfully',
        postId: ref.id
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Error creating post: ' + error
      });
    });
});

app.put('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const postData = req.body;

  db.collection('posts')
    .doc(postId)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({
          message: 'Post not found'
        });
      } else {
        db.collection('posts')
          .doc(postId)
          .update(postData)
          .then(() => {
            res.status(200).json({
              message: 'Post updated successfully'
            });
          })
          .catch(error => {
            res.status(500).json({
              message: 'Error updating post: ' + error
            });
          });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Error retrieving post: ' + error
      });
    });
});






// Delete a post
app.delete('/posts/:id', (req, res) => {
  const postId = req.params.id;
  db.collection('posts')
    .doc(postId)
    .delete()
    .then(() => {
      res.status(200).json({
        message: 'Post deleted successfully'
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Error deleting post: ' + error
      });
    });
});

// Fetch all posts
app.get('/posts', (req, res) => {
  db.collection('posts')
    .get()
    .then(snapshot => {
      const posts = [];
      snapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          data: doc.data()
        });
      });
      res.status(200).json(posts);
    })
    .catch(error => {
      res.status(500).json({
        message: 'Error fetching posts: ' + error
      });
    });
});

// Fetch a post by ID
app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  db.collection('posts')
    .doc(postId)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'Post not found'
        });
      }
      res.status(200).json({
        message: 'Post fetched successfully',
        post: doc.data()
      });
    })
    .catch(error => {
      res.status(500).json({
        error: 'Error fetching post: ' + error.message
      });
    });
});
  
  
  
// Start the API server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
