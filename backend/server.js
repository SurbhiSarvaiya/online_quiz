const express = require('express');
// Database Connection (REMOVED - Using Local File System)
// mongoose.connect(process.env.MONGO_URI)...
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');


// Routes
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Online Quiz API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
