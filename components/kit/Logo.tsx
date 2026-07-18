export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      <path
        d="M12.5 13.5v-1.8a3.5 3.5 0 0 1 7 0v1.8"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="8.5" y="13.5" width="15" height="13" rx="3.2" fill="#F5F8FF" />
      <path d="M11.8 19.2 16 15.4l4.2 3.8Z" fill="#2F6FED" />
      <rect x="13" y="19" width="6" height="5.6" rx="0.8" fill="#2F6FED" />
      <rect x="15.1" y="21" width="1.8" height="3.6" rx="0.5" fill="#F5F8FF" />
      <defs>
        <linearGradient id="logo-grad" x1="3" y1="1" x2="29" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F8CFF" />
          <stop offset="0.55" stopColor="#2F6FED" />
          <stop offset="1" stopColor="#4536D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
