import { CategoryType } from "./types";
import { Utensils, Camera, Ticket, MapPin } from "lucide-react";

export const CATEGORIES: { id: CategoryType; label: string; icon: any; color: string }[] = [
  { id: 'RESTAURANT', label: '맛집', icon: Utensils, color: 'text-rose-500' },
  { id: 'SIGHTSEEING', label: '볼거리', icon: MapPin, color: 'text-emerald-500' },
  { id: 'ACTIVITY', label: '놀거리', icon: Ticket, color: 'text-violet-500' },
  { id: 'PHOTO', label: '포토기기', icon: Camera, color: 'text-blue-500' },
];

export const KOREA_CITIES = [
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", 
  "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
  "경기도", "강원특별자치도", "충청북도", "충청남도", 
  "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
];
