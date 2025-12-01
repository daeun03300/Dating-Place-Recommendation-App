export interface Place {
  name: string;
  address: string;
  description: string;
  category: CategoryType;
  googleMapLink?: string; // Derived from grounding chunks if available
  rating?: string; // Google Maps rating (e.g., "4.5")
}

export type CategoryType = 'RESTAURANT' | 'SIGHTSEEING' | 'ACTIVITY' | 'PHOTO' | 'RELAXATION' | 'CAFE' | 'SHOPPING';

export interface DateCourseResult {
  restaurant: Place[];
  sightseeing: Place[];
  activity: Place[];
  photo: Place[];
  relaxation: Place[];
  cafe: Place[];
  shopping: Place[];
}

export interface LocationState {
  city: string; // 시/도 (e.g., 서울특별시)
  district: string; // 시/군/구 (e.g., 강남구)
  neighborhood: string; // 읍/면/동 (e.g., 역삼동)
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  result: DateCourseResult | null;
  rawText?: string;
}

export interface Review {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
}