import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  FileText,
  FolderLock,
  MapPin,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { categories } from "@/data/categories";

const featuredGuides = [
  { kicker: "Tak", title: "Dags att byta tak? Det här behöver du veta", meta: "12 min läsning", href: "/guider/byta-tak" },
  { kicker: "Badrum", title: "Vad kostar det att renovera ett badrum?", meta: "Kostnadsguide 2026", href: "/guider/renovera-badrum-kostnad" },
  { kicker: "Köpa hus", title: "Den kompletta checklistan för husvisningen", meta: "Spara som checklista", href: "/guider/checklista-husvisning" },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={16} /> Allt om ditt boende</div>
            <h1>Ett tryggare, smartare och enklare liv med din bostad.</h1>
            <p className="hero-lead">
              Oberoende guider, praktiska verktyg och en digital plats för allt
              som hör till ditt hem – från första visningen till nästa takbyte.
            </p>
            <form className="search-box" action="/sok">
              <Search aria-hidden="true" />
              <input name="q" aria-label="Sök på BoLiv" placeholder="Vad vill du ha hjälp med?" />
              <button type="submit">Sök</button>
            </form>
            <div className="popular-searches">
              <span>Populärt:</span>
              <Link href="/guider/byta-tak">Byta tak</Link>
              <Link href="/guider/valja-varmepump">Värmepump</Link>
              <Link href="/guider/renovera-badrum-kostnad">Badrum</Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="house-visual">
              <div className="sun" />
              <div className="house">
                <div className="roof" />
                <div className="wall">
                  <div className="window" />
                  <div className="door" />
                </div>
              </div>
              <div className="ground" />
            </div>
            <div className="hero-card-content">
              <span className="status-dot" /> Din bostad, samlad och under kontroll
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><Check /> Oberoende kunskap</div>
          <div><Check /> Anpassat för svenska hem</div>
          <div><Check /> Gratis konto</div>
          <div><Check /> Hjälp i rätt tid</div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div><span className="kicker">Utforska BoLiv</span><h2>Vad vill du göra?</h2></div>
          <Link href="/guider" className="arrow-link">Se alla områden <ArrowRight /></Link>
        </div>
        <div className="category-grid">
          {categories.map(({ title, description, href, icon: Icon }) => (
            <Link href={href} className="category-card" key={title}>
              <span className="icon-tile"><Icon /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
              <ArrowRight className="card-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mitt-boliv-section">
        <div className="container mitt-grid">
          <div>
            <span className="kicker kicker-light">Mitt BoLiv</span>
            <h2>Husets egen digitala pärm.</h2>
            <p>
              Samla dokument, planera renoveringar och få koll på vad som behöver
              göras – för en eller flera fastigheter.
            </p>
            <ul className="feature-list">
              <li><CalendarCheck /> Underhållsplan och årskalender</li>
              <li><FolderLock /> Kvitton, garantier och dokument</li>
              <li><Wrench /> Projekt, budget och historik</li>
              <li><FileText /> Allt sparat inför en framtida försäljning</li>
            </ul>
            <Link href="/skapa-konto" className="button button-light">Skapa Mitt BoLiv gratis <ArrowRight /></Link>
          </div>
          <div className="dashboard-preview">
            <div className="preview-top"><span /><span /><span /></div>
            <div className="preview-title"><small>God morgon</small><strong>Huset i Borås</strong></div>
            <div className="preview-stats">
              <div><CalendarCheck /><strong>3</strong><small>Kommande</small></div>
              <div><Wrench /><strong>1</strong><small>Projekt</small></div>
              <div><FolderLock /><strong>24</strong><small>Dokument</small></div>
            </div>
            <div className="preview-task">
              <span className="task-date">SEP<br /><b>15</b></span>
              <span><strong>Kontrollera tak och hängrännor</strong><small>Årligt underhåll</small></span>
            </div>
            <div className="preview-task">
              <span className="task-date green">OK</span>
              <span><strong>Service bergvärmepump</strong><small>Klart 12 augusti</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div><span className="kicker">Utvalt just nu</span><h2>Guider som hjälper dig vidare</h2></div>
          <Link href="/guider" className="arrow-link">Alla guider <ArrowRight /></Link>
        </div>
        <div className="guide-grid">
          {featuredGuides.map((guide, index) => (
            <article className="guide-card" key={guide.title}>
              <Link href={guide.href} aria-label={guide.title}>
                <div className={`guide-image guide-image-${index + 1}`}><span>{guide.kicker}</span></div>
                <div className="guide-body">
                  <small>{guide.meta}</small>
                  <h3>{guide.title}</h3>
                  <span className="read-link">Läs guiden <ArrowRight /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="local-help">
        <div className="container local-help-inner">
          <div className="local-icon"><MapPin /></div>
          <div><span className="kicker">Rätt hjälp nära dig</span><h2>Hitta kvalitetssäkrade företag i din kommun.</h2><p>BoLiv visar en utvald partner per tjänst och kommun – enkelt och tydligt.</p></div>
          <Link href="/hitta-foretag" className="button">Hitta företag <ArrowRight /></Link>
        </div>
      </section>
    </main>
  );
}
