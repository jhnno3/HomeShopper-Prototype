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
  /** Most specific segment of Kakao's category path, shown as a small
   * right-aligned label on the row (e.g. 병원,의원 / 안과). Empty when the
   * result carries no category, which is common for plain address hits. */
  category: string;
};

const MAX_RESULTS = 4;

let placesService: kakao.maps.services.Places | null = null;

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  await loadKakaoMaps();
  if (!placesService) placesService = new window.kakao.maps.services.Places();

  return new Promise((resolve, reject) => {
    placesService!.keywordSearch(query, (dataOrStatus, maybeStatus) => {
      // Normalize by shape, not position: on success/zero-result Kakao
      // passes (data, status), but on a rejected request it passes the
      // status string alone in the first slot. Reading position 1 blindly
      // would see `undefined` there and treat a hard failure as an
      // ordinary empty result, so the dropdown would just never open with
      // nothing logged to explain why.
      const data = Array.isArray(dataOrStatus) ? dataOrStatus : [];
      const status = Array.isArray(dataOrStatus) ? maybeStatus : dataOrStatus;

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
          // Last segment only: the full path ("여행 > 숙박 > 호텔 > 롯데호텔")
          // is far too long for a row label, and its leading segments are
          // the generic ones. The tail is the useful, specific part.
          category: (result.category_name || '').split('>').pop()?.trim() ?? '',
        }))
      );
    });
  });
}
