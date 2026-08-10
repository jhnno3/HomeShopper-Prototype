'use client';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Loader2, MapPin, X } from 'lucide-react';
import { AddressPanel } from '@/components/kit/AddressPanel';
import { ApiError } from '@/lib/api';
import { reverseGeocode } from '@/lib/api';
import { loadKakaoMaps } from '@/lib/kakaoMaps';

// 서울시청 — default center before the user has dropped a pin.
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

type KakaoStatus = 'loading' | 'ready' | 'error';
type GeocodeStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Map-pin address picker (FRONTEND_INTEGRATION_2026-08-07.md §2, §4). Drop
 * or drag a pin on an embedded Kakao map; on every pin move we call
 * reverse-geocode and let the user review/edit the resulting address
 * (plus 동/호수, since the API can't resolve those from coordinates alone)
 * before handing a final address string back to the search bar.
 */
export function MapPicker({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (address: string) => void;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markerRef = useRef<kakao.maps.Marker | null>(null);

  const [kakaoStatus, setKakaoStatus] = useState<KakaoStatus>('loading');
  const [hasPin, setHasPin] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<GeocodeStatus>('idle');
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [addressValue, setAddressValue] = useState('');
  const [addressOpen, setAddressOpen] = useState(false);
  const [dong, setDong] = useState('');
  const [ho, setHo] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadKakaoMaps()
      .then(() => {
        if (!cancelled) setKakaoStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setKakaoStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runReverseGeocode(latitude: number, longitude: number) {
    setGeocodeStatus('loading');
    setGeocodeError(null);
    try {
      const res = await reverseGeocode(latitude, longitude);
      setAddressValue(res.selectedAddress);
      setGeocodeStatus('success');
    } catch (err) {
      setGeocodeStatus('error');
      setGeocodeError(
        err instanceof ApiError ? err.message : '주소를 확인하지 못했어요. 잠시 후 다시 시도해주세요.'
      );
    }
  }

  function placePin(latLng: kakao.maps.LatLng) {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      const marker = new window.kakao.maps.Marker({ position: latLng, map, draggable: true });
      window.kakao.maps.event.addListener(marker, 'dragend', () => placePin(marker.getPosition()));
      markerRef.current = marker;
    } else {
      markerRef.current.setPosition(latLng);
    }
    setHasPin(true);
    void runReverseGeocode(latLng.getLat(), latLng.getLng());
  }

  useEffect(() => {
    if (kakaoStatus !== 'ready' || !mapDivRef.current || mapRef.current) return;
    const center = new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    const map = new window.kakao.maps.Map(mapDivRef.current, { center, level: 4 });
    mapRef.current = map;
    window.kakao.maps.event.addListener(map, 'click', (e) => placePin(e.latLng));
    // placePin is stable across the component's lifetime (only reads refs/state
    // setters), so omitting it from deps doesn't risk a stale closure here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakaoStatus]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const canConfirm = geocodeStatus === 'success' && addressValue.trim().length > 0;

  function handleConfirm() {
    if (!canConfirm) return;
    const finalAddress = [addressValue.trim(), dong.trim(), ho.trim()].filter(Boolean).join(' ');
    onConfirm(finalAddress);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="지도에서 위치 선택"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-divider)] px-5 py-3.5">
          <p className="text-[15px] font-bold text-[var(--color-ink)]">지도에서 위치 선택</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid size-8 cursor-pointer place-items-center rounded-full text-[var(--color-slate)] transition-colors duration-150 hover:bg-[#F7F8FB]"
          >
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>

        <div className="relative h-64 shrink-0 bg-[#F7F8FB]">
          <div ref={mapDivRef} className="h-full w-full" />

          {kakaoStatus === 'loading' && (
            <div className="absolute inset-0 grid place-items-center bg-[#F7F8FB]">
              <Loader2 aria-hidden className="size-6 animate-spin text-[var(--color-slate)]" />
            </div>
          )}

          {kakaoStatus === 'error' && (
            <div className="absolute inset-0 grid place-items-center bg-[#F7F8FB] px-6 text-center">
              <p className="text-[13.5px] font-semibold text-[var(--color-danger)]">
                카카오맵을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
              </p>
            </div>
          )}

          {kakaoStatus === 'ready' && !hasPin && (
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
              <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--color-slate)] shadow-md">
                <MapPin aria-hidden className="size-3.5 text-[var(--color-blue)]" />
                지도를 클릭해 위치를 선택하세요
              </span>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {geocodeStatus === 'idle' && (
            <p className="text-[13.5px] leading-relaxed text-[var(--color-slate)]">
              핀을 놓으면 해당 위치의 주소를 확인해요.
            </p>
          )}

          {geocodeStatus === 'loading' && (
            <div className="flex items-center gap-2 text-[13.5px] text-[var(--color-slate)]">
              <Loader2 aria-hidden className="size-4 animate-spin" />
              주소를 확인하고 있어요...
            </div>
          )}

          {geocodeStatus === 'error' && geocodeError && (
            <p role="alert" className="text-[13.5px] font-semibold text-[var(--color-danger)]">
              {geocodeError}
            </p>
          )}

          {geocodeStatus === 'success' && (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="map-picker-address"
                  className="text-[13px] font-semibold text-[var(--color-ink)]"
                >
                  주소
                </label>
                <input
                  id="map-picker-address"
                  value={addressValue}
                  onChange={(e) => setAddressValue(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E7E9F0] bg-white px-3.5 text-base text-[var(--color-ink)] outline-none transition-colors duration-150 focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[rgba(0,131,255,0.16)]"
                />
              </div>
              <AddressPanel
                idPrefix="map-picker"
                open={addressOpen}
                onToggle={() => setAddressOpen((prev) => !prev)}
                dong={dong}
                ho={ho}
                onDongChange={setDong}
                onHoChange={setHo}
                reduceMotion={reduceMotion}
              />
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-divider)] px-5 py-4">
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="h-11 w-full cursor-pointer rounded-xl bg-[var(--color-blue)] text-[13.5px] font-semibold text-white transition-colors duration-150 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            이 주소 사용
          </button>
        </div>
      </div>
    </div>
  );
}
