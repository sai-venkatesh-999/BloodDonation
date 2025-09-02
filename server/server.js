require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
require('./db'); // MongoDB connection

const { Server } = require('socket.io');
const BloodRequest = require('./models/BloodRequest');
const ChatMessage = require('./models/ChatMessage');

// Import routes
const authRoutes    = require('./routes/authRoutes');
const donorRoutes   = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const chatRoutes    = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins (local + deployed frontend)
const allowedOrigins = [
  'http://localhost:5173', // local frontend
  'https://blood-manangement.vercel.app' // deployed frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST']
}));


app.use(express.json());

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const reqDoc = await BloodRequest.findById(data.roomId).select('recipient_user_id assigned_donor_id');
      if (!reqDoc) return;

      const isSenderRecipient = reqDoc.recipient_user_id?.toString() === data.sender_id;
      const recipientUserId = isSenderRecipient ? reqDoc.assigned_donor_id?.toString() : reqDoc.recipient_user_id?.toString();
      if (!recipientUserId) return;

      await ChatMessage.create({
        request_id: data.roomId,
        sender_id: data.sender_id,
        recipient_id: recipientUserId,
        message: data.message
      });

      io.to(data.roomId).emit('receive_message', {
        ...data,
        recipient_id: recipientUserId,
        timestamp: new Date().toISOString()
      });

      console.log(`Message broadcasted to room ${data.roomId}:`, data.message);
    } catch (err) {
      console.error('Error saving/sending chat message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

// ✅ Port handling for both local and Render
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



