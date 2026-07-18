// Kakao's speech-bubble symbol. The button design guide requires this
// exact silhouette (unmodified shape/ratio) — never recolor or swap it
// for another icon. https://developers.kakao.com/docs/ko/kakaologin/design-guide
export function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        fill="#000000"
        d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.9 5.43 4.75 6.85-.15.56-1.03 3.87-1.06 4.1 0 0-.02.18.1.25.11.07.24.02.24.02.32-.04 3.71-2.45 4.31-2.86.53.06 1.07.1 1.66.1 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
      />
    </svg>
  );
}
