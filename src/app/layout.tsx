import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://boliv.se"),
  title: {
    default: "BoLiv – allt om ditt boende",
    template: "%s | BoLiv",
  },
  description:
    "Guider, verktyg och smart ordning för dig som bygger, renoverar, äger, köper eller säljer bostad.",
  openGraph: {
    title: "BoLiv – allt om ditt boende",
    description:
      "Kunskap, planering och rätt hjälp för hela livet med din bostad.",
    type: "website",
    locale: "sv_SE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand" aria-label="BoLiv startsida">
              Bo<span>Liv</span>
            </Link>
            <nav className="desktop-nav" aria-label="Huvudnavigation">
              <Link href="/bygga">Bygga</Link>
              <Link href="/renovera">Renovera</Link>
              <Link href="/underhalla">Underhålla</Link>
              <Link href="/kopa-bostad">Köpa & sälja</Link>
              <Link href="/ekonomi">Ekonomi</Link>
            </nav>
            <div className="header-actions">
              <Link href="/sok" className="text-link">Sök</Link>
              <Link href="/mitt-boliv" className="button button-small">Mitt BoLiv</Link>
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <div className="brand brand-light">Bo<span>Liv</span></div>
              <p>Allt om ditt boende – samlat på ett ställe.</p>
            </div>
            <div>
              <strong>Upptäck</strong>
              <Link href="/guider">Alla guider</Link>
              <Link href="/hitta-foretag">Hitta företag</Link>
              <Link href="/mitt-boliv">Mitt BoLiv</Link>
            </div>
            <div>
              <strong>BoLiv</strong>
              <Link href="/om-boliv">Om oss</Link>
              <Link href="/partner">För företag</Link>
              <Link href="/kontakt">Kontakt</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
