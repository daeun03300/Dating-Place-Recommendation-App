export interface Place {
  name: string;
  address: string;
  description: string;
  category: CategoryType;
  googleMapLink?: string; // Derived from grounding chunks if available
}

export type CategoryType = 'RESTAURANT' | 'SIGHTSEEING' | 'ACTIVITY' | 'PHOTO';

export interface DateCourseResult {
  restaurant: Place[];
  sightseeing: Place[];
  activity: Place[];
  photo: Place[];
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
