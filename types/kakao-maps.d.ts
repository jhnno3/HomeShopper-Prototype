// Minimal ambient types for the parts of the Kakao Maps JS SDK this app
// uses (Map, Marker, LatLng, click/dragend events). Kakao doesn't publish
// official TypeScript types, and the SDK is loaded at runtime via a plain
// <script> tag (see lib/kakaoMaps.ts), not an npm package.
export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao.maps {
    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      draggable?: boolean;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
      setMap(map: Map | null): void;
    }

    interface MouseEvent {
      latLng: LatLng;
    }

    namespace event {
      function addListener(
        target: Map,
        type: 'click',
        handler: (event: MouseEvent) => void
      ): void;
      function addListener(target: Marker, type: 'dragend', handler: () => void): void;
    }

    function load(callback: () => void): void;
  }

  // `libraries=services` (see lib/kakaoMaps.ts) — keyword search for the
  // hero search bar's address-suggestion dropdown.
  namespace kakao.maps.services {
    type Status = 'OK' | 'ZERO_RESULT' | 'ERROR';
    const Status: { OK: 'OK'; ZERO_RESULT: 'ZERO_RESULT'; ERROR: 'ERROR' };

    interface PlacesSearchResultItem {
      id: string;
      place_name: string;
      address_name: string;
      road_address_name: string;
    }

    class Places {
      // Kakao's own callback order is (status, data, pagination) — status
      // first, confirmed against the live SDK response, not (data, status)
      // as most paraphrased docs describe it.
      keywordSearch(
        keyword: string,
        callback: (status: Status, data: PlacesSearchResultItem[]) => void
      ): void;
    }
  }
}
