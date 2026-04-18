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

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentVideo, setCurrentVideo] = useState({ title: '', link: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Fetch videos from server AND check localStorage to restore user's lost data
  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(serverData => {
        // Check if user has their lost videos in browser memory
        const saved = localStorage.getItem('incheon-ai-videos');
        if (saved) {
          try {
            const localData = JSON.parse(saved);
            // If local data exists and is longer than server data, it's likely the user's missing videos
            if (localData && localData.length > 0 && localData !== serverData) {
              setVideos(localData);
              // Auto sync missing local videos back to the server
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
  }, []);

  // Save to server AND localStorage whenever videos change
  const saveToBackend = (newVideos: VideoContent[]) => {
    setVideos(newVideos);
    localStorage.setItem('incheon-ai-videos', JSON.stringify(newVideos));
    
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVideos),
    }).catch(err => console.error('Failed to save videos:', err));
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

  return (
    <div className="bg-gray-50 text-gray-900 antialiased selection:bg-brand-100 selection:text-brand-700 font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-black/5 ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
            <Bot className="text-brand-600 w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">인천AI교육비서</span>
          </div>
          <div className="hidden md:flex gap-8 font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">주요기능</a>
            <a href="#tutorials" className="hover:text-gray-900 transition-colors">사용방법</a>
            <a href="#downloads" className="hover:text-gray-900 transition-colors">자료실</a>
          </div>
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">
            시작하기
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col justify-center items-center text-center px-4 min-h-[90vh] bg-white">
        <div className="absolute inset-0 z-0">
          <TextParticleEffect 
            text="인천AI 교육비서" 
            subtitle="매일 반복되는 업무에 지치셨나요?\n인천 AI 교육비서가 선생님의 소중한 시간을 돌려드립니다."
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-50 rounded-full blur-3xl -z-10 opacity-70"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pointer-events-none mt-40">
          <motion.div 
            variants={revealVariants} 
            initial="hidden" 
            animate="visible"
          >
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
                <Files className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">공문서 초안 작성</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                핵심 내용만 입력하세요. 인천 교육청 양식에 맞춘 완벽한 기안문 초안을 10초 만에 완성해 드립니다.
              </p>
            </motion.div>

            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-[2rem] p-10 hover:shadow-soft transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-green-500">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">학사 일정 자동화</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                복잡한 주간/월간 행사 계획을 자동으로 분류하고, 학부모 가정통신문으로 변환까지 한 번에 처리합니다.
              </p>
            </motion.div>

            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-[2rem] p-10 hover:shadow-soft transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 text-purple-500">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">학생 관찰 기록 보조</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                평소 기록해둔 짧은 메모들을 종합하여, 생기부 입력에 적합한 교육적이고 정제된 문장으로 다듬어 줍니다.
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
              <button className="text-brand-600 font-bold flex items-center gap-1 hover:text-brand-700 transition-colors cursor-pointer">
                유튜브 채널 바로가기 <ArrowRight className="w-4 h-4" />
              </button>
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
      <section id="downloads" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">필요한 자료를 바로 다운로드하세요.</h2>
            <p className="text-xl text-gray-500 font-medium">상세한 사용 매뉴얼과 교육용 PPT 자료를 제공합니다.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
              className="border border-gray-100 bg-white rounded-3xl p-8 hover:border-brand-500 hover:shadow-soft transition-all duration-300 group cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <Download className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-bold mb-2">공식 사용자 매뉴얼 (PDF)</h3>
                <p className="text-gray-500 text-sm mb-4">버전 1.2 • 15MB • 2024.05 업데이트</p>
                <span className="text-brand-600 font-semibold text-sm group-hover:underline">다운로드</span>
              </div>
            </motion.div>

            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: 0.1 }}
              className="border border-gray-100 bg-white rounded-3xl p-8 hover:border-brand-500 hover:shadow-soft transition-all duration-300 group cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                  <Presentation className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <Download className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-bold mb-2">교직원 연수용 PPT 자료</h3>
                <p className="text-gray-500 text-sm mb-4">학교 자체 연수 진행을 위한 발표 자료</p>
                <span className="text-brand-600 font-semibold text-sm group-hover:underline">다운로드</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-gray-800 pb-10">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-6 h-6 fill-current" />
              <span className="font-bold text-xl tracking-tight">인천AI교육비서</span>
            </div>
            <div className="flex gap-6 font-medium text-sm">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">고객센터</a>
            </div>
          </div>
          <div className="text-sm">
            <p className="mb-2">인천광역시교육청 | 주소: 인천광역시 남동구 정각로 9 (구월동) | 대표전화: 032-420-8114</p>
            <p>© 2024 Incheon Metropolitan City Office of Education. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
