import React, { useState } from 'react';
import { LocationState, SearchState } from './types';
import { fetchDateCourse } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultSection from './components/ResultSection';
import { Heart } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[80px] pointer-events-none" />

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-6">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4 tracking-tight">
                오늘의 데이트
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                동네만 입력하세요. <br className="hidden md:block"/>
                맛집부터 포토존까지 완벽한 코스를 짜드립니다.
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
            <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 animate-shake">
                <span>⚠️ {searchState.error}</span>
            </div>
        )}

        {/* Results Section */}
        {searchState.result && (
          <ResultSection result={searchState.result} />
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-400 text-sm relative z-10">
        &copy; {new Date().getFullYear()} DateCourse KR. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
