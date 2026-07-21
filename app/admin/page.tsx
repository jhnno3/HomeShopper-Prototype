import Link from 'next/link';
import { FileText, CalendarClock } from 'lucide-react';
import { GlassCard } from '@/components/kit/GlassCard';

// View-only operator hub. Links to the two readable admin datasets
// (PROTOTYPE_API.md §8). No write/publish actions here — the admin only views.
const LINKS = [
  {
    href: '/admin/premium-requests',
    icon: FileText,
    title: '정밀 리포트 요청',
    desc: '접수된 정밀 리포트 신청 목록과 상태',
  },
  {
    href: '/admin/reservations',
    icon: CalendarClock,
    title: '예약 · 방문 로그',
    desc: '사전예약(동행 임장) 신청 내역과 상태',
  },
];

export default function AdminHubPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      <header>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">관리자</h1>
        <p className="mt-1 text-sm text-[var(--color-slate)]">조회 전용 대시보드</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className="block">
            <GlassCard className="h-full p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(0,131,255,0.1)] text-[var(--color-blue)]">
                <Icon size={20} aria-hidden />
              </div>
              <h2 className="mt-3 font-semibold text-[var(--color-ink)]">{title}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-slate)]">{desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </main>
  );
}
