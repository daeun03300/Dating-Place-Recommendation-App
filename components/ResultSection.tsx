import React, { useState } from 'react';
import { DateCourseResult, Place, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { MapPin, ExternalLink, Navigation, CheckCircle } from 'lucide-react';

interface ResultSectionProps {
  result: DateCourseResult;
}

const PlaceCard: React.FC<{ place: Place; index: number }> = ({ place, index }) => (
  <div className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent group-hover:bg-rose-400 transition-colors"></div>
    
    {place.googleMapLink && (
      <div className="absolute top-4 right-4 z-10">
         <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle className="w-3 h-3" />
            <span>지도 인증</span>
         </div>
      </div>
    )}
    
    <div className="flex justify-between items-start mb-2 pl-3 pr-20">
      <h3 className="font-bold text-lg text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-1">
        {place.name}
      </h3>
    </div>
    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block ml-3 mb-3 w-fit">#{index + 1}</span>

    <p className="text-sm text-gray-600 mb-4 pl-3 line-clamp-2 flex-grow">
      {place.description}
    </p>

    <div className="mt-auto pl-3 border-t border-gray-50 pt-3">
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <span className="text-xs text-gray-500 break-keep">{place.address}</span>
      </div>

      {place.googleMapLink ? (
        <a 
          href={place.googleMapLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:border-rose-200"
        >
          <Navigation className="w-4 h-4" />
          구글 지도로 보기
        </a>
      ) : (
        <a 
           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address + ' ' + place.name)}`}
           target="_blank"
           rel="noopener noreferrer"
           className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:border-rose-200"
        >
           <Navigation className="w-4 h-4" />
           지도 검색
        </a>
      )}
    </div>
  </div>
);

const ResultSection: React.FC<ResultSectionProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<CategoryType>('RESTAURANT');

  const activeCategory = CATEGORIES.find(c => c.id === activeTab);
  const places = activeCategory 
    ? (result[activeCategory.id.toLowerCase() as keyof DateCourseResult] as Place[]) 
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 animate-fade-in-up">
      {/* Mobile/Tablet Tab Navigation */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          const count = (result[cat.id.toLowerCase() as keyof DateCourseResult] as Place[]).length;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-300
                ${isActive 
                  ? 'bg-gray-900 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-rose-300' : cat.color}`} />
              <span className="font-semibold text-sm">{cat.label}</span>
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/60 shadow-sm min-h-[400px]">
        <div className="flex items-center gap-3 mb-8">
            <div className={`p-3 rounded-xl bg-white shadow-md ${activeCategory?.color}`}>
                {activeCategory && <activeCategory.icon className="w-6 h-6" />}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-gray-900">{activeCategory?.label} 추천</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Google Maps 데이터를 기반으로 검증된 장소입니다.
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
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MapPin className="w-16 h-16 mb-4 opacity-20" />
                <p>이 카테고리에는 추천 장소가 없습니다.</p>
                <p className="text-xs mt-2 text-gray-300">(실존하는 장소를 찾지 못했을 수 있습니다)</p>
            </div>
        )}
      </div>

      <div className="text-center mt-12 mb-20 text-xs text-gray-400">
        <p>Google Maps 데이터를 기반으로 Gemini AI가 생성한 결과입니다.</p>
        <p>실제 운영 정보와 다를 수 있으니 방문 전 확인해주세요.</p>
      </div>
    </div>
  );
};

export default ResultSection;