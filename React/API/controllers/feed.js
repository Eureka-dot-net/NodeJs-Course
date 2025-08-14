const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // respond immediately
  }
  Post.find().countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
        posts: result,
        totalItems: totalItems
      })
    })
    .catch(err => next(err))
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        post: post
      })
    })
    .catch(err => next(err))
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: "Validation failed", errors: errors.array() });
  }
  if (!req.file) {
    return res.status(422).json({ message: "No image provided" });
  }

  const imageUrl = req.file.path.replace(/\\/g, "/");
  const { title, content } = req.body;

  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: req.userId
  });

  let createdPost; // Store the post for later use
  let creator;
  post.save()
    .then(result => {
      createdPost = result; // Save the result
      return User.findById(req.userId); // Return the Promise
    })
    .then(user => {
      user.posts.push(createdPost);
      creator = user;
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: 'Post created successfully',
        post: createdPost,
        creator: creator
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  console.log(postId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: "Validation failed", errors: errors.array() });
  }
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace(/\\/g, "/");
  }
  if (!imageUrl) {
    return res.status(422).json({ message: "No image provided" });
  }
  const { title, content } = req.body;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }
      if (!post.creator._id.equals(req.userId)) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save()
        .then(result => {
          res.status(201).json({
            message: 'Post created successfully',
            post: post
          });
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500
          }
          next(err);
        })
    })
    .catch(err => next(err));
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  
  Post.findById(postId)
    .then(post => {  // ← Fixed parenthesis
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }
      
      // ← Fixed creator comparison
      const creatorId = post.creator._id || post.creator;
      if (!creatorId.equals(req.userId)) {
        return res.status(403).json({ message: 'Not authorized.' });
      }
      
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then(() => {
      return User.findById(req.userId);  // ← Added return
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Deleted post' });  // ← Removed return
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err))
}