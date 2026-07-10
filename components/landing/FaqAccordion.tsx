"use client";

import * as React from "react";
import { BadgeCheck, ChevronDown, FileSearch, ShieldCheck, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

// Panel open/close motion, lifted from the faq-pro reference.
const PANEL_EASE = [0.16, 1, 0.3, 1] as const;
const EXPAND_SPRING = { type: "spring" as const, stiffness: 150, damping: 26, mass: 1.05 };
const COLLAPSE_SPRING = { type: "spring" as const, stiffness: 190, damping: 30, mass: 1.1 };

type FaqItem = {
  id: string;
  icon: LucideIcon;
  question: string;
  answer: string;
};

const ITEMS: FaqItem[] = [
  {
    id: "free",
    icon: BadgeCheck,
    question: "정말 무료인가요?",
    answer:
      "네. 링크 분석과 기본 리포트는 가입 없이 무료로 제공됩니다. 등기부 원문 첨부 등 심화 리포트만 유료로 준비하고 있습니다.",
  },
  {
    id: "docs",
    icon: FileSearch,
    question: "어떤 서류를 확인해 주나요?",
    answer:
      "등기부등본의 근저당·가압류·소유자 정보, 건축물대장의 위반건축물 여부, 국토부 실거래가를 함께 대조해 정리합니다.",
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    question: "입력한 링크나 주소는 저장되나요?",
    answer:
      "분석 목적 외에는 사용하지 않으며, 개인 식별 정보와 연결하지 않습니다. 분석이 끝나면 리포트 열람용으로만 보관됩니다.",
  },
];

function FaqRow({
  item,
  isOpen,
  onToggle,
  isFirst,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  isFirst: boolean;
}) {
  const panelId = `faq-${item.id}-panel`;
  const triggerId = `faq-${item.id}-trigger`;
  const Icon = item.icon;

  return (
    <div className={cn(!isFirst && "border-t border-(--blue-edge)")}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        id={triggerId}
        onClick={onToggle}
        type="button"
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left sm:px-6"
      >
        <span
          aria-hidden
          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-(--glass-edge) bg-(--glass-strong) text-(--royal)"
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="flex-1 pt-1.5 text-[15px] font-semibold tracking-[-0.01em] text-(--ink)">
          {item.question}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-2 size-4 shrink-0 text-(--faint) transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen && "rotate-180 text-(--royal)"
          )}
        />
      </button>

      <motion.div
        animate={{ height: isOpen ? "auto" : 0 }}
        aria-labelledby={triggerId}
        className="overflow-hidden"
        id={panelId}
        initial={false}
        role="region"
        transition={{ height: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING }}
      >
        <motion.p
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -6 }}
          aria-hidden={!isOpen}
          className="pb-5 pl-[70px] pr-6 text-[14px] leading-[1.65] text-(--muted)"
          initial={false}
          inert={isOpen ? undefined : true}
          transition={{
            opacity: { duration: isOpen ? 0.38 : 0.2, ease: PANEL_EASE, delay: isOpen ? 0.06 : 0 },
            y: isOpen ? EXPAND_SPRING : COLLAPSE_SPRING,
          }}
        >
          {item.answer}
        </motion.p>
      </motion.div>
    </div>
  );
}

export function FaqAccordion() {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[20px] g-panel">
      {ITEMS.map((item, index) => (
        <FaqRow
          key={item.id}
          item={item}
          isFirst={index === 0}
          isOpen={openId === item.id}
          onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}

export default FaqAccordion;
