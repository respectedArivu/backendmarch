require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// ✅ Fix CORS issues
const allowedOrigins = ['https://arivutesting33.netlify.app'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Fixing CORS issue
  credentials: true
}));

// ✅ Handle preflight requests globally
app.options('*', cors());

// ✅ MongoDB Connection
async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

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

// ✅ Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  message: { type: String, required: true }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// ✅ API to Submit Feedback
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
    console.error('❌ Error saving feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ API to Get Feedback by BOTH Name & Number
app.get('/get-feedback', async (req, res) => {
  try {
    const { name, number } = req.query; 
    if (!name || !number) {
      return res.status(400).json({ success: false, message: 'Both name and number are required' });
    }

    console.log(`🔍 Fetching feedback for: Name=${name}, Number=${number}`);

    const feedbacks = await Feedback.find({ name, number });
    if (!feedbacks.length) {
      return res.status(404).json({ success: false, message: 'No feedback found' });
    }

    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// ✅ Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

