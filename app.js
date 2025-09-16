const express = require('express');
const path = require('path');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

let posts = [
  ];

let nextId = 3;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Format dates
app.locals.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};



// Display Dates
app.get('/', (req, res) => {
  const sortedPosts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.render('index', { posts: sortedPosts });
});

// Show a post
app.get('/post/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).render('404', { message: 'Post not found' });
  }
  res.render('post', { post });
});

// New post
app.get('/new', (req, res) => {
  res.render('new');
});

// Create a new post
app.post('/posts', (req, res) => {
  const { title, content, author } = req.body;
  
  if (!title || !content || !author) {
    return res.status(400).render('new', { 
      error: 'All fields are required',
      title,
      content,
      author 
    });
  }

  const newPost = {
    id: nextId++,
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  posts.push(newPost);
  res.redirect('/');
});

// Edit a post 
app.get('/post/:id/edit', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).render('404', { message: 'Post not found' });
  }
  res.render('edit', { post });
});

// Update a post
app.put('/post/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).render('404', { message: 'Post not found' });
  }

  const { title, content, author } = req.body;
  
  if (!title || !content || !author) {
    const post = posts[postIndex];
    return res.status(400).render('edit', { 
      post,
      error: 'All fields are required'
    });
  }

  posts[postIndex] = {
    ...posts[postIndex],
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    updatedAt: new Date()
  };

  res.redirect(`/post/${req.params.id}`);
});

// Delete a post
app.delete('/post/:id', (req, res) => {
  const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).render('404', { message: 'Post not found' });
  }

  posts.splice(postIndex, 1);
  res.redirect('/');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Blog server running on http://localhost:${PORT}`);
});

module.exports = app;