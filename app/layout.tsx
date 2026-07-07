import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "홈쇼퍼 | 서류 선검증 프리토타입",
  description: "계약 전 서류부터 30초 만에 확인하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
