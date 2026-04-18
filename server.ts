import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEOS_FILE = path.join(__dirname, 'src', 'constants', 'videos.json');
const DOCUMENTS_FILE = path.join(__dirname, 'src', 'constants', 'documents.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'downloads');

// Ensure the data files and upload directories exist
if (!fs.existsSync(path.dirname(VIDEOS_FILE))) {
  fs.mkdirSync(path.dirname(VIDEOS_FILE), { recursive: true });
}
if (!fs.existsSync(VIDEOS_FILE)) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify([
    {
      id: 1,
      title: '[학교지원단-교원업무지원과] 인천 AI 교육비서 서비스 안내 및 활용 사례 소개',
      link: 'https://www.youtube.com/watch?v=O_6Z_rP-7V0'
    },
    {
      id: 2,
      title: '인천AI교육비서 실제 학급 경영 활용 사례',
      link: 'https://www.youtube.com/watch?v=O_6Z_rP-7V0'
    }
  ], null, 2));
}

if (!fs.existsSync(DOCUMENTS_FILE)) {
  fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([
    {
      id: 1,
      title: '공식 사용자 매뉴얼 (PDF)',
      description: '버전 1.2 • 15MB • 2024.05 업데이트',
      filename: 'manual.pdf' // Placeholders, files might not exist yet
    },
    {
      id: 2,
      title: '교직원 연수용 PPT 자료',
      description: '학교 자체 연수 진행을 위한 발표 자료',
      filename: 'training.ppt'
    }
  ], null, 2));
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

  // API Routes for Videos
  app.get('/api/videos', (req, res) => {
    try {
      const data = fs.readFileSync(VIDEOS_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
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
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
