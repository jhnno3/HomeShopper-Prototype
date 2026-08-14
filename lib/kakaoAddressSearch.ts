// Keyword-based address/place lookup for the hero search bar's suggestion
// dropdown — runs entirely client-side against the Kakao Maps JS SDK
// (`libraries=services`, loaded via loadKakaoMaps) rather than a REST call,
// so the domain-restricted NEXT_PUBLIC_KAKAO_JS_KEY never needs a server
// proxy. Keyword search (not Geocoder.addressSearch) because it matches
// partial input and building/apartment names, not just complete jibun/도로명
// strings — the domain here is 매물 addresses, which people as often type as
// a building name as a formal address.
import { loadKakaoMaps } from './kakaoMaps';

export type AddressSuggestion = {
  id: string;
  placeName: string;
  addressName: string;
};

const MAX_RESULTS = 5;

let placesService: kakao.maps.services.Places | null = null;

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  await loadKakaoMaps();
  if (!placesService) placesService = new window.kakao.maps.services.Places();

  return new Promise((resolve, reject) => {
    placesService!.keywordSearch(query, (status, data) => {
      if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        resolve([]);
        return;
      }
      if (status !== window.kakao.maps.services.Status.OK) {
        reject(new Error('주소를 검색하지 못했어요.'));
        return;
      }
      resolve(
        data.slice(0, MAX_RESULTS).map((result) => ({
          id: result.id,
          placeName: result.place_name,
          // 도로명주소가 있으면 우선 — 지번보다 매물 분석 요청에 더 적합한 형식.
          addressName: result.road_address_name || result.address_name,
        }))
      );
    });
  });
}
