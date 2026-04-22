import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Bot,
  CalendarCheck,
  Download,
  FileText,
  Files,
  GraduationCap,
  PlayCircle,
  Plus,
  Presentation,
  Settings,
  Sparkles,
  Trash2,
  X,
  Youtube
} from 'lucide-react';
import { useEffect, useState } from 'react';
import TextParticleEffect from './components/TextParticleEffect';

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

interface VideoContent {
  id: number;
  title: string;
  link: string;
}

interface DocumentContent {
  id: number;
  title: string;
  description: string;
  filename: string;
}

interface PopupContent {
  id: number;
  type: 'image' | 'youtube';
  title: string;
  description?: string;
  content: string; // filename or youtube URL
  linkUrl?: string; // where to go when image is clicked
  buttonText?: string; // text for the CTA button
  isActive: boolean;
}

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Video Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentVideo, setCurrentVideo] = useState({ title: '', link: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [videos, setVideos] = useState<VideoContent[]>([]);

  // Document Modal States
  const [documents, setDocuments] = useState<DocumentContent[]>([]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalMode, setDocModalMode] = useState<'add' | 'edit'>('add');
  const [currentDoc, setCurrentDoc] = useState<{title: string, description: string, file: File | null}>({ title: '', description: '', file: null });
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Popup Management States
  const [popups, setPopups] = useState<PopupContent[]>([]);
  const [visiblePopups, setVisiblePopups] = useState<PopupContent[]>([]);
  
  const [isPopupManagerOpen, setIsPopupManagerOpen] = useState(false);
  const [popupModalMode, setPopupModalMode] = useState<'list' | 'add' | 'edit'>('list');
  const [currentPopupForm, setCurrentPopupForm] = useState<{title: string, description: string, type: 'image' | 'youtube', content: string, linkUrl: string, buttonText: string, isActive: boolean, file: File | null}>({ title: '', description: '', type: 'image', content: '', linkUrl: '', buttonText: '', isActive: true, file: null });
  const [editingPopupId, setEditingPopupId] = useState<number | null>(null);
  const [deletingPopupId, setDeletingPopupId] = useState<number | null>(null);

  // Fetch videos, documents, and popups from server
  useEffect(() => {
    // Helper function to safely fetch JSON
    const fetchJson = async (url: string) => {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error(`Failed to fetch ${url} or invalid JSON response`);
      }
      return res.json();
    };

    // Fetch Videos
    fetchJson('/api/videos')
      .then(serverData => {
        const saved = localStorage.getItem('incheon-ai-videos');
        if (saved) {
          try {
            const localData = JSON.parse(saved);
            if (localData && localData.length > 0 && localData !== serverData) {
              setVideos(localData);
              fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localData),
              });
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        setVideos(serverData);
      })
      .catch(err => console.error('Failed to load videos:', err));

    // Fetch Documents
    fetchJson('/api/documents')
      .then(serverData => setDocuments(serverData))
      .catch(err => console.error('Failed to load documents:', err));

    // Fetch Popups
    fetchJson('/api/popups')
      .then(serverData => {
        setPopups(serverData);
        
        // Filter active popups and check local storage for "don't show today"
        const activePopups = serverData.filter((p: PopupContent) => {
          if (!p.isActive) return false;
          const hideUntil = localStorage.getItem(`hide_popup_${p.id}`);
          if (hideUntil && parseInt(hideUntil) > Date.now()) {
            return false;
          }
          return true;
        });
        setVisiblePopups(activePopups);
      })
      .catch(err => console.error('Failed to load popups:', err));
  }, []);

  // Save to server
  const saveToBackend = (newVideos: VideoContent[]) => {
    setVideos(newVideos);
    localStorage.setItem('incheon-ai-videos', JSON.stringify(newVideos));
    
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVideos),
    }).catch(err => console.error('Failed to save videos:', err));
  };

  const saveDocsToBackend = (newDocuments: DocumentContent[]) => {
    setDocuments(newDocuments);
    fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDocuments),
    }).catch(err => console.error('Failed to save documents:', err));
  };

  const getYouTubeId = (url: string) => {
    // Shorts, Live, Watch 등 다양한 패턴 대응
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentVideo({ title: '', link: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (video: VideoContent) => {
    setModalMode('edit');
    setEditingId(video.id);
    setCurrentVideo({ title: video.title, link: video.link });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: number) => {
    const newVideos = videos.filter(v => v.id !== id);
    saveToBackend(newVideos);
    setDeletingId(null);
  };

  const handleSave = () => {
    if (!currentVideo.title.trim() || !currentVideo.link.trim()) {
      alert('제목과 링크를 모두 입력해주세요.');
      return;
    }

    let newVideos = [...videos];
    if (modalMode === 'add') {
      const newVideo = {
        id: Date.now(),
        ...currentVideo
      };
      newVideos = [...newVideos, newVideo];
    } else if (editingId !== null) {
      newVideos = newVideos.map(v => v.id === editingId ? { ...v, ...currentVideo } : v);
    }
    
    saveToBackend(newVideos);
    setIsModalOpen(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Document Handlers
  const openAddDocModal = () => {
    setDocModalMode('add');
    setCurrentDoc({ title: '', description: '', file: null });
    setIsDocModalOpen(true);
  };

  const openEditDocModal = (doc: DocumentContent) => {
    setDocModalMode('edit');
    setEditingDocId(doc.id);
    setCurrentDoc({ title: doc.title, description: doc.description, file: null });
    setIsDocModalOpen(true);
  };

  const confirmDeleteDoc = (id: number) => {
    const newDocs = documents.filter(d => d.id !== id);
    saveDocsToBackend(newDocs);
    setDeletingDocId(null);
  };

  const handleSaveDoc = async () => {
    if (!currentDoc.title.trim()) {
      alert('자료 제목을 입력해주세요.');
      return;
    }
    
    // In Add mode, file is required
    if (docModalMode === 'add' && !currentDoc.file) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    let filenameToSave = '';

    // If there's a new file, upload it
    if (currentDoc.file) {
      const formData = new FormData();
      formData.append('file', currentDoc.file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          filenameToSave = result.filename;
        } else {
          alert('파일 업로드에 실패했습니다.');
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        alert('파일 업로드 오류가 발생했습니다.');
        setIsUploading(false);
        return;
      }
    }

    let newDocs = [...documents];
    if (docModalMode === 'add') {
      const newDoc: DocumentContent = {
        id: Date.now(),
        title: currentDoc.title,
        description: currentDoc.description,
        filename: filenameToSave
      };
      newDocs = [...newDocs, newDoc];
    } else if (editingDocId !== null) {
      // In edit mode, if no new file is selected, keep the old filename
      const existingDoc = newDocs.find(d => d.id === editingDocId);
      newDocs = newDocs.map(d => d.id === editingDocId ? { 
        ...d, 
        title: currentDoc.title, 
        description: currentDoc.description,
        filename: currentDoc.file ? filenameToSave : (existingDoc?.filename || '')
      } : d);
    }
    
    saveDocsToBackend(newDocs);
    setIsUploading(false);
    setIsDocModalOpen(false);
  };

  // Popup Management Handlers
  const savePopupsToBackend = (newPopups: PopupContent[]) => {
    setPopups(newPopups);
    fetch('/api/popups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPopups),
    }).catch(err => console.error('Failed to save popups:', err));
  };

  const openPopupManager = () => {
    setPopupModalMode('list');
    setIsPopupManagerOpen(true);
  };

  const openAddPopupForm = () => {
    setPopupModalMode('add');
    setCurrentPopupForm({ title: '', description: '', type: 'image', content: '', linkUrl: '', buttonText: '', isActive: true, file: null });
  };

  const openEditPopupForm = (popup: PopupContent) => {
    setPopupModalMode('edit');
    setEditingPopupId(popup.id);
    setCurrentPopupForm({ 
      title: popup.title, 
      description: popup.description || '',
      type: popup.type, 
      content: popup.content, 
      linkUrl: popup.linkUrl || '', 
      buttonText: popup.buttonText || '',
      isActive: popup.isActive, 
      file: null 
    });
  };

  const confirmDeletePopup = (id: number) => {
    const newPopups = popups.filter(p => p.id !== id);
    savePopupsToBackend(newPopups);
    setDeletingPopupId(null);
  };

  const handleSavePopup = async () => {
    if (!currentPopupForm.title.trim()) {
      alert('팝업 제목을 입력해주세요.');
      return;
    }
    if (currentPopupForm.type === 'youtube' && !currentPopupForm.content.trim()) {
      alert('유튜브 URL을 입력해주세요.');
      return;
    }
    if (currentPopupForm.type === 'image' && popupModalMode === 'add' && !currentPopupForm.file) {
      alert('이미지 파일을 업로드해주세요.');
      return;
    }

    setIsUploading(true);
    let contentToSave = currentPopupForm.content;

    if (currentPopupForm.type === 'image' && currentPopupForm.file) {
      const formData = new FormData();
      formData.append('file', currentPopupForm.file);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          contentToSave = result.filename;
        } else {
          alert('이미지 업로드에 실패했습니다.');
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        alert('이미지 업로드 오류가 발생했습니다.');
        setIsUploading(false);
        return;
      }
    }

    let newPopups = [...popups];
    if (popupModalMode === 'add') {
      const newPopup: PopupContent = {
        id: Date.now(),
        type: currentPopupForm.type,
        title: currentPopupForm.title,
        description: currentPopupForm.description,
        content: contentToSave,
        linkUrl: currentPopupForm.linkUrl,
        buttonText: currentPopupForm.buttonText,
        isActive: currentPopupForm.isActive
      };
      newPopups = [...newPopups, newPopup];
    } else if (editingPopupId !== null) {
      const existingPopup = newPopups.find(p => p.id === editingPopupId);
      newPopups = newPopups.map(p => p.id === editingPopupId ? {
        ...p,
        title: currentPopupForm.title,
        description: currentPopupForm.description,
        type: currentPopupForm.type,
        content: currentPopupForm.file ? contentToSave : (currentPopupForm.type === 'image' ? (existingPopup?.content || '') : contentToSave),
        linkUrl: currentPopupForm.linkUrl,
        buttonText: currentPopupForm.buttonText,
        isActive: currentPopupForm.isActive
      } : p);
    }

    savePopupsToBackend(newPopups);
    setIsUploading(false);
    setPopupModalMode('list');
  };

  const closeActivePopup = (id: number, dontShowToday: boolean = false) => {
    if (dontShowToday) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // End of today
      localStorage.setItem(`hide_popup_${id}`, tomorrow.getTime().toString());
    }
    setVisiblePopups(prev => prev.filter(p => p.id !== id));
  };


  return (
    <div className="bg-gray-50 text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-700 font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-black/5 ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
            <Bot className="text-brand-600 w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">인천AI교육비서 도우미</span>
          </div>
          <div className="hidden md:flex gap-8 font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">주요기능</a>
            <a href="#tutorials" className="hover:text-gray-900 transition-colors">사용방법</a>
            <a href="#downloads" className="hover:text-gray-900 transition-colors">자료실</a>
          </div>
          <motion.button 
            onClick={() => window.location.href = 'https://auth.mycl.io/realms/telas/protocol/openid-connect/auth?client_id=b2b&redirect_uri=https%3A%2F%2Fmycl.io%2F%3Ftenant%3Dincheon&state=b7803258-2719-4d01-a1d0-713cdc7f4511&response_mode=fragment&response_type=code&scope=openid&nonce=bb316bba-03fd-4543-9ca4-2dfd3d0b83d6&code_challenge=2Vzbn3Yi5YcetP1tBRSWGr78aFpnHxuN4m9XB1PTWls&code_challenge_method=S256'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: ["0px 0px 0px 0px rgba(37, 99, 235, 0)", "0px 0px 15px 4px rgba(37, 99, 235, 0.4)", "0px 0px 0px 0px rgba(37, 99, 235, 0)"] 
            }}
            transition={{ 
              boxShadow: { repeat: Infinity, duration: 2 }
            }}
            className="relative overflow-hidden bg-brand-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-700 transition-colors shadow-lg cursor-pointer flex items-center gap-2 group"
          >
            <motion.div
              initial={{ x: '-150%' }}
              animate={{ x: '150%' }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[25deg] pointer-events-none"
            />
            <Sparkles className="w-4 h-4 text-blue-100 group-hover:rotate-12 transition-transform" />
            시작하기
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col justify-center items-center text-center px-4 min-h-[90vh] bg-white">
        <div className="absolute inset-0 z-0">
          <TextParticleEffect 
            text="인천AI 교육비서" 
            subtitle={"매일 반복되는 업무에 지치셨나요?\n인천 AI 교육비서가 선생님의 소중한 시간을 돌려드립니다."}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-50 rounded-full blur-3xl -z-10 opacity-70"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pointer-events-none mb-20">
          <motion.div 
            variants={revealVariants} 
            initial="hidden" 
            animate="visible"
            className="flex flex-col items-center gap-12"
          >
            {/* The gap here is handled by the TextParticleEffect's internal positioning */}
            <div className="h-[25vh]"></div> 
            
            <motion.button
              initial={{ y: -800, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring",
                damping: 15,
                stiffness: 70,
                delay: 1.5, // Appears after the main text starts settling
              }}
              onClick={() => window.location.href = 'https://auth.mycl.io/realms/telas/protocol/openid-connect/auth?client_id=b2b&redirect_uri=https%3A%2F%2Fmycl.io%2F%3Ftenant%3Dincheon&state=b7803258-2719-4d01-a1d0-713cdc7f4511&response_mode=fragment&response_type=code&scope=openid&nonce=bb316bba-03fd-4543-9ca4-2dfd3d0b83d6&code_challenge=2Vzbn3Yi5YcetP1tBRSWGr78aFpnHxuN4m9XB1PTWls&code_challenge_method=S256'}
              className="pointer-events-auto bg-brand-600 text-white px-12 py-5 rounded-full font-bold text-2xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/40 flex items-center gap-4 group relative overflow-hidden active:scale-95"
            >
              <motion.div
                initial={{ x: '-150%' }}
                animate={{ x: '150%' }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-[25deg] pointer-events-none"
              />
              <Sparkles className="w-7 h-7 text-blue-100 group-hover:rotate-12 transition-transform" />
              지금 시작하기
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            variants={revealVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.15 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">똑똑하게, 그리고 완벽하게.</h2>
            <p className="text-xl text-gray-500 font-medium">선생님의 업무 패턴을 학습하여 최적의 결과를 제공합니다.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
              className="bg-gray-50 rounded-[2rem] p-10 hover:shadow-soft transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-brand-600">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">최신 멀티 LLM 통합 지원</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                ChatGPT, Claude, Gemini 등 최신 생성형 AI를 한 곳에서 활용하세요. 교육청 지침과 지원 공문을 근거로 정확하고 신뢰할 수 있는 맞춤형 답변을 제공합니다.
              </p>
            </motion.div>

            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-[2rem] p-10 hover:shadow-soft transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-green-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">맞춤형 AI 업무 챗봇 생성</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                복잡한 프롬프트 작성 없이도 내 업무에 딱 맞는 AI 챗봇을 손쉽게 만들 수 있습니다. 다른 선생님들이 미리 만들어둔 유용한 챗봇도 공유받아 즉시 활용해 보세요.
              </p>
            </motion.div>

            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-[2rem] p-10 hover:shadow-soft transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-purple-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">똑똑한 AI 한글 문서 에디터</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                기존 한글(HWP) 문서의 표와 양식을 무너뜨리지 않고 AI가 자연스럽게 빈칸을 채워줍니다. 번거로운 복사·붙여넣기 없이 복잡한 서류 작업을 단숨에 끝내세요.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tutorial Videos Section */}
      <section id="tutorials" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">어떻게 사용하나요?</h2>
              <p className="text-xl text-gray-500 font-medium">짧은 영상으로 모든 기능을 쉽게 익힐 수 있습니다.</p>
            </div>
            <div className="flex gap-4">
              {import.meta.env.DEV && (
                <button 
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors cursor-pointer shadow-lg shadow-brand-500/20"
                >
                  <Plus className="w-4 h-4" />
                  영상 추가
                </button>
              )}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {videos.map((video, idx) => (
              <motion.div 
                key={video.id}
                variants={revealVariants} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="bg-white rounded-[2rem] p-4 shadow-soft transition-transform duration-300 hover:-translate-y-2 hover:shadow-hover overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center group/vid shadow-inner">
                    {playingId === video.id ? (
                      <iframe 
                        className="absolute inset-0 w-full h-full z-30"
                        src={`https://www.youtube.com/embed/${getYouTubeId(video.link)}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const id = getYouTubeId(video.link);
                          if (id) {
                            setPlayingId(video.id);
                          } else {
                            window.open(video.link, '_blank');
                          }
                        }}
                        className="absolute inset-0 z-10 w-full h-full p-0 border-none bg-transparent cursor-pointer group/btn overflow-hidden"
                      >
                        <img 
                          src={getYouTubeId(video.link) 
                            ? `https://img.youtube.com/vi/${getYouTubeId(video.link)}/0.jpg` 
                            : 'https://picsum.photos/seed/edu/800/450'
                          }
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/vid:scale-110"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/seed/edu/800/450';
                          }}
                        />
                        {/* Play Icon Overlay - Only visible clearly on hover, thumbnail is clear by default */}
                        <div className="absolute inset-0 bg-black/0 group-hover/btn:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white transform scale-90 opacity-90 group-hover/btn:scale-100 group-hover/btn:opacity-100 transition-all shadow-2xl">
                            <Youtube className="w-10 h-10 fill-current" />
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 line-clamp-2 leading-snug">{video.title}</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">YouTube Content</span>
                      </div>
                      {import.meta.env.DEV && (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              openEditModal(video);
                            }}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all cursor-pointer"
                            title="수정"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setDeletingId(video.id);
                            }}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Custom Delete Confirmation Overlay */}
                  {deletingId === video.id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                    >
                      <Trash2 className="w-12 h-12 text-red-500 mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 mb-2">영상을 삭제할까요?</h4>
                      <p className="text-sm text-gray-500 mb-6">삭제된 영상은 복구할 수 없습니다.</p>
                      <div className="flex gap-3 w-full max-w-[240px]">
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                        >
                          취소
                        </button>
                        <button 
                          onClick={() => confirmDelete(video.id)}
                          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                        >
                          삭제
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? '새 영상 추가' : '영상 정보 수정'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">영상 제목</label>
                  <input 
                    type="text" 
                    value={currentVideo.title}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                    placeholder="선생님들이 알아보기 쉬운 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">유튜브 링크 URL</label>
                  <input 
                    type="text" 
                    value={currentVideo.link}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, link: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="mt-2 text-xs text-gray-400">유튜브 영상의 공유 주소를 복사해서 넣어주세요.</p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                className="flex-2 py-4 px-6 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98]"
              >
                {modalMode === 'add' ? '콘텐츠 등록하기' : '수정 완료'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resources / Download Section */}
      <section id="downloads" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
            className="mb-16 relative"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">필요한 자료를 바로 다운로드하세요.</h2>
            
            {import.meta.env.DEV && (
              <button 
                onClick={openAddDocModal}
                className="absolute right-0 top-0 hidden md:flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2.5 rounded-xl font-bold hover:bg-brand-100 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                자료 추가하기
              </button>
            )}
            {import.meta.env.DEV && (
              <div className="mt-6 md:hidden flex justify-center">
                <button 
                  onClick={openAddDocModal}
                  className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2.5 rounded-xl font-bold hover:bg-brand-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  자료 추가하기
                </button>
              </div>
            )}
          </motion.div>

          {documents.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              {documents.map((doc, idx) => (
                <motion.div 
                  key={doc.id}
                  variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: idx * 0.1 }}
                  className="relative border border-gray-100 bg-white rounded-3xl p-8 hover:border-brand-500 hover:shadow-soft transition-all duration-300 group flex flex-col h-full"
                >
                  <a href={`/downloads/${doc.filename}`} download className="absolute inset-0 z-10" aria-label={`${doc.title} 다운로드`} />
                  
                  <div className="flex justify-between items-start mb-8 relative z-0">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors relative z-0">
                      <Download className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="mt-auto relative z-20 pointer-events-none">
                    <h3 className="text-xl font-bold mb-2 pr-12 line-clamp-2 pointer-events-auto w-max">{doc.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 pointer-events-auto w-max">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-600 font-semibold text-sm group-hover:underline pointer-events-auto">다운로드</span>
                      {import.meta.env.DEV && (
                        <div className="flex gap-2 relative z-20 pointer-events-auto">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              openEditDocModal(doc);
                            }}
                            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
                            title="수정"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setDeletingDocId(doc.id);
                            }}
                            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {deletingDocId === doc.id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-3xl"
                    >
                      <Trash2 className="w-12 h-12 text-red-500 mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 mb-2">자료를 삭제할까요?</h4>
                      <p className="text-sm text-gray-500 mb-6">삭제된 자료는 복구할 수 없습니다.</p>
                      <div className="flex gap-3 w-full max-w-[240px]">
                        <button 
                          onClick={(e) => { e.preventDefault(); setDeletingDocId(null); }}
                          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer"
                        >
                          취소
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); confirmDeleteDoc(doc.id); }}
                          className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 cursor-pointer"
                        >
                          삭제
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
              <Files className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">등록된 자료가 없습니다.</h3>
              {import.meta.env.DEV && <p className="text-gray-400">자료 추가하기 버튼을 눌러 새 자료를 업로드해보세요.</p>}
            </div>
          )}
        </div>
      </section>

      {/* Document Add/Edit Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => !isUploading && setIsDocModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 pb-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{docModalMode === 'add' ? '새 자료 등록하기' : '자료 수정하기'}</h2>
              </div>
              <button 
                onClick={() => !isUploading && setIsDocModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">자료 제목</label>
                  <input 
                    type="text" 
                    value={currentDoc.title}
                    onChange={(e) => setCurrentDoc({ ...currentDoc, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                    placeholder="예) 공식 사용자 매뉴얼 (PDF)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">설명 캡션</label>
                  <input 
                    type="text" 
                    value={currentDoc.description}
                    onChange={(e) => setCurrentDoc({ ...currentDoc, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                    placeholder="예) 최신 업데이트 버전 안내"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">파일 업로드</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Download className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500 font-bold">
                          {currentDoc.file ? currentDoc.file.name : (docModalMode === 'edit' ? '새 파일을 선택하려면 클릭' : '클릭하여 파일 업로드')}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setCurrentDoc({ ...currentDoc, file: e.target.files[0] });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {docModalMode === 'edit' && !currentDoc.file && (
                    <p className="mt-2 text-xs text-gray-400">파일을 다시 선택하지 않으면 기존 파일이 유지됩니다.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => !isUploading && setIsDocModalOpen(false)}
                className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                disabled={isUploading}
              >
                취소
              </button>
              <button 
                onClick={handleSaveDoc}
                className="flex-2 py-4 px-6 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    업로드 중...
                  </>
                ) : (
                  docModalMode === 'add' ? '콘텐츠 업로드 및 저장' : '수정 완료'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Visitor Popup Display */}
      {visiblePopups.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
            <button 
              onClick={() => closeActivePopup(visiblePopups[0].id)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto">
              {visiblePopups[0].type === 'youtube' ? (
                 <div className="aspect-video w-full bg-black">
                   <iframe 
                     className="w-full h-full"
                     src={`https://www.youtube.com/embed/${getYouTubeId(visiblePopups[0].content)}?autoplay=1`}
                     title={visiblePopups[0].title}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   ></iframe>
                 </div>
              ) : (
                 <div className="relative w-full">
                   {visiblePopups[0].linkUrl ? (
                     <a href={visiblePopups[0].linkUrl} target="_blank" rel="noopener noreferrer">
                       <img src={`/downloads/${visiblePopups[0].content}`} alt={visiblePopups[0].title} className="w-full h-auto object-contain" />
                     </a>
                   ) : (
                     <img src={`/downloads/${visiblePopups[0].content}`} alt={visiblePopups[0].title} className="w-full h-auto object-contain" />
                   )}
                 </div>
              )}
              {visiblePopups[0].description && (
                <div className="p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{visiblePopups[0].title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-6">{visiblePopups[0].description}</p>
                  
                  {visiblePopups[0].linkUrl && (
                    <a 
                      href={visiblePopups[0].linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full py-4 px-6 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                    >
                      {visiblePopups[0].buttonText || '자세히 보기'}
                    </a>
                  )}
                </div>
              )}
              {!visiblePopups[0].description && visiblePopups[0].linkUrl && (
                <div className="p-6 bg-white pt-2">
                  <a 
                    href={visiblePopups[0].linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-4 px-6 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                  >
                    {visiblePopups[0].buttonText || '자세히 보기'}
                  </a>
                </div>
              )}
            </div>
            <div className="bg-gray-50 border-t border-gray-100 p-4">
               <button 
                 onClick={() => closeActivePopup(visiblePopups[0].id, true)}
                 className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
               >
                 오늘 하루 그만 보기
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Manager Modal */}
      {isPopupManagerOpen && import.meta.env.DEV && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isUploading && setIsPopupManagerOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 pb-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {popupModalMode === 'list' ? '팝업 관리' : (popupModalMode === 'add' ? '새 팝업 등록' : '팝업 수정')}
              </h2>
              <button 
                onClick={() => !isUploading && setIsPopupManagerOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {popupModalMode === 'list' ? (
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <button onClick={openAddPopupForm} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold cursor-pointer">
                      <Plus className="w-4 h-4" /> 팝업 추가
                    </button>
                  </div>
                  {popups.length > 0 ? (
                    <div className="grid gap-4">
                      {popups.map(popup => (
                        <div key={popup.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${popup.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div>
                              <h4 className="font-bold text-gray-900">{popup.title}</h4>
                              {popup.description && <p className="text-sm text-gray-500 line-clamp-1">{popup.description}</p>}
                              <p className="text-xs text-gray-400 uppercase mt-1">{popup.type}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openEditPopupForm(popup)} className="p-2 text-gray-400 hover:text-brand-600 cursor-pointer bg-gray-50 rounded-lg"><Settings className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingPopupId(popup.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer bg-gray-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">등록된 팝업이 없습니다.</div>
                  )}

                  {deletingPopupId !== null && (
                    <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur flex flex-col items-center justify-center">
                       <p className="text-lg font-bold mb-4">정말 삭제하시겠습니까?</p>
                       <div className="flex gap-4">
                         <button onClick={() => setDeletingPopupId(null)} className="px-6 py-2 bg-gray-200 rounded-xl cursor-pointer font-bold">취소</button>
                         <button onClick={() => confirmDeletePopup(deletingPopupId)} className="px-6 py-2 bg-red-600 text-white rounded-xl cursor-pointer font-bold">삭제</button>
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">팝업 제목 (관리용)</label>
                    <input type="text" value={currentPopupForm.title} onChange={e => setCurrentPopupForm({...currentPopupForm, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="예: 2024 신규 연수 안내" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">팝업 설명 (선택사항)</label>
                    <textarea value={currentPopupForm.description} onChange={e => setCurrentPopupForm({...currentPopupForm, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500" placeholder="팝업에 대한 간단한 설명을 입력하세요." rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">활성화 상태</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={currentPopupForm.isActive} onChange={e => setCurrentPopupForm({...currentPopupForm, isActive: e.target.checked})} className="w-5 h-5 rounded text-brand-600" />
                      <span>홈페이지 접속 시 팝업 띄우기</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">팝업 유형</label>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl flex-1">
                        <input type="radio" name="popuptype" checked={currentPopupForm.type === 'image'} onChange={() => setCurrentPopupForm({...currentPopupForm, type: 'image'})} />
                        <span>이미지 업로드</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl flex-1">
                        <input type="radio" name="popuptype" checked={currentPopupForm.type === 'youtube'} onChange={() => setCurrentPopupForm({...currentPopupForm, type: 'youtube'})} />
                        <span>유튜브 영상</span>
                      </label>
                    </div>
                  </div>
                  
                  {currentPopupForm.type === 'youtube' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">유튜브 링크 URL</label>
                      <input type="text" value={currentPopupForm.content} onChange={e => setCurrentPopupForm({...currentPopupForm, content: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                  )}

                  {currentPopupForm.type === 'image' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">이미지 업로드</label>
                        <input type="file" accept="image/*" onChange={e => setCurrentPopupForm({...currentPopupForm, file: e.target.files ? e.target.files[0] : null})} className="w-full p-2 bg-white border border-gray-200 rounded-xl" />
                        {popupModalMode === 'edit' && !currentPopupForm.file && <p className="text-xs text-gray-400 mt-2">새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다.</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">클릭 시 이동할 링크 (선택사항)</label>
                          <input type="text" value={currentPopupForm.linkUrl} onChange={e => setCurrentPopupForm({...currentPopupForm, linkUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">버튼 글자 (선택사항)</label>
                          <input type="text" value={currentPopupForm.buttonText} onChange={e => setCurrentPopupForm({...currentPopupForm, buttonText: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="예: 자세히 보기" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {popupModalMode !== 'list' && (
              <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
                <button onClick={() => setPopupModalMode('list')} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl cursor-pointer">취소</button>
                <button onClick={handleSavePopup} disabled={isUploading} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl cursor-pointer flex justify-center">
                  {isUploading ? '저장 중...' : '저장하기'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 relative">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm font-medium">
          <p>개발자 및 저작권자 인천봉수초 홍찬우</p>
          {import.meta.env.DEV && (
            <button 
              onClick={openPopupManager}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors cursor-pointer text-xs"
            >
              <Settings className="w-4 h-4" /> 팝업 관리
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
