import React from 'react';
import { LocationState } from '../types';
import { KOREA_CITIES } from '../constants';
import { MapPin, Search } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 transform transition-all hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-6 text-gray-800">
        <MapPin className="w-6 h-6 text-rose-500" />
        <h2 className="text-xl font-bold">어디서 데이트 하세요?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* City Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">시/도</label>
          <select
            name="city"
            value={location.city}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-gray-800"
            disabled={isLoading}
          >
            <option value="">선택하세요</option>
            {KOREA_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* District Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">시/군/구</label>
          <input
            type="text"
            name="district"
            value={location.district}
            onChange={handleChange}
            placeholder="예: 강남구"
            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-gray-800 placeholder-gray-400"
            disabled={isLoading}
          />
        </div>

        {/* Neighborhood Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">읍/면/동</label>
          <input
            type="text"
            name="neighborhood"
            value={location.neighborhood}
            onChange={handleChange}
            placeholder="예: 역삼동"
            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all outline-none text-gray-800 placeholder-gray-400"
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isFormValid || isLoading}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform active:scale-95
          ${isFormValid && !isLoading 
            ? 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-lg shadow-rose-200 hover:shadow-rose-300' 
            : 'bg-gray-300 cursor-not-allowed'}`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>코스 짜는 중...</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>데이트 코스 찾기</span>
          </>
        )}
      </button>
      
      {!isFormValid && (
        <p className="text-center text-xs text-gray-400 mt-3">
          * 정확한 추천을 위해 모든 지역 정보를 입력해주세요.
        </p>
      )}
    </div>
  );
};

export default InputForm;
