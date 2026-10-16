import { createFileRoute } from "@tanstack/react-router";
import { Flame, Percent, RefreshCw, Coins } from "lucide-react";
import { SiteHeader, usePhantom } from "@/components/SiteHeader";

export const Route = createFileRoute("/flywheel")({
  head: () => ({
    meta: [
      { title: "Flywheel — groxfun" },
      { name: "description", content: "How groxfun fees buy back and burn $Groxfun on every trade." },
      { property: "og:title", content: "Flywheel — groxfun" },
      { property: "og:description", content: "How groxfun fees buy back and burn $Groxfun on every trade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Flywheel,
});

const STEPS = [
  { Icon: Percent, title: "0.5% fee", text: "A 0.5% fee is charged on each buy / sell." },
  { Icon: RefreshCw, title: "50% platform fee → buyback", text: "50% platform fee will be used to buyback Groxfun token." },
  { Icon: Flame, title: "Burned", text: "And it will be burned." },
  { Icon: Coins, title: "50% creator fee → buyback & burn", text: "50% creator fee of $Groxfun will be used to buyback Groxfun token and burned." },
];

function Flywheel() {
  const phantom = usePhantom();
  return (
    <div className="min-h-screen">
      <SiteHeader launches={4} phantom={phantom} />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Tokenomics</p>
        <h1 className="mt-3 text-5xl font-bold">The <span className="text-primary">flywheel</span></h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Every trade fuels $Groxfun buybacks. Every buyback is burned.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map(({ Icon, title, text }, i) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
