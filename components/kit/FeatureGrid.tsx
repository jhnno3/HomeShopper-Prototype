import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type Props = {
  features: Feature[];
};

export function FeatureGrid({ features }: Props) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <GlassCard key={title} className="flex flex-col gap-3">
            <span className="bg-grad flex h-10 w-10 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
            </span>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              {title}
            </h3>
            <p className="text-sm text-[var(--color-slate)]">{description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
