exports.getPosts = (req, res) => {
  res.status(200).json({ 
    posts: [
        { id: 1, title: 'First Post', content: 'This is the content of the first post.' }
    ] });
}

exports.createPost = (req, res) => {
  const { title, content } = req.body;
  res.status(201).json({
    message: 'Post created successfully',
    post: { id: Date.now(), title, content }
  });
}