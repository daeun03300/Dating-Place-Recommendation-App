import { GoogleGenAI } from "@google/genai";
import { DateCourseResult, Place, CategoryType } from "../types";

// Helper to extract Google Maps link from grounding chunks with better matching
const findLinkForPlace = (placeName: string, chunks: any[]): string | undefined => {
  if (!chunks || chunks.length === 0) return undefined;
  
  // Normalize strings for comparison (remove spaces, lowercase)
  const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  const target = normalize(placeName);

  const chunk = chunks.find((c: any) => {
    // Check maps title first, then web title
    const title = c.maps?.title || c.web?.title;
    if (!title) return false;
    
    const sourceTitle = normalize(title);
    return sourceTitle.includes(target) || target.includes(sourceTitle);
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
  
  [매우 중요한 규칙 - 실존 장소 엄수]
  1. 반드시 **Google Maps 도구**를 사용하여 해당 지역에 **실제로 존재하는 장소**만 추천해야 합니다.
  2. 존재하지 않거나 위치가 불분명한 장소는 절대로 지어내지 마십시오 (Hallucination 금지).
  3. 장소명과 주소는 Google Maps 상의 정보와 정확히 일치해야 합니다.
  4. 만약 특정 카테고리에 적합한 장소가 없다면, 억지로 채우지 말고 검색된 장소만 반환하세요.

  [추천 카테고리]
  1. 맛집 (식당, 카페, 디저트, 분위기 좋은 술집)
  2. 볼거리 (공원, 산책로, 랜드마크, 전망대)
  3. 놀거리 (액티비티, 오락실, 방탈출, 공방, 만화카페)
  4. 포토기기 (인생네컷, 하루필름, 포토이즘, 포토그레이 등 셀프 스튜디오 - 실제 지점 위치)

  [응답 형식]
  각 카테고리는 "## 카테고리명"으로 시작하며, 장소 정보는 아래 형식을 지켜주세요:
  * 장소명: [Google Maps에 등록된 정확한 상호명]
  * 주소: [Google Maps에 등록된 정확한 도로명 주소]
  * 설명: [데이트에 추천하는 이유 한 줄 요약]
  `;

  const prompt = `
  사용자 입력 위치: ${locationString}
  
  위 지역 근처(반경 2km 이내)에서 데이트하기 좋은 실제 장소를 찾아주세요.
  다음 카테고리별로 Google 지도에서 검증된 장소만 추천해주세요:
  
  - 맛집 3곳
  - 볼거리 2곳
  - 놀거리 2곳
  - 포토기기 2곳 (인생네컷 등 브랜드 셀프 사진관 필수)
  
  각 장소의 상호명과 정확한 도로명 주소를 반드시 포함하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleMaps: {} }], // Use Maps Grounding
        temperature: 0.5, // Lower temperature for more factual responses
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
    sightseeing: [],
    activity: [],
    photo: [],
  };

  const lines = text.split('\n');
  let currentCategory: CategoryType | null = null;

  // Simple state machine to parse the formatted text
  let currentPlace: Partial<Place> = {};

  // Regex helpers - Updated to be more flexible with formatting
  const categoryRegex = /##\s*(맛집|볼거리|놀거리|포토기기|유명 포토기기)/;
  
  // Matches "* 장소명: Value" or "- 장소명: Value"
  const nameRegex = /[*-\s]*장소명[:\s]\s*(.+)/;
  const addressRegex = /[*-\s]*주소[:\s]\s*(.+)/;
  const descRegex = /[*-\s]*설명[:\s]\s*(.+)/;

  const pushCurrentPlace = () => {
    if (currentCategory && currentPlace.name && currentPlace.address) {
       const cleanName = currentPlace.name.replace(/\*\*/g, '').trim();
       const cleanAddr = currentPlace.address.trim();

       // Attempt to find a map link from grounding chunks
       const mapLink = findLinkForPlace(cleanName, groundingChunks);
       
       const place: Place = {
         name: cleanName,
         address: cleanAddr,
         description: currentPlace.description || "설명 없음",
         category: currentCategory,
         googleMapLink: mapLink
       };

       switch (currentCategory) {
         case 'RESTAURANT': result.restaurant.push(place); break;
         case 'SIGHTSEEING': result.sightseeing.push(place); break;
         case 'ACTIVITY': result.activity.push(place); break;
         case 'PHOTO': result.photo.push(place); break;
       }
       currentPlace = {};
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for Category Header
    const catMatch = trimmed.match(categoryRegex);
    if (catMatch) {
      pushCurrentPlace(); // Push previous if exists
      const catText = catMatch[1];
      if (catText.includes('맛집')) currentCategory = 'RESTAURANT';
      else if (catText.includes('볼거리')) currentCategory = 'SIGHTSEEING';
      else if (catText.includes('놀거리')) currentCategory = 'ACTIVITY';
      else if (catText.includes('포토')) currentCategory = 'PHOTO';
      continue;
    }

    // Check for Place Attributes
    if (currentCategory) {
        const nameMatch = trimmed.match(nameRegex);
        if (nameMatch && (line.includes('*') || line.includes('-'))) {
            pushCurrentPlace(); // Start new place
            currentPlace.name = nameMatch[1];
            continue;
        }

        const addrMatch = trimmed.match(addressRegex);
        if (addrMatch) {
            currentPlace.address = addrMatch[1];
            continue;
        }

        const descMatch = trimmed.match(descRegex);
        if (descMatch) {
            currentPlace.description = descMatch[1];
            continue;
        }
    }
  }
  
  // Push the last one
  pushCurrentPlace();

  return result;
};