const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const admin = require('firebase-admin');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();
const port = process.env.PORT || 5000;

// Initialize Firebase Admin
admin.initializeApp({
  // Firebase configuration will be added here
  // You'll need to provide your own credentials
});

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(express.json());

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Routes
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    
    // Basic content division algorithm
    const sections = dividePdfContent(pdfData.text);
    
    res.json({
      message: 'PDF processed successfully',
      sections: sections,
      totalPages: pdfData.numpages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to divide PDF content into sections
function dividePdfContent(text) {
  // Simple division by headings (can be enhanced)
  const sections = [];
  const lines = text.split('\n');
  let currentSection = { title: 'Introduction', content: [] };

  lines.forEach(line => {
    if (line.match(/^[A-Z\s]{3,}$/)) { // Possible heading detection
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { title: line.trim(), content: [] };
    } else {
      currentSection.content.push(line);
    }
  });

  sections.push(currentSection);
  return sections;
}

// Protected route example
app.get('/api/protected', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ message: 'Protected data', user: decodedToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
