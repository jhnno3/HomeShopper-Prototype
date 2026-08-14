// Loads the Kakao Maps JS SDK once and caches the promise, so multiple
// mounts (e.g. React StrictMode's double-invoke) don't inject the script
// twice. `autoload=false` + `kakao.maps.load` defers running the SDK until
// we're ready for it, per Kakao's own guidance for SPA usage.
let loadPromise: Promise<void> | null = null;

export function loadKakaoMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.kakao?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!appKey) return Promise.reject(new Error('NEXT_PUBLIC_KAKAO_JS_KEY is not set'));

  loadPromise = new Promise((resolve, reject) => {
    const onLoaded = () => window.kakao.maps.load(() => resolve());
    const existing = document.getElementById('kakao-maps-sdk') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', onLoaded);
      existing.addEventListener('error', () => reject(new Error('카카오맵을 불러오지 못했어요.')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-maps-sdk';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = onLoaded;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('카카오맵을 불러오지 못했어요.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
