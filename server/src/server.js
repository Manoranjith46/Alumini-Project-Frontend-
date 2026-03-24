import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

// Load environment variables from a .env file
config();

// Initialize the Express application
const app = express();

// --- Middleware ---
app.use(cors({
  // Local - F
  // Local - B
  // Vercel - F
  // Vercel - F(T)
  // Render - B(T)

  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://alumni--portal.vercel.app/',
    'https://alumini-portal-t.vercel.app/',
    'https://alumini-project-frontend-t.onrender.com',
  ],
  credentials: true
}));
// JSON body size limit (1mb for form data)
app.use(json({ limit: '1mb' }));

// Database Connection
connectDB();


// --- Routes ---
app.use('/api/auth', authRoutes);

app.use('/api/feedback', feedbackRoutes);

app.use('/api/payments', paymentRoutes);

app.use('/api/jobs', jobRoutes);

app.use('/api/invitations', invitationRoutes);

app.use('/api/coordinators', coordinatorRoutes);

app.use('/api/alumni', alumniRoutes);

app.use('/api/departments', departmentRoutes);

app.use('/api/users', userRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/images', imageRoutes);


// --- Start the Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log('⚠️  Make sure Ollama is running: ollama serve');
});