import React, { useState } from 'react';
import { DateCourseResult, Place, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { MapPin, Navigation, CheckCircle, Heart, Star, ShoppingBag } from 'lucide-react';

interface ResultSectionProps {
  result: DateCourseResult;
}

const PlaceCard: React.FC<{ place: Place; index: number }> = ({ place, index }) => {
  const renderRating = (ratingStr?: string) => {
    const rating = parseFloat(ratingStr || '0');
    if (!rating || isNaN(rating) || rating === 0) return null;

    return (
      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md w-fit mb-2">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-sm font-bold text-amber-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const mapUrl = place.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address + ' ' + place.name)}`;

  return (
    <div className="group bg-white rounded-2xl border border-pink-50 p-6 hover:shadow-[0_10px_40px_-10px_rgba(255,182,193,0.5)] transition-all duration-300 flex flex-col h-full relative overflow-hidden hover:-translate-y-1">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      {place.googleMapLink && (
        <div className="absolute top-4 right-4 z-10">
           <div className="bg-white/90 backdrop-blur border border-rose-100 text-rose-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle className="w-3 h-3" />
              <span>지도 인증</span>
           </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-500 text-xs font-bold font-mono">
              {index + 1}
          </span>
      </div>

      <h3 className="font-jua text-xl text-gray-800 group-hover:text-rose-500 transition-colors mb-1 pr-16 leading-tight">
        {place.name}
      </h3>

      {renderRating(place.rating)}

      <p className="text-sm text-gray-600 mb-5 leading-relaxed flex-grow mt-2">
        {place.description}
      </p>

      <div className="mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-start gap-2 mb-4 bg-gray-50 p-2.5 rounded-lg">
          <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-gray-500 break-keep font-medium">{place.address}</span>
        </div>

        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300
            ${place.googleMapLink 
                ? 'bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white group-hover:shadow-md group-hover:shadow-rose-100' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
        >
          <Navigation className="w-4 h-4" />
          구글 지도로 보기
        </a>
      </div>
    </div>
  );
};

const ResultSection: React.FC<ResultSectionProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<CategoryType>('RESTAURANT');

  const activeCategory = CATEGORIES.find(c => c.id === activeTab);
  const places = activeCategory 
    ? (result[activeCategory.id.toLowerCase() as keyof DateCourseResult] as Place[]) 
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 animate-fade-in-up">
      {/* Mobile/Tablet Tab Navigation - Centered on desktop, scrollable on mobile */}
      <div className="flex overflow-x-auto pb-4 gap-3 mb-6 scrollbar-hide px-2 md:justify-center">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          const count = (result[cat.id.toLowerCase() as keyof DateCourseResult] as Place[]).length;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 border-2
                ${isActive 
                  ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200 scale-105' 
                  : 'bg-white border-white text-gray-400 hover:bg-rose-50 hover:text-rose-400 hover:border-rose-100'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
              <span className="font-jua text-lg pt-1">{cat.label}</span>
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white shadow-xl shadow-rose-100/50 min-h-[400px]">
        <div className="flex items-center gap-3 mb-8">
            <div className={`p-3 rounded-2xl bg-white shadow-sm border border-pink-50 ${activeCategory?.color}`}>
                {activeCategory && <activeCategory.icon className="w-7 h-7" />}
            </div>
            <div>
                <h3 className="text-3xl font-jua text-gray-800">{activeCategory?.label} 추천</h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  엄선된 로맨틱한 장소들입니다.
                </p>
            </div>
        </div>

        {places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place, idx) => (
              <PlaceCard key={`${place.name}-${idx}`} place={place} index={idx} />
            ))}
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                     <MapPin className="w-12 h-12 text-rose-200" />
                </div>
                <p className="font-jua text-xl text-gray-500">이런, 추천 장소가 없네요!</p>
                <p className="text-sm mt-2 text-rose-300">다른 카테고리를 확인해보세요.</p>
            </div>
        )}
      </div>

      <div className="text-center mt-12 mb-20 space-y-2">
        <p className="text-xs text-gray-400">
            Google Maps 데이터를 기반으로 Gemini AI가 큐레이팅한 데이트 코스입니다.
        </p>
        <p className="text-xs text-rose-300 font-medium">
            방문 전 실제 운영 여부를 꼭 확인해주세요! 💕
        </p>
      </div>
    </div>
  );
};

export default ResultSection;