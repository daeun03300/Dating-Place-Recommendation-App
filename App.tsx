import React, { useState } from 'react';
import { LocationState, SearchState, Review } from './types';
import { fetchDateCourse } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultSection from './components/ResultSection';
import ReviewForm from './components/ReviewForm';
import GuideModal from './components/GuideModal';
import { Heart, Sparkles, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [location, setLocation] = useState<LocationState>({
    city: '',
    district: '',
    neighborhood: ''
  });

  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    result: null
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!location.city || !location.district || !location.neighborhood) return;

    setSearchState(prev => ({ ...prev, isLoading: true, error: null, result: null }));

    const locationString = `${location.city} ${location.district} ${location.neighborhood}`;

    try {
      const result = await fetchDateCourse(locationString);
      setSearchState({
        isLoading: false,
        error: null,
        result
      });
    } catch (err: any) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "알 수 없는 오류가 발생했습니다."
      }));
    }
  };

  const handleAddReview = (text: string) => {
    // Determine side (Left or Right) to avoid center content
    const isLeft = Math.random() > 0.5;
    
    // Left zone: 2% - 15%
    // Right zone: 85% - 98%
    const x = isLeft 
      ? Math.random() * 13 + 2 
      : Math.random() * 13 + 85;

    const newReview: Review = {
      id: Date.now().toString(),
      text,
      x: x,
      y: Math.random() * 90 + 5, // 5% to 95% vertical
      rotation: Math.random() * 40 - 20, // -20 to 20 deg
    };
    setReviews(prev => [...prev, newReview]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Floating Hearts */}
      <div className="absolute top-20 left-10 text-pink-200 animate-pulse delay-700">
        <Heart className="w-12 h-12 fill-current" />
      </div>
      <div className="absolute top-40 right-20 text-rose-200 animate-bounce delay-1000 duration-[3000ms]">
        <Heart className="w-8 h-8 fill-current" />
      </div>
       <div className="absolute bottom-20 left-1/4 text-pink-200/60 animate-pulse delay-500">
        <Heart className="w-16 h-16 fill-current" />
      </div>

      {/* Anonymous Reviews Background */}
      {reviews.map((review) => (
        <div
          key={review.id}
          className="absolute font-jua text-rose-300/60 pointer-events-none select-none text-xl md:text-2xl z-0 whitespace-nowrap animate-fade-in"
          style={{
            top: `${review.y}%`,
            left: `${review.x}%`,
            transform: `translate(-50%, -50%) rotate(${review.rotation}deg)`,
          }}
        >
          "{review.text}"
        </div>
      ))}

      {/* Guide Button */}
      <button 
        onClick={() => setIsGuideOpen(true)}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-30 flex items-center gap-1.5 bg-white/50 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full shadow-sm text-gray-500 hover:text-rose-500 transition-all font-jua text-sm border border-pink-100 hover:shadow-md"
      >
        <HelpCircle className="w-4 h-4" />
        사용 안내
      </button>

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <main className="relative z-10 container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in relative">
            <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg shadow-pink-100 mb-6 border border-pink-100">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
                <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-spin-slow" />
            </div>
            <h1 className="text-5xl md:text-6xl font-jua text-gray-800 mb-4 tracking-wide drop-shadow-sm">
                오늘의 <span className="text-rose-500">데이트</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed font-medium">
                "우리 오늘 어디 갈까?"<br/>
                고민하지 말고, <span className="text-rose-500 font-bold">사랑스러운 하루</span>를 만들어보세요.
            </p>
        </header>

        {/* Input Section */}
        <InputForm 
          location={location} 
          setLocation={setLocation} 
          onSubmit={handleSearch}
          isLoading={searchState.isLoading}
        />

        {/* Error Message */}
        {searchState.error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-2 animate-shake shadow-sm">
                <span>⚠️ {searchState.error}</span>
            </div>
        )}

        {/* Results Section */}
        {searchState.result && (
          <>
            <ResultSection result={searchState.result} />
            <div className="mt-8 w-full max-w-2xl animate-fade-in-up delay-300 relative z-20">
               <ReviewForm onSubmit={handleAddReview} />
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-rose-300 text-sm relative z-10 font-medium">
        Made with <Heart className="w-3 h-3 inline fill-current mx-1" /> by Daeun, Sungjin
      </footer>
    </div>
  );
};

export default App;