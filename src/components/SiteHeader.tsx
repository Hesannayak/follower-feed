import { Link } from "@tanstack/react-router";
import { Rocket, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  on?: (ev: string, cb: (...a: unknown[]) => void) => void;
};

function getProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { phantom?: { solana?: PhantomProvider }; solana?: PhantomProvider };
  const p = w.phantom?.solana ?? w.solana;
  return p?.isPhantom ? p : null;
}

export function usePhantom() {
  const [wallet, setWallet] = useState<string | null>(null);
  useEffect(() => {
    const p = getProvider();
    if (!p) return;
    p.connect({ onlyIfTrusted: true }).then((r) => setWallet(r.publicKey.toString())).catch(() => {});
    p.on?.("disconnect", () => setWallet(null));
    p.on?.("accountChanged", (pk) => setWallet(pk ? String(pk) : null));
  }, []);
  const connect = async () => {
    const p = getProvider();
    if (!p) {
      window.open("https://phantom.app/", "_blank");
      return;
    }
    try {
      const r = await p.connect();
      setWallet(r.publicKey.toString());
    } catch {}
  };
  const disconnect = async () => {
    await getProvider()?.disconnect();
    setWallet(null);
  };
  return { wallet, connect, disconnect };
}

const short = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;

export function SiteHeader({ launches, phantom }: { launches: number; phantom: ReturnType<typeof usePhantom> }) {
  const { wallet, connect, disconnect } = phantom;
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Rocket className="h-6 w-6 text-primary" /> grox<span className="text-primary">fun</span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Launch</Link>
            <Link to="/flywheel" activeProps={{ className: "text-foreground" }}>Flywheel</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md border border-border px-3 py-2 font-mono text-sm">
            Launches: <span className="text-primary">{launches}</span>
          </span>
          <button
            onClick={wallet ? disconnect : connect}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Wallet className="h-4 w-4" /> {wallet ? <span className="font-mono">{short(wallet)}</span> : "Connect Phantom"}
          </button>
        </div>
      </div>
    </header>
  );
}
