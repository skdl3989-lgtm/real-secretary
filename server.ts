import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEOS_FILE = path.join(__dirname, 'src', 'constants', 'videos.json');

// Ensure the data file exists
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
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
