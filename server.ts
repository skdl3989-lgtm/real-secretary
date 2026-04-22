import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEOS_FILE = path.join(__dirname, 'data', 'videos.json');
const DOCUMENTS_FILE = path.join(__dirname, 'data', 'documents.json');
const POPUPS_FILE = path.join(__dirname, 'data', 'popups.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'downloads');

// Ensure the data files and upload directories exist
const initializeFiles = () => {
  try {
    if (!fs.existsSync(path.dirname(VIDEOS_FILE))) {
      fs.mkdirSync(path.dirname(VIDEOS_FILE), { recursive: true });
    }

    const ensureJsonFile = (file: string) => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([], null, 2));
      } else {
        // Basic validation: ensure it's valid JSON
        try {
          const content = fs.readFileSync(file, 'utf-8');
          if (!content.trim()) {
            fs.writeFileSync(file, JSON.stringify([], null, 2));
          } else {
            JSON.parse(content);
          }
        } catch (e) {
          console.error(`Invalid JSON in ${file}, resetting...`);
          fs.writeFileSync(file, JSON.stringify([], null, 2));
        }
      }
    };

    ensureJsonFile(POPUPS_FILE);
    ensureJsonFile(VIDEOS_FILE);
    ensureJsonFile(DOCUMENTS_FILE);

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
};

initializeFiles();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    // Keep original filename but prevent overwrites by checking existence, or just add a timestamp, or keep original name.
    // For developer use, let's keep original name. If conflicts, they will be overwritten natively.
    // Ensure filename is safe (utf-8 characters can be tricky, so let's handle it)
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log incoming requests for debugging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes for Videos
  app.get('/api/videos', (req, res) => {
    try {
      if (!fs.existsSync(VIDEOS_FILE)) {
        return res.json([]);
      }
      const data = fs.readFileSync(VIDEOS_FILE, 'utf-8');
      res.json(JSON.parse(data || '[]'));
    } catch (error) {
      console.error('Error reading videos:', error);
      res.status(500).json({ error: 'Failed to read videos' });
    }
  });

  app.post('/api/videos', (req, res) => {
    try {
      const videos = req.body;
      fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save videos' });
    }
  });

  // API Routes for Documents
  app.get('/api/documents', (req, res) => {
    try {
      if (!fs.existsSync(DOCUMENTS_FILE)) {
        return res.json([]);
      }
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      res.json(JSON.parse(data || '[]'));
    } catch (error) {
      console.error('Error reading documents:', error);
      res.status(500).json({ error: 'Failed to read documents' });
    }
  });

  app.post('/api/documents', (req, res) => {
    try {
      const documents = req.body;
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save documents' });
    }
  });

  // API Routes for Popups
  app.get('/api/popups', (req, res) => {
    try {
      const data = fs.readFileSync(POPUPS_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read popups' });
    }
  });

  app.post('/api/popups', (req, res) => {
    try {
      const popups = req.body;
      fs.writeFileSync(POPUPS_FILE, JSON.stringify(popups, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save popups' });
    }
  });

  // File Upload API
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return relative path to be used by the client
    res.json({ success: true, filename: req.file.filename });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Vite in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production build...');
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Dist folder not found, falling back to basic handler');
      app.get('*', (req, res) => {
        res.status(404).send('Not Found - Application not built');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
