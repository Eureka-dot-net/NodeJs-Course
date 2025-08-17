const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

require('dotenv').config()

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const port = 8080;
const dbUrl = process.env.MONGODB_URI

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

app.use('/data', express.static(path.join(__dirname, 'data')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});



app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// 1. Global Promise Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED PROMISE REJECTION:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);

  // Optional: Exit the process (recommended for production)
  // process.exit(1);
});

// 2. Global Exception Handler  
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:');
  console.error(error);

  // Graceful shutdown
  process.exit(1);
});


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message })
})

let server;

mongoose.connect(dbUrl)
  .then(() => {
    // ✅ Create server but don't listen yet
    server = require('http').createServer(app);
    
    // ✅ Initialize Socket.IO immediately
    const io = require('./socket').init(server);
    
    io.on('connection', socket => {
      console.log('✅ New client connected:', socket.id);
      
      // Test message
      socket.emit('test', { 
        message: 'Hello from server!',
        timestamp: new Date().toISOString()
      });

      socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
      });
    });
    
    // ✅ Now start listening
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Graceful shutdown function
const gracefulShutdown = (signal) => {
  console.log(`\n👋 ${signal} received. Shutting down gracefully...`);

  // 1. Stop accepting new requests
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('❌ Error closing server:', err);
        return process.exit(1);
      }
      console.log('✅ HTTP server closed');

      // 2. Close database connection
      mongoose.connection.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
          return process.exit(1);
        }
        console.log('✅ Database connection closed');
        console.log('👋 Process exited cleanly');
        process.exit(0);
      });
    });
  } else {
    // If server isn't running, just close database
    mongoose.connection.close(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  }

  // Fallback: Force exit after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C