require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: String,
  number: String,
  message: String
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API Routes

// Send feedback (POST)
app.post('/send-feedback', async (req, res) => {
  const { name, number, message } = req.body;
  try {
    const feedback = new Feedback({ name, number, message });
    await feedback.save();
    res.json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get feedback by number (GET)
app.get('/get-feedback/:number', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ number: req.params.number });
    if (feedbacks.length === 0) {
      return res.status(404).json({ success: false, message: 'No feedback found' });
    }
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Server Listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
