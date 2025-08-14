const express = require('express');

const feedController = require('../controllers/feed');
const {validatePost} = require('../validators/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Example route for feed
router.get('/posts', isAuth, feedController.getPosts);

router.post('/post', isAuth, validatePost, feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', isAuth, validatePost, feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);


module.exports = router;