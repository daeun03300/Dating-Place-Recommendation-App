import { GoogleGenAI } from "@google/genai";
import { DateCourseResult, Place, CategoryType } from "../types";

// Helper to extract Google Maps link AND official title with robust matching
const findGroundingInfo = (placeName: string, chunks: any[]): { title: string; uri: string } | undefined => {
  if (!chunks || chunks.length === 0) return undefined;
  
  // Normalize: remove special chars, spaces, lowercase
  const normalize = (s: string) => s.replace(/[\s\-_.]+/g, '').toLowerCase();
  const cleanTarget = normalize(placeName);
  
  // Tokenize for softer matching (e.g., "Starbucks" matches "Starbucks Yeoksam")
  const targetTokens = placeName.toLowerCase().split(/[\s,]+/).filter(t => t.length > 1);

  const chunk = chunks.find((c: any) => {
    // Prefer maps title, fallback to web title
    let title = c.maps?.title || c.web?.title;
    if (!title) return false;
    
    // Clean up " - Google Maps" suffix if present in web titles
    title = title.replace(/\s*-\s*Google\s*Maps$/, '');

    const cleanTitle = normalize(title);
    
    // 1. Direct inclusion match (High confidence)
    if (cleanTitle.includes(cleanTarget) || cleanTarget.includes(cleanTitle)) {
        return true;
    }

    // 2. Token overlap match (Medium confidence)
    // If at least one significant token from the target exists in the title, and titles are somewhat similar length
    if (targetTokens.length > 0) {
        const matches = targetTokens.filter(token => cleanTitle.includes(token));
        // If > 50% of the target words are in the title, assume match
        if (matches.length >= Math.ceil(targetTokens.length * 0.5)) {
            return true;
        }
    }
    
    return false;
  });

  if (!chunk) return undefined;

  let finalTitle = chunk.maps?.title || chunk.web?.title || placeName;
  finalTitle = finalTitle.replace(/\s*-\s*Google\s*Maps$/, '');

  return {
    title: finalTitle,
    uri: chunk.maps?.uri || chunk.web?.uri
  };
};

export const fetchDateCourse = async (locationString: string): Promise<DateCourseResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
  당신은 Google Maps 데이터를 기반으로 한국의 데이트 코스를 추천하는 AI 큐레이터입니다.
  
  [절대 규칙 - 실존 장소 보장]
  1. 무조건 **Google Maps**에 실제로 등록된 장소만 추천하세요.
  2. 장소명은 Google 지도에 등록된 **정확한 상호명**을 사용하세요.
  3. **별점(평점)**은 반드시 Google Maps 검색 결과에 있는 **실제 수치**를 기입하세요. (데이터가 없으면 0.0)
  4. 답변 생성 시 반드시 Google Maps 도구를 사용하여 각 장소의 메타데이터를 확인하세요.

  [카테고리 엄수 및 중복 금지]
  1. **절대 중복 금지**: 한 장소를 여러 카테고리에 중복 추천하지 마세요.
  2. **카테고리 정확성**:
     - **맛집**: 식사 위주의 장소. 카페나 디저트 가게를 포함하지 마세요.
     - **카페**: 커피/디저트 위주. 식당을 포함하지 마세요.
     - **포토기기**: 반드시 '인생네컷', '포토이즘', '하루필름', '비룸스튜디오' 등 **무인 셀프 사진관 프랜차이즈**만 추천하세요. 일반 스튜디오나 사진관은 제외하세요.
  3. **빈 카테고리 금지**: 동네에 없으면 '구/군', 그래도 없으면 '시/도' 단위로 검색 범위를 넓혀서라도 반드시 추천 장소를 찾으세요.

  [응답 형식]
  각 카테고리는 "## 카테고리명"으로 시작하며, 장소 정보는 아래 형식을 엄수하세요:
  
  ## 맛집
  * 장소명: [정확한 상호명]
  * 주소: [도로명 주소]
  * 별점: [Google Maps 실제 별점]
  * 설명: [추천 이유]
  `;

  let prompt = `
  사용자 입력 위치: ${locationString}
  
  위 위치를 중심으로 데이트 코스를 추천해주세요.
  각 카테고리별로 가장 인기있고 평점이 좋은 장소를 찾아주세요.
  
  - 맛집 3곳
  - 카페 3곳
  - 볼거리 2곳
  - 놀거리 2곳
  - 쇼핑 2곳
  - 휴식 활동 2곳
  - 포토기기 2곳 (무인 사진방 필수)
  `;

  let lastError: any = null;
  const MAX_RETRIES = 2;

  // Retry loop
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching date course... Attempt ${attempt}`);
      
      // If retrying, expand the prompt to be more explicit about broader search to reduce "0 result" errors
      if (attempt > 1) {
        prompt += `\n[재검색 요청] 이전 검색 결과가 부족했습니다. 검색 반경을 넓혀서라도, 반드시 각 카테고리에 맞는 유명하고 확실한 장소를 찾아내세요.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleMaps: {} }],
          temperature: 0.6 + (attempt * 0.1), // Increase creativity slightly on retry
        },
      });

      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const result = parseResponseText(text, groundingChunks);
      
      // Count total verified places found
      const totalPlaces = Object.values(result).reduce((sum, list) => sum + list.length, 0);
      
      // Check if essential categories are populated
      const hasEssentials = result.restaurant.length > 0 && result.cafe.length > 0;

      if (totalPlaces > 0 && hasEssentials) {
        return result;
      }
      
      console.warn(`Attempt ${attempt} insufficient results (Total: ${totalPlaces}). Retrying...`);
      if (attempt === MAX_RETRIES && totalPlaces > 0) {
          // If last attempt has at least something, return it rather than failing completely
          return result;
      }
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
    }
  }

  throw new Error(lastError?.message || "장소를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.");
};

const parseResponseText = (text: string, groundingChunks: any[]): DateCourseResult => {
  const result: DateCourseResult = {
    restaurant: [],
    cafe: [],
    sightseeing: [],
    activity: [],
    shopping: [],
    relaxation: [],
    photo: [],
  };

  const lines = text.split('\n');
  let currentCategory: CategoryType | null = null;
  let currentPlace: Partial<Place> = {};
  
  const seenPlaces = new Set<string>();

  const categoryRegex = /##\s*.*(맛집|카페|볼거리|놀거리|쇼핑|휴식|포토).*?/;
  const nameRegex = /^[\*\-\d\.]+\s*장소명\s*[:：]\s*(.+)/;
  const addressRegex = /^[\*\-\s]*주소\s*[:：]\s*(.+)/;
  const ratingRegex = /^[\*\-\s]*별점\s*[:：]\s*(.+)/;
  const descRegex = /^[\*\-\s]*설명\s*[:：]\s*(.+)/;

  const pushCurrentPlace = () => {
    if (currentCategory && currentPlace.name && currentPlace.address) {
       let cleanName = currentPlace.name.replace(/\*\*/g, '').trim();
       const cleanAddr = currentPlace.address.trim();
       
       // Special filtering for PHOTO category
       // If category is PHOTO, ensure it sounds like a photo booth
       if (currentCategory === 'PHOTO') {
           const photoKeywords = ['네컷', '포토', '필름', '스튜디오', '사진', 'photo', 'studio', 'pic'];
           const isPhotoRelated = photoKeywords.some(k => cleanName.toLowerCase().includes(k));
           // Note: We don't strictly reject if keyword missing because names vary, 
           // but we rely on system instruction. However, we can filter out obvious mismatches if needed.
       }

       const uniqueKey = `${cleanName}-${cleanAddr}`.replace(/\s/g, '');

       if (seenPlaces.has(uniqueKey)) {
         currentPlace = {};
         return; 
       }

       const groundingInfo = findGroundingInfo(cleanName, groundingChunks);
       
       const place: Place = {
         name: groundingInfo ? groundingInfo.title : cleanName,
         address: cleanAddr,
         description: currentPlace.description || "설명 없음",
         category: currentCategory,
         rating: currentPlace.rating || undefined,
         googleMapLink: groundingInfo?.uri
       };

       // STRICT: Only Verified Real Places
       if (groundingInfo) {
         addToCategory(result, currentCategory, place);
         seenPlaces.add(uniqueKey);
       } 
       currentPlace = {};
    }
  };

  const addToCategory = (res: DateCourseResult, cat: CategoryType, place: Place) => {
     switch (cat) {
       case 'RESTAURANT': res.restaurant.push(place); break;
       case 'CAFE': res.cafe.push(place); break;
       case 'SIGHTSEEING': res.sightseeing.push(place); break;
       case 'ACTIVITY': res.activity.push(place); break;
       case 'SHOPPING': res.shopping.push(place); break;
       case 'RELAXATION': res.relaxation.push(place); break;
       case 'PHOTO': res.photo.push(place); break;
     }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const catMatch = trimmed.match(categoryRegex);
    if (catMatch) {
      pushCurrentPlace();
      const catText = catMatch[1];
      if (catText.includes('맛집')) currentCategory = 'RESTAURANT';
      else if (catText.includes('카페')) currentCategory = 'CAFE';
      else if (catText.includes('볼거리')) currentCategory = 'SIGHTSEEING';
      else if (catText.includes('놀거리')) currentCategory = 'ACTIVITY';
      else if (catText.includes('쇼핑')) currentCategory = 'SHOPPING';
      else if (catText.includes('휴식')) currentCategory = 'RELAXATION';
      else if (catText.includes('포토')) currentCategory = 'PHOTO';
      continue;
    }

    if (currentCategory) {
        const nameMatch = trimmed.match(nameRegex);
        if (nameMatch) {
            pushCurrentPlace();
            currentPlace.name = nameMatch[1];
            continue;
        }

        const addrMatch = trimmed.match(addressRegex);
        if (addrMatch) {
            currentPlace.address = addrMatch[1];
            continue;
        }

        const ratingMatch = trimmed.match(ratingRegex);
        if (ratingMatch) {
            const rawRating = ratingMatch[1].replace(/[^\d.]/g, '');
            currentPlace.rating = rawRating;
            continue;
        }

        const descMatch = trimmed.match(descRegex);
        if (descMatch) {
            currentPlace.description = descMatch[1];
            continue;
        }
    }
  }
  
  pushCurrentPlace();

  return result;
};