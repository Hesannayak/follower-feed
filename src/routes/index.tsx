import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Rocket, Send, Wallet, Bot, Sparkles, ExternalLink, Copy, Zap, Shield, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PumpPilot — Launch meme coins with AI" },
      { name: "description", content: "Chat with an AI bot to launch your meme coin on pump.fun in seconds." },
      { property: "og:title", content: "PumpPilot — Launch meme coins with AI" },
      { property: "og:description", content: "Chat with an AI bot to launch your meme coin on pump.fun in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Launch = { name: string; symbol: string; mint: string; progress: number; mcap: string; emoji: string; graduated?: boolean };
const SAMPLE: Launch[] = [];

const MINTS = [
  "AR895BAyuecNzyaoKLEftBNGhSMxgXnWCe375y74pump",
  "E9Ffrfzdcm4mTRBscHehk7pvja6naH1gbYXT1gffpump",
  "GiGzoMvKjabZXCoB5booniT49vTFQffiQ4Q86LpRpump",
  "mmhTKrNXPZeeyxcAf8RcvAHozf8fRPx98pRjRYApump",
];
type TokenInfo = { mint: string; name: string; symbol: string; image?: string; mcap: string; vol: string; price: string; change: number; graduated: boolean };
const fmt = (n?: number) => (n == null ? "—" : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`);

type Msg = { role: "bot" | "user"; text: string };

function Index() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [model, setModel] = useState<"self" | "platform">("self");
  const [launches, setLaunches] = useState<Launch[]>(SAMPLE);
  const [form, setForm] = useState({ name: "", symbol: "", description: "", image: "", twitter: "", telegram: "", devBuy: "0.1" });
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "gm 👋 Tell me about your coin — e.g. “launch a coin called Moon Hamster, ticker HAMMY, about a hamster going to the moon”." },
  ]);
  const [input, setInput] = useState("");
  const [launching, setLaunching] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  useEffect(() => {
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINTS.join(",")}`)
      .then((r) => r.json())
      .then((d: { pairs?: any[] }) => {
        const out: TokenInfo[] = MINTS.map((mint) => {
          const p = (d.pairs ?? []).filter((x) => x.baseToken?.address === mint).sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
          return {
            mint,
            name: p?.baseToken?.name ?? "Unknown",
            symbol: p?.baseToken?.symbol ?? "???",
            image: p?.info?.imageUrl,
            mcap: fmt(p?.marketCap ?? p?.fdv),
            vol: fmt(p?.volume?.h24),
            price: p?.priceUsd ? `$${Number(p.priceUsd).toPrecision(3)}` : "—",
            change: p?.priceChange?.h24 ?? 0,
            graduated: p ? p.dexId !== "pumpfun" : false,
          };
        });
        setTokens(out);
      })
      .catch(() => setTokens(MINTS.map((mint) => ({ mint, name: "Unavailable", symbol: "???", mcap: "—", vol: "—", price: "—", change: 0, graduated: false }))));
  }, []);

  const sendChat = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    const name = text.match(/called ([\w\s]+?)(,|\.| ticker|$)/i)?.[1]?.trim();
    const symbol = text.match(/ticker \$?(\w+)/i)?.[1]?.toUpperCase();
    setTimeout(() => {
      if (name || symbol) {
        setForm((f) => ({
          ...f,
          name: name ?? f.name,
          symbol: symbol ?? (name ? name.replace(/\s/g, "").slice(0, 5).toUpperCase() : f.symbol),
          description: f.description || text,
        }));
        setMsgs((m) => [...m, { role: "bot", text: `Got it! I filled in ${name ?? ""} ${symbol ? "($" + symbol + ")" : ""}. Review the details on the right and hit Launch 🚀` }]);
      } else {
        setMsgs((m) => [...m, { role: "bot", text: "What should the coin be called, and what's the ticker?" }]);
      }
    }, 600);
  };

  const launch = () => {
    if (!form.name || !form.symbol) return;
    if (model === "self" && !wallet) return;
    setLaunching(true);
    setTimeout(() => {
      const mint = Math.random().toString(36).slice(2, 6) + "..." + Math.random().toString(36).slice(2, 6);
      setLaunches((l) => [{ name: form.name, symbol: form.symbol, mint, progress: 1, mcap: "$4.2K", emoji: "🚀" }, ...l]);
      setMsgs((m) => [...m, { role: "bot", text: `✅ $${form.symbol} is live on pump.fun! Mint: ${mint}` }]);
      setForm({ name: "", symbol: "", description: "", image: "", twitter: "", telegram: "", devBuy: "0.1" });
      setLaunching(false);
    }, 1500);
  };

  const canLaunch = form.name && form.symbol && (model === "platform" || wallet);
  const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring font-mono";

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-xl font-bold">
            <Rocket className="h-6 w-6 text-primary" /> Pump<span className="text-primary">Pilot</span>
          </div>
          <button
            onClick={() => setWallet(wallet ? null : "8fJk...3Xa9")}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Wallet className="h-4 w-4" /> {wallet ? <span className="font-mono">{wallet}</span> : "Connect wallet"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">AI-powered · pump.fun · Solana</p>
        <h1 className="mt-3 text-5xl font-bold leading-tight md:text-6xl">
          Grokbot <span className="text-primary">launchpad</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Say it, grokbot will launch for you. Our Grok bot writes the metadata, uploads it to IPFS and launches on the bonding curve — graduating to PumpSwap when it fills.
        </p>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 pb-12 lg:grid-cols-2">
        {/* Chat */}
        <div className="relative flex h-[600px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3 font-semibold">
            <Bot className="h-5 w-5 text-primary" /> Launch bot
            <span className="ml-auto flex items-center gap-1 font-mono text-xs text-primary"><span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> online</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="launch a coin called…" className={field} />
            <button onClick={sendChat} className="rounded-md bg-primary px-3 text-primary-foreground" aria-label="Send"><Send className="h-4 w-4" /></button>
          </div>
          <div className="absolute inset-0 top-[49px] flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center backdrop-blur-sm">
            <Lock className="h-10 w-10 text-primary" />
            <p className="text-xl font-bold">Hold 1M $Groxbot Token to launch token</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold"><Sparkles className="h-5 w-5 text-accent" /> Token details</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">Name<input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="text-xs text-muted-foreground">Ticker<input className={field} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} /></label>
            <label className="col-span-2 text-xs text-muted-foreground">Description<textarea rows={3} className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="col-span-2 text-xs text-muted-foreground">Image URL<input className={field} placeholder="https://…" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
            <label className="text-xs text-muted-foreground">X / Twitter<input className={field} value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} /></label>
            <label className="text-xs text-muted-foreground">Telegram<input className={field} value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} /></label>
            <label className="col-span-2 text-xs text-muted-foreground">Dev buy (SOL)<input type="number" step="0.01" className={field} value={form.devBuy} onChange={(e) => setForm({ ...form, devBuy: e.target.value })} /></label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {([["self", Shield, "Self-custodial", "Sign with your wallet"], ["platform", Zap, "Free launch", "We pay fees, share creator fees"]] as const).map(([k, Icon, t, d]) => (
              <button key={k} onClick={() => setModel(k)} className={`rounded-lg border p-3 text-left transition ${model === k ? "border-primary bg-primary/10" : "border-border"}`}>
                <Icon className="mb-1 h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </button>
            ))}
          </div>

          <button disabled={!canLaunch || launching} onClick={launch} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40">
            <Rocket className="h-5 w-5" /> {launching ? "Launching…" : model === "self" && !wallet ? "Connect wallet to launch" : "Launch on pump.fun"}
          </button>
          <p className="mt-2 text-center font-mono text-xs text-muted-foreground">≈ 0.02 SOL network + creation fee</p>
        </div>
      </main>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-4 text-2xl font-bold">Recent launches</h2>
        {tokens.length === 0 && <p className="font-mono text-sm text-muted-foreground">Loading on-chain data…</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tokens.map((t) => (
            <div key={t.mint} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-2xl">
                  {t.image ? <img src={t.image} alt={t.name} className="h-full w-full object-cover" /> : "🚀"}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{t.name}</div>
                  <div className="font-mono text-xs text-primary">${t.symbol}</div>
                </div>
                {t.graduated && <span className="ml-auto rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">PUMPSWAP</span>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-1 font-mono text-xs text-muted-foreground">
                <span>MC {t.mcap}</span><span className="text-right">Vol 24h {t.vol}</span>
                <span>Price {t.price}</span><span className={`text-right ${t.change >= 0 ? "text-primary" : "text-destructive"}`}>{t.change >= 0 ? "+" : ""}{t.change.toFixed(1)}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>{t.mint.slice(0, 4)}...{t.mint.slice(-4)}</span>
                <span className="flex items-center gap-2">
                  <Copy className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => navigator.clipboard?.writeText(t.mint)} />
                  <a href={`https://pump.fun/coin/${t.mint}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 hover:text-foreground" /></a>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
