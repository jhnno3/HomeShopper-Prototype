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
}
