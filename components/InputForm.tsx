import React from 'react';
import { LocationState } from '../types';
import { KOREA_CITIES } from '../constants';
import { MapPin, Search, Heart } from 'lucide-react';

interface InputFormProps {
  location: LocationState;
  setLocation: React.Dispatch<React.SetStateAction<LocationState>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ location, setLocation, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = location.city && location.district && location.neighborhood;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 border border-pink-100 transform transition-all hover:shadow-[0_8px_30px_rgb(255,192,203,0.3)]">
      <div className="flex items-center justify-center gap-2 mb-8 text-gray-800">
        <MapPin className="w-6 h-6 text-rose-500" />
        <h2 className="text-2xl font-jua text-gray-800">어디서 만날까요?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* City Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-500 ml-1">시/도</label>
          <div className="relative">
            <select
                name="city"
                value={location.city}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-pink-100 bg-pink-50/30 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-gray-800 appearance-none cursor-pointer hover:bg-pink-50/50"
                disabled={isLoading}
            >
                <option value="">선택</option>
                {KOREA_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-rose-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
        </div>

        {/* District Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-500 ml-1">시/군/구</label>
          <input
            type="text"
            name="district"
            value={location.district}
            onChange={handleChange}
            placeholder="예: 강남구"
            className="w-full p-4 rounded-2xl border border-pink-100 bg-pink-50/30 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-gray-800 placeholder-gray-400 hover:bg-pink-50/50"
            disabled={isLoading}
          />
        </div>

        {/* Neighborhood Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-500 ml-1">읍/면/동</label>
          <input
            type="text"
            name="neighborhood"
            value={location.neighborhood}
            onChange={handleChange}
            placeholder="예: 역삼동"
            className="w-full p-4 rounded-2xl border border-pink-100 bg-pink-50/30 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-gray-800 placeholder-gray-400 hover:bg-pink-50/50"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isFormValid || isLoading}
        className={`w-full py-4 rounded-2xl font-jua text-xl text-white shadow-lg transition-all transform active:scale-[0.98]
          ${isFormValid && !isLoading 
            ? 'bg-gradient-to-r from-pink-400 via-rose-500 to-pink-500 shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
      >
        <div className="flex items-center justify-center gap-2">
            {isLoading ? (
            <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>두근두근 코스 찾는 중...</span>
            </>
            ) : (
            <>
                <Heart className={`w-5 h-5 ${isFormValid ? 'fill-white animate-pulse' : ''}`} />
                <span>데이트 코스 추천받기</span>
            </>
            )}
        </div>
      </button>
      
      {!isFormValid && (
        <p className="text-center text-xs text-rose-300 mt-4 font-medium bg-rose-50 py-2 rounded-lg mx-auto w-fit px-4">
          ✨ 사랑스러운 데이트를 위해 위치를 모두 입력해주세요!
        </p>
      )}
    </div>
  );
};

export default InputForm;