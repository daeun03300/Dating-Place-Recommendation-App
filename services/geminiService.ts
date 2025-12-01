import { GoogleGenAI } from "@google/genai";
import { DateCourseResult, Place, CategoryType } from "../types";

// Helper to extract Google Maps link with robust matching
const findLinkForPlace = (placeName: string, chunks: any[]): string | undefined => {
  if (!chunks || chunks.length === 0) return undefined;
  
  // Normalize: remove special chars, spaces, lowercase
  const normalize = (s: string) => s.replace(/[\s\-_.]+/g, '').toLowerCase();
  const cleanTarget = normalize(placeName);
  
  // Tokenize for softer matching (e.g., "Starbucks" matches "Starbucks Yeoksam")
  const targetTokens = placeName.toLowerCase().split(/[\s,]+/).filter(t => t.length > 1);

  const chunk = chunks.find((c: any) => {
    const title = c.maps?.title || c.web?.title;
    if (!title) return false;
    
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

  return chunk?.maps?.uri || chunk?.web?.uri;
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
  2. 장소명은 Google 지도에 등록된 **정확한 상호명**을 사용하세요 (약어 사용 금지).
  3. 주소는 반드시 도로명 주소를 포함하세요.
  4. **별점(평점)**은 반드시 Google Maps 검색 결과에 있는 **실제 수치**를 기입하세요. (임의 작성 금지)
  5. 별점 정보가 없다면 0.0으로 표기하세요.

  [빈 카테고리 금지 - 검색 범위 확장]
  사용자가 입력한 '동/읍/면'에 해당 카테고리의 장소가 없다면, 즉시 **'구/군'** 단위로, 그래도 없다면 **'시/도'** 단위로 범위를 넓혀서라도 **반드시 추천 장소를 찾아내세요.**
  "추천 장소가 없습니다"라는 응답은 허용되지 않습니다.

  [추천 카테고리]
  1. 맛집 (식당, 펍)
  2. 카페 (디저트, 뷰 맛집)
  3. 볼거리 (공원, 산책로, 랜드마크)
  4. 놀거리 (오락실, 공방, 전시)
  5. 쇼핑 (백화점, 아울렛, 소품샵, 편집샵)
  6. 휴식 활동 (찜질방, 만화카페, 스파)
  7. 포토기기 (인생네컷, 포토이즘 등 브랜드 필수)

  [응답 형식]
  각 카테고리는 "## 카테고리명"으로 시작하며, 장소 정보는 아래 형식을 엄수하세요:
  
  ## 맛집
  * 장소명: [정확한 상호명]
  * 주소: [도로명 주소]
  * 별점: [Google Maps 실제 별점]
  * 설명: [추천 이유]
  `;

  const prompt = `
  사용자 입력 위치: ${locationString}
  
  위 지역 근처에서 데이트하기 좋은 장소를 카테고리별로 추천해주세요.
  동네에 없으면 옆 동네나 구 전체를 뒤져서라도 꽉 채워주세요.
  각 장소의 별점은 Google Maps 데이터를 기반으로 정확하게 기재해주세요.
  
  - 맛집 3곳
  - 카페 3곳
  - 볼거리 2곳
  - 놀거리 2곳
  - 쇼핑 2곳
  - 휴식 활동 2곳
  - 포토기기 2곳
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleMaps: {} }],
        temperature: 0.7, // Slightly higher to allow finding places in wider areas
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return parseResponseText(text, groundingChunks);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("데이트 코스를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
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

  // Regex helpers - Robust parsing
  // Matches "## 맛집", "## 1. 맛집", "## 맛집 추천" etc.
  const categoryRegex = /##\s*.*(맛집|카페|볼거리|놀거리|쇼핑|휴식|포토).*?/;
  
  // Matches "* 장소명: ...", "- 장소명 : ...", "1. 장소명: ..."
  const nameRegex = /^[\*\-\d\.]+\s*장소명\s*[:：]\s*(.+)/;
  const addressRegex = /^[\*\-\s]*주소\s*[:：]\s*(.+)/;
  const ratingRegex = /^[\*\-\s]*별점\s*[:：]\s*(.+)/;
  const descRegex = /^[\*\-\s]*설명\s*[:：]\s*(.+)/;

  const pushCurrentPlace = () => {
    if (currentCategory && currentPlace.name && currentPlace.address) {
       const cleanName = currentPlace.name.replace(/\*\*/g, '').trim();
       const cleanAddr = currentPlace.address.trim();

       // Attempt to find a map link
       const mapLink = findLinkForPlace(cleanName, groundingChunks);
       
       const place: Place = {
         name: cleanName,
         address: cleanAddr,
         description: currentPlace.description || "설명 없음",
         category: currentCategory,
         rating: currentPlace.rating || undefined,
         googleMapLink: mapLink
       };

       // Verification Logic:
       // 1. If mapLink exists -> Always Verified.
       // 2. If mapLink missing -> Check if address looks real (Safety net for strict "No Empty" rule).
       if (mapLink) {
         addToCategory(result, currentCategory, place);
       } else {
         // Fallback: If address contains specific location markers, assume it's real but unverified link.
         if (cleanAddr.includes('길') || cleanAddr.includes('로') || cleanAddr.match(/\d/)) {
            addToCategory(result, currentCategory, place);
         }
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
            pushCurrentPlace(); // Push previous
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
            // Remove any non-numeric chars except dot, and text like "점", "/5" etc.
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
  
  pushCurrentPlace(); // Push last

  return result;
};