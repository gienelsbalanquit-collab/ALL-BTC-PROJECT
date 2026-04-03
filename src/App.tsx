import { useState, useEffect, useRef, useCallback } from "react";
import { ExternalLink, ChevronDown, Globe, Tv, Smartphone, Newspaper, Download, Play } from "lucide-react";
import {
  BTC_LOGO, VIMEO_ID, ORIGINAL_PDF_CDN, PDF_PAGES, SECTIONS, LINKS, KINGS_CUP
} from "./data";

// ─── useCountUp ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) { setCount(0); return; }
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(parseFloat((progress * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ value, label, unit, animate }: { value: string; label: string; unit?: string; animate: boolean }) {
  const numericVal = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const count = useCountUp(numericVal, 1500, animate);
  const prefix = value.match(/^\+/) ? '+' : '';
  const suffix = value.replace(/[\d.+]/g, '');
  const displayVal = animate && numericVal > 0 ? `${prefix}${count}${suffix}` : value;
  return (
    <div className="btc-stat-card rounded-lg p-4 text-center">
      <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--btc-gold)', fontFamily: "'Cinzel', serif" }}>
        {displayVal}
      </div>
      {unit && <div className="text-sm font-semibold text-white/80 mb-1">{unit}</div>}
      <div className="text-xs text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ─── Map Overlay Dot ─────────────────────────────────────────────────────────
const MAP_OVERLAY_REGIONS = [
  { id: "usa", label: "USA", stat: "83m Households", value: 83, unit: "Households", dotX: "18%", dotY: "38%" },
  { id: "uk", label: "UK", stat: "UK: 12m Reach", value: 26, unit: "m Combined Reach", dotX: "46%", dotY: "25%" },
  { id: "mena", label: "Middle East & N. Africa", stat: "42.2m Reach", value: 42.2, unit: "m Reach", dotX: "56%", dotY: "42%" },
  { id: "japan", label: "Japan", stat: "40m Reach", value: 40, unit: "m Reach", dotX: "82%", dotY: "30%" },
];

function MapOverlayDot({ region, animate }: { region: typeof MAP_OVERLAY_REGIONS[0]; animate: boolean }) {
  const [hovered, setHovered] = useState(false);
  const count = useCountUp(region.value, 1200, hovered && animate);
  return (
    <div className="absolute" style={{ left: region.dotX, top: region.dotY, transform: 'translate(-50%, -50%)', zIndex: 20 }}>
      <div className="relative cursor-pointer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <span className="absolute rounded-full animate-ping" style={{ background: '#D4AF37', opacity: 0.6, width: '20px', height: '20px', top: '-4px', left: '-4px' }} />
        <span className="relative flex items-center justify-center rounded-full border-2 border-white" style={{ background: '#D4AF37', width: '14px', height: '14px' }} />
        {hovered && (
          <div className="absolute z-30 pointer-events-none" style={{ bottom: '140%', left: '50%', transform: 'translateX(-50%)', minWidth: '170px', whiteSpace: 'nowrap' }}>
            <div className="rounded-xl shadow-2xl px-4 py-3 text-center" style={{ background: 'rgba(8,14,36,0.96)', border: '1.5px solid #D4AF37', backdropFilter: 'blur(10px)' }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{region.label}</div>
              <div className="text-2xl font-bold" style={{ color: '#D4AF37', fontFamily: "'Cinzel', serif" }}>
                {count.toFixed(count % 1 === 0 ? 0 : 1)}m
              </div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{region.unit}</div>
              <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-8px', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #D4AF37' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SVGWorldMap({ animate }: { animate: boolean }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
      <img src={PDF_PAGES[2]} alt="Global broadcast reach map" className="w-full block" />
      <div className="absolute inset-0">
        {MAP_OVERLAY_REGIONS.map(region => (
          <MapOverlayDot key={region.id} region={region} animate={animate} />
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}>
        Hover the gold dots to see viewer reach data
      </div>
    </div>
  );
}

// ─── Vimeo Player ────────────────────────────────────────────────────────────
function VimeoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        setVisible(true);
        setTimeout(() => setPlaying(true), 400);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  const src = playing
    ? `https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1&muted=1&loop=0&color=D4AF37&title=0&byline=0&portrait=0`
    : `https://player.vimeo.com/video/${VIMEO_ID}?autoplay=0&color=D4AF37&title=0&byline=0&portrait=0`;

  return (
    <section ref={ref} className="py-16 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(212,175,55,0.05) 20px, rgba(212,175,55,0.05) 40px)' }} />
      <div className="container relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--btc-gold)' }}>
            <Play className="w-3 h-3" /> Official Race Highlights
          </div>
          <h2 className="text-3xl md:text-4xl font-bold italic text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bahrain International Trophy 2025
          </h2>
          <p className="text-white/50 text-sm">A Global Spectacle. A Record-Breaking Year.</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-yellow-400/20" style={{ paddingTop: '56.25%' }}>
            {visible ? (
              <iframe className="absolute inset-0 w-full h-full" src={src} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="BTC 2025 Race Highlights" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--btc-navy-dark), var(--btc-navy))' }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-yellow-400/40" style={{ background: 'rgba(212,175,55,0.15)' }}>
                    <Play className="w-8 h-8" style={{ color: 'var(--btc-gold)' }} />
                  </div>
                  <p className="text-white/50 text-sm">Scroll to play</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section Nav ─────────────────────────────────────────────────────────────
const NAV_LABELS: Record<string, string> = {
  intro: 'Overview', broadcast: 'Broadcast', field: 'The Race',
  digital: 'Digital', headlines: 'Headlines', lifestyle: 'Lifestyle', forward: 'Agenda'
};
const SECTION_KEYS = ['intro', 'broadcast', 'field', 'digital', 'headlines', 'lifestyle', 'forward'];

function SectionNav({ activeSection, onDownload }: { activeSection: string; onDownload: () => void }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          <a href="#cover" className="flex items-center gap-2 mr-4 shrink-0">
            <img src={BTC_LOGO} alt="BTC" className="h-8 w-auto" />
          </a>
          {SECTION_KEYS.map(key => (
            <a key={key} href={`#${key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeSection === key ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              style={activeSection === key ? { background: 'var(--btc-red)' } : {}}>
              {NAV_LABELS[key]}
            </a>
          ))}
          <div className="ml-auto shrink-0 flex gap-2">
            <button onClick={onDownload} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white" style={{ background: 'var(--btc-gold)', color: '#1a1a1a' }}>
              <Download className="w-3 h-3" /> Download PDF
            </button>
            <a href="https://bahrainturfclub.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 transition-colors">
              <ExternalLink className="w-3 h-3" /> BTC Website
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('cover');
  const [statsVisible, setStatsVisible] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveSection(id);
          setStatsVisible(prev => ({ ...prev, [id]: true }));
        }
      });
    }, { threshold: 0.3 });
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleDownload = useCallback(() => {
    const a = document.createElement('a');
    a.href = ORIGINAL_PDF_CDN;
    a.download = '2025-BIT-Media-Report.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // Group media links by source
  const groupedMedia: Record<string, typeof LINKS.media> = {};
  LINKS.media.forEach(l => {
    if (!groupedMedia[l.source]) groupedMedia[l.source] = [];
    groupedMedia[l.source].push(l);
  });

  return (
    <div className="min-h-screen bg-white">
      <SectionNav activeSection={activeSection} onDownload={handleDownload} />

      {/* ── COVER ─────────────────────────────────────────────────────────── */}
      <section id="cover" ref={el => { sectionRefs.current['cover'] = el; }}
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--btc-red-dark) 0%, var(--btc-red) 60%, #8B0000 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20" style={{ background: 'linear-gradient(135deg, transparent 50%, var(--btc-navy) 50%)' }} />
        <div className="absolute top-0 left-0 w-48 h-48 opacity-15" style={{ background: 'linear-gradient(315deg, transparent 50%, var(--btc-navy) 50%)' }} />

        <div className="relative z-10 flex flex-col items-center pt-10 pb-6 px-6">
          <img src={BTC_LOGO} alt="Bahrain Turf Club" className="drop-shadow-2xl" style={{ height: 'clamp(100px, 14vw, 160px)', width: 'auto' }} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-4">
          <img src={PDF_PAGES[0]} alt="2025 Bahrain International Trophy Media Report" className="w-full max-w-3xl mx-auto rounded-xl shadow-2xl" style={{ objectFit: 'contain' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 pb-10 pt-4">
          <button onClick={handleDownload} className="inline-flex items-center gap-2 font-semibold px-6 py-3 text-sm rounded-lg shadow-xl" style={{ background: 'var(--btc-gold)', color: '#1a1a1a' }}>
            <Download className="w-4 h-4" /> Download 2025 Media Report PDF
          </button>
          <a href="#intro" className="flex flex-col items-center gap-1 group">
            <span className="text-white/40 text-xs uppercase tracking-widest group-hover:text-white/70 transition-colors">Explore Report</span>
            <ChevronDown className="w-5 h-5 text-white/40 animate-bounce group-hover:text-white/70 transition-colors" />
          </a>
        </div>
      </section>

      {/* ── INTRO / STATURE ───────────────────────────────────────────────── */}
      <section id="intro" ref={el => { sectionRefs.current['intro'] = el; }}
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--btc-red-dark) 0%, var(--btc-red) 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }} />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs text-white/50 uppercase tracking-widest mb-3 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                A Global Spectacle. A Record-Breaking Year.
              </div>
              <h2 className="text-4xl md:text-5xl font-bold italic mb-6 leading-tight" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>
                {SECTIONS.intro.title}
              </h2>
              <div className="w-16 h-0.5 mb-6" style={{ background: 'var(--btc-gold)' }} />
              {SECTIONS.intro.quotes.map((q, i) => (
                <blockquote key={i} className="relative pl-6 mb-6">
                  <div className="absolute left-0 top-0 text-4xl leading-none font-serif" style={{ color: 'var(--btc-gold)', opacity: 0.6 }}>"</div>
                  <p className="text-white/90 text-lg leading-relaxed italic">{q.text}</p>
                  {q.author && (
                    <footer className="mt-3">
                      <div className="font-bold text-sm" style={{ color: 'var(--btc-gold)' }}>{q.author}</div>
                      <div className="text-white/50 text-xs italic">{q.role}</div>
                    </footer>
                  )}
                </blockquote>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img src={PDF_PAGES[1]} alt="BIT 2025 Highlights" className="rounded-lg shadow-xl col-span-2 w-full" style={{ objectFit: 'contain' }} />
              <div className="btc-stat-card rounded-lg p-5 text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--btc-gold)', fontFamily: "'Cinzel', serif" }}>2025</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Season</div>
              </div>
              <div className="btc-stat-card rounded-lg p-5 text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--btc-gold)', fontFamily: "'Cinzel', serif" }}>$1M</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Prize Purse</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIMEO VIDEO ───────────────────────────────────────────────────── */}
      <VimeoSection />

      {/* ── BROADCAST ─────────────────────────────────────────────────────── */}
      <section id="broadcast" ref={el => { sectionRefs.current['broadcast'] = el; }}
        className="py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, var(--btc-navy-dark) 0%, var(--btc-navy) 100%)' }}>
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--btc-gold)' }}>
              <Tv className="w-3 h-3" /> Broadcast Coverage
            </div>
            <h2 className="text-3xl md:text-4xl font-bold italic text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              {SECTIONS.broadcast.title}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">{SECTIONS.broadcast.subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
            {SECTIONS.broadcast.stats.map((stat, i) => (
              <StatCard key={i} value={stat.value} label={stat.label} animate={!!statsVisible['broadcast']} />
            ))}
          </div>
          <div className="mb-10">
            <SVGWorldMap animate={!!statsVisible['broadcast']} />
          </div>
          <div className="btc-stat-card rounded-xl p-6 max-w-3xl mx-auto">
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{SECTIONS.broadcast.bodyText}</p>
          </div>
        </div>
      </section>

      {/* ── THE RACE / FIELD ──────────────────────────────────────────────── */}
      <section id="field" ref={el => { sectionRefs.current['field'] = el; }}
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--btc-red-dark) 0%, var(--btc-red) 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }} />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold italic mb-6" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>
                {SECTIONS.field.title}
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {SECTIONS.field.stats.map((stat, i) => (
                  <StatCard key={i} value={stat.value} label={stat.label} animate={!!statsVisible['field']} />
                ))}
              </div>
              <div className="space-y-4">
                {SECTIONS.field.quotes.map((q, i) => (
                  <blockquote key={i} className="btc-stat-card rounded-lg p-4">
                    <div className="text-xl font-serif mb-1" style={{ color: 'var(--btc-gold)', opacity: 0.6 }}>"</div>
                    <p className="text-white/90 text-sm italic leading-relaxed">{q.text}</p>
                    <footer className="mt-2">
                      <span className="font-bold text-xs" style={{ color: 'var(--btc-gold)' }}>— {q.author}</span>
                      <span className="text-white/50 text-xs">, {q.role}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
            <div>
              <img src={PDF_PAGES[3]} alt="Race field" className="rounded-xl shadow-2xl w-full mb-4" />
              <div className="btc-stat-card rounded-xl p-5">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{SECTIONS.field.bodyText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIGITAL ───────────────────────────────────────────────────────── */}
      <section id="digital" ref={el => { sectionRefs.current['digital'] = el; }}
        className="py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, var(--btc-navy-dark) 0%, var(--btc-navy) 100%)' }}>
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--btc-gold)' }}>
              <Smartphone className="w-3 h-3" /> Digital & Social
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              {SECTIONS.digital.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center mb-10">
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {SECTIONS.digital.stats.slice(0, 4).map((stat, i) => (
                  <StatCard key={i} value={stat.value} label={stat.label} animate={!!statsVisible['digital']} />
                ))}
              </div>
              <div className="btc-stat-card rounded-xl p-5">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{SECTIONS.digital.bodyText}</p>
              </div>
            </div>
            <img src={PDF_PAGES[4]} alt="Digital coverage" className="rounded-xl shadow-2xl w-full" />
          </div>
          {/* Top content highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SECTIONS.digital.highlights.map((h, i) => (
              <div key={i} className="btc-stat-card rounded-xl p-5 text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--btc-gold)', fontFamily: "'Cinzel', serif" }}>{h.value}</div>
                <div className="text-white/60 text-xs uppercase tracking-wider">{h.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEADLINES ─────────────────────────────────────────────────────── */}
      <section id="headlines" ref={el => { sectionRefs.current['headlines'] = el; }}
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--btc-red-dark) 0%, var(--btc-red) 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }} />
        <div className="container relative z-10">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--btc-gold)' }}>
              <Newspaper className="w-3 h-3" /> International Media
            </div>
            <h2 className="text-3xl md:text-4xl font-bold italic mb-2" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>
              {SECTIONS.headlines.title}
            </h2>
            <p className="text-white/70">{SECTIONS.headlines.subtitle}</p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold italic" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>Glossary</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50 border-l border-white/20 pl-3">Global Coverage</span>
            </div>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
              {Object.entries(groupedMedia).map(([source, sourceLinks]) => (
                <div key={source}>
                  <div className="font-bold italic mb-2 text-sm" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>{source}</div>
                  <div className="space-y-2">
                    {sourceLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-white/30 group-hover:text-yellow-400 transition-colors" />
                        <span className="text-white/70 text-xs leading-relaxed group-hover:text-white transition-colors underline-offset-2 group-hover:underline">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LIFESTYLE ─────────────────────────────────────────────────────── */}
      <section id="lifestyle" ref={el => { sectionRefs.current['lifestyle'] = el; }}
        className="py-16 md:py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--btc-red-dark) 0%, var(--btc-red) 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }} />
        <div className="container relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold italic mb-2" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>
              {SECTIONS.lifestyle.title}
            </h2>
          </div>
          <img src={PDF_PAGES[7]} alt="Lifestyle experience" className="rounded-xl shadow-2xl w-full mb-6" />
          <p className="text-white/80 text-center max-w-2xl mx-auto">{SECTIONS.lifestyle.bodyText}</p>
        </div>
      </section>

      {/* ── FORWARD AGENDA ────────────────────────────────────────────────── */}
      <section id="forward" ref={el => { sectionRefs.current['forward'] = el; }}
        className="py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, var(--btc-navy-dark) 0%, var(--btc-navy) 100%)' }}>
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold italic mb-2" style={{ color: 'var(--btc-gold)', fontFamily: "'Playfair Display', serif" }}>
            {SECTIONS.forward.title}
          </h2>
          <div className="text-white/60 text-sm uppercase tracking-widest mb-8">{SECTIONS.forward.subtitle}</div>
          <div className="w-24 h-0.5 mx-auto mb-8" style={{ background: 'var(--btc-gold)' }} />
          <div className="btc-stat-card rounded-xl p-8 text-left mb-8">
            <p className="text-white/85 leading-relaxed whitespace-pre-line">{SECTIONS.forward.bodyText}</p>
          </div>
        </div>
      </section>

      {/* ── KING'S CUP / BTC LINKS ────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--btc-red)', fontFamily: "'Cinzel', serif" }}>
              Latest at Bahrain Turf Club
            </h2>
            <p className="text-gray-500 text-sm">{KINGS_CUP.date}</p>
          </div>
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg border border-red-100">
            <div className="p-6 text-white" style={{ background: 'linear-gradient(135deg, var(--btc-red-dark) 0%, var(--btc-red) 100%)' }}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/60 mb-1">{KINGS_CUP.date}</div>
                  <h3 className="text-2xl md:text-3xl font-bold italic mb-1" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--btc-gold)' }}>
                    {KINGS_CUP.title}
                  </h3>
                  <p className="text-white/80 text-sm">{KINGS_CUP.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: 'var(--btc-gold)', fontFamily: "'Cinzel', serif" }}>$400,000</div>
                  <div className="text-white/60 text-xs">Group 3 Prize</div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {KINGS_CUP.races.map((r, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                    <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--btc-red)' }}>{r.grade}</div>
                    <div className="font-semibold text-sm text-gray-800">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.distance}</div>
                    <div className="font-bold text-sm mt-1" style={{ color: 'var(--btc-gold)' }}>{r.prize}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="https://bahrainturfclub.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white"
                  style={{ background: 'var(--btc-red)' }}>
                  <ExternalLink className="w-4 h-4" /> Visit BTC Website
                </a>
                <a href="https://bahrainturfclub.com/racecards-results" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition-colors">
                  Race Calendar <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border border-yellow-300 hover:bg-yellow-50 transition-colors"
                  style={{ color: '#8B6914' }}>
                  <Download className="w-4 h-4" /> Download Media Report
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {KINGS_CUP.links.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all group bg-white">
                <span className="text-2xl">{item.label.split(' ')[0]}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-700 transition-colors">{item.label.slice(item.label.indexOf(' ') + 1)}</span>
                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-red-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-12 text-white" style={{ background: 'linear-gradient(135deg, var(--btc-navy-dark) 0%, var(--btc-navy) 100%)' }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={BTC_LOGO} alt="BTC" className="h-14 w-auto" />
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--btc-gold)' }}>The Bahrain Turf Club</div>
                <div className="text-white/50 text-xs">P.O. Box 25079, Riffa, Kingdom of Bahrain</div>
                <div className="text-white/50 text-xs">+973 1744 0330</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {LINKS.btc.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-white/60 hover:text-yellow-400 transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> {link.label}
                </a>
              ))}
            </div>
            <div className="flex gap-3">
              {LINKS.social.map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white/70 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-xs">© 2026 The Bahrain Turf Club. All rights reserved.</p>
            <button onClick={handleDownload} className="text-xs text-white/40 hover:text-yellow-400 transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" /> Download Media Report PDF
            </button>
            <a href="https://bahrainturfclub.com" target="_blank" rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-yellow-400 transition-colors flex items-center gap-1">
              <Globe className="w-3 h-3" /> bahrainturfclub.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
