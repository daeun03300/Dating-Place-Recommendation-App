import React, { useState } from 'react';
import { LocationState, SearchState } from './types';
import { fetchDateCourse } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultSection from './components/ResultSection';
import { Heart, Sparkles } from 'lucide-react';

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
          <ResultSection result={searchState.result} />
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