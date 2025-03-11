require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Fix CORS issues
const allowedOrigins = ['https://arivutesting33.netlify.app']; // Add your frontend URL

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],  // Allow OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors()); 

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}
connectDB();

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  message: { type: String, required: true }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API Routes
app.post('/send-feedback', async (req, res) => {
  try {
    const { name, number, message } = req.body;
    if (!name || !number || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const feedback = new Feedback({ name, number, message });
    await feedback.save();
    res.json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/get-feedback/:number', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ number: req.params.number });
    if (!feedbacks.length) {
      return res.status(404).json({ success: false, message: 'No feedback found' });
    }
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
