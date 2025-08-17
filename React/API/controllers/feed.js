const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  try {
    const count = await Post.find().countDocuments();
    const posts = await Post.find().populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).json({
      posts: posts,
      totalItems: count
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Fixed: Converted to async/await for consistency
exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      post: post
    });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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

  try {
    const createdPost = await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(createdPost);
    await user.save();

    io.getIO().emit('posts', {
      action: 'create',
      post: {
        ...createdPost.toObject(), // ✅ Convert to plain object first
        creator: { _id: req.userId, name: user.name }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost,
      creator: user
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
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

  try {
    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const creatorId = post.creator._id || post.creator;
    if (!creatorId.equals(req.userId)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const updatedPost = await post.save();

    io.getIO().emit('posts', {
      action: 'update',
      post: updatedPost.toObject()
    });
    // ✅ Fixed: Correct message and status code
    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// ✅ Fixed: Complete implementation
exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const creatorId = post.creator._id || post.creator;
    if (!creatorId.equals(req.userId)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);

    // ✅ Fixed: Remove post from user's posts array
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('posts', {
      action: 'delete',
      postId: postId
    });
    // ✅ Fixed: Send response
    res.status(200).json({ message: 'Post deleted successfully.' });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => {
    if (err) console.log('Error deleting file:', err);
  });
};