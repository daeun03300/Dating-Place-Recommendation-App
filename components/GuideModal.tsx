import React from 'react';
import { X, MapPin, Search, Navigation, Heart } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl transform transition-all animate-bounce-in border-4 border-pink-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-jua text-gray-800 mb-6 text-center">
          <span className="text-rose-500">오늘의 데이트</span> 사용법 💡
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-rose-100 p-3 rounded-full text-rose-500 flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-jua text-lg text-gray-700">1. 지역 선택하기</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                데이트를 하고 싶은 시/도, 시/군/구, 읍/면/동을 순서대로 선택해주세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-full text-amber-500 flex-shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-jua text-lg text-gray-700">2. 장소 추천받기</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                '추천받기' 버튼을 누르면 AI가 엄선한 맛집, 카페, 놀거리를 찾아드려요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-500 flex-shrink-0">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-jua text-lg text-gray-700">3. 지도 확인하기</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                '구글 지도로 보기'를 눌러 정확한 위치와 실제 별점을 확인해보세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-violet-100 p-3 rounded-full text-violet-500 flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-jua text-lg text-gray-700">4. 후기 남기기</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                마음에 드는 장소를 발견했다면 익명으로 짧은 후기를 남겨 화면을 꾸며보세요!
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-rose-500 text-white font-jua text-lg py-3 rounded-xl hover:bg-rose-600 transition-colors shadow-md shadow-rose-200"
        >
          확인했어요! 💕
        </button>
      </div>
    </div>
  );
};

export default GuideModal;