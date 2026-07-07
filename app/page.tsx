import { Nav } from "@/components/kit/Nav";
import { Hero } from "@/components/kit/Hero";
import { Footer } from "@/components/kit/Footer";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SampleReportPreview } from "@/components/landing/SampleReportPreview";
import { TrustSection } from "@/components/landing/TrustSection";
import { ReserveBanner } from "@/components/landing/ReserveBanner";

export default function LandingPage() {
  return (
    <>
      <Nav ctaLabel="무료 분석 시작" ctaHref="/analyze" />
      <main>
        <Hero
          headline="그 매물, 임장 가기 전에 30초 만에 서류부터 확인하세요"
          subcopy="가입 없이 무료"
          ctaLabel="무료로 서류 확인하기"
          ctaHref="/analyze"
        />
        <HowItWorks />
        <SampleReportPreview />
        <TrustSection />
        <ReserveBanner />
      </main>
      <Footer />
    </>
  );
}
