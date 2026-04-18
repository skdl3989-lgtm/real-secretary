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
  Presentation,
  Sparkles,
  Youtube
} from 'lucide-react';
import { useEffect, useState } from 'react';
import TextParticleEffect from './components/TextParticleEffect';

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-50 rounded-full blur-3xl -z-10 opacity-70"></div>
        <TextParticleEffect text="인천AI 교육비서" />

        <motion.div 
          variants={revealVariants} 
          initial="hidden" 
          animate="visible"
          className="max-w-4xl mx-auto relative z-10 pointer-events-none"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-12 leading-[1.1] opacity-0 text-gray-900">
            인천AI 교육비서
          </h1>
        </motion.div>

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
            <button className="text-brand-600 font-bold flex items-center gap-1 hover:text-brand-700 transition-colors cursor-pointer">
              유튜브 채널 바로가기 <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Video 1 */}
            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-[2rem] p-4 shadow-soft transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-hover">
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <Youtube className="w-16 h-16 text-red-500 mb-2 fill-current" />
                    <span className="font-medium">기본 사용법 영상 (클릭 시 재생)</span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-sm font-bold text-brand-600 mb-2 block">Step 1. 기초 다지기</span>
                  <h3 className="text-xl font-bold mb-2">인천AI교육비서 처음 시작하기</h3>
                  <p className="text-gray-500">로그인부터 첫 공문서 초안 작성까지 3분 만에 마스터하기</p>
                </div>
              </div>
            </motion.div>

            {/* Video 2 */}
            <motion.div 
              variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: 0.1 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-[2rem] p-4 shadow-soft transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-hover">
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <Youtube className="w-16 h-16 text-red-500 mb-2 fill-current" />
                    <span className="font-medium">고급 활용법 영상 (클릭 시 재생)</span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-sm font-bold text-purple-600 mb-2 block">Step 2. 실전 활용</span>
                  <h3 className="text-xl font-bold mb-2">학기말 생기부 작성 보조 활용 꿀팁</h3>
                  <p className="text-gray-500">메모를 문장으로, 문장을 교육적 기록으로 변환하는 노하우</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
