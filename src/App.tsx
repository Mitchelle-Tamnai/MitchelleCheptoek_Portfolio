import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, ExternalLink, Mail, MoveRight, X } from 'lucide-react';

type Category = 'Build' | 'Organize' | 'Create' | 'Learn';
type Project = { id: number; title: string; category: Category; label: string; blurb: string; detail: string; link?: string; linkLabel?: string; image?: string; color: string };
type Sticker = { id: string; label: string; category: 'Build' | 'Organize' | 'Create' };

const projects: Project[] = [
  { id: 1, title: 'Connecting Dots Africa', category: 'Build', label: 'Dev', blurb: 'A front-end for a training and workshop organization.', detail: "I was one of the technical points of contact at Connecting Dots, a training and workshop organization, and built out its front-end infrastructure, including the organization's website. The site is built in React and deployed on Vercel.", link: 'https://connecting-dots-africa.vercel.app', linkLabel: 'Visit the site', image: '/images/screenshots/Screenshot_2026-11-24_123524.png', color: 'mint' },
  { id: 2, title: 'Univar Logistics', category: 'Build', label: 'Dev', blurb: 'A clean, fast marketing site for a logistics company.', detail: 'A responsive marketing website for Univar Logistics, deployed on Vercel.', link: 'https://univar-logistics-ltd-website.vercel.app', linkLabel: 'Visit the site', image: '/images/screenshots/Screenshot_2026-11-24_123642.png', color: 'mint' },
  { id: 3, title: 'Inbox and calendar', category: 'Organize', label: 'VA', blurb: 'Zero-chaos email and a schedule that makes sense.', detail: 'I sort, answer and flag your email so nothing important slips, and keep your calendar and scheduling in order. With a software background, I can also set up and connect your tools, not just use them.', color: 'orange' },
  { id: 4, title: 'Travel and itineraries', category: 'Organize', label: 'VA', blurb: 'Flights, stays and plans in one clear schedule.', detail: 'I book flights and stays and lay everything out in one clear itinerary, so you can just show up and enjoy the trip.', color: 'orange' },
  { id: 5, title: 'The Autumn21', category: 'Create', label: 'Podcast', blurb: 'My personal-stories podcast. 8 episodes.', detail: 'A personal-stories podcast: 8 episodes, recorded and edited in Audacity, published on Spotify and promoted on Instagram. It ran from July 2023 to January 2025.', link: 'https://open.spotify.com/show/464Y4NiSl77o4xhcoTkOZg', linkLabel: 'Listen on Spotify', color: 'pink' },
  { id: 6, title: 'HubSpot Academy', category: 'Create', label: 'Marketing', blurb: 'Digital marketing and social media management.', detail: 'I completed HubSpot courses in digital marketing and social media management, and I put them to work on my own brands and campaigns.', color: 'pink' },
  { id: 7, title: 'Moringa and certificates', category: 'Learn', label: 'Learning', blurb: 'Software Engineering plus virtual assisting.', detail: 'I studied Software Engineering at Moringa School (2024) and hold certificates in Software Development and in Virtual Assisting, a mix that bridges technical and operational work.', color: 'violet' },
];

const stickers: Sticker[] = [
  { id: 'react', label: 'React', category: 'Build' }, { id: 'typescript', label: 'TypeScript', category: 'Build' }, { id: 'frontend', label: 'Front-end development', category: 'Build' }, { id: 'vercel', label: 'Vercel deployment', category: 'Build' },
  { id: 'inbox', label: 'Inbox management', category: 'Organize' }, { id: 'schedule', label: 'Scheduling', category: 'Organize' }, { id: 'travel', label: 'Travel booking', category: 'Organize' },
  { id: 'audacity', label: 'Audacity editing', category: 'Create' }, { id: 'podcast', label: 'Podcasting', category: 'Create' }, { id: 'social', label: 'Social media', category: 'Create' }, { id: 'hubspot', label: 'HubSpot', category: 'Create' }, { id: 'marketing', label: 'Digital marketing', category: 'Create' },
];

const letterColors = ['cream', 'mint', 'pink', 'orange', 'cream', 'violet', 'mint', 'pink', 'cream', 'orange', 'violet', 'mint', 'pink', 'cream', 'orange', 'violet'];

function App() {
  const deskRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [sorted, setSorted] = useState<Record<string, string[]>>({ Build: [], Organize: [], Create: [] });
  const [dragging, setDragging] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -50, y: -50, active: false });
  const lastFocused = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    const onWheel = (event: WheelEvent) => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); desk.scrollLeft += event.deltaY; } };
    const onScroll = () => setProgress(desk.scrollLeft / Math.max(1, desk.scrollWidth - desk.clientWidth));
    desk.addEventListener('wheel', onWheel, { passive: false }); desk.addEventListener('scroll', onScroll);
    return () => { desk.removeEventListener('wheel', onWheel); desk.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href]')) : [];
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveProject(null);
      if (event.key === 'Tab' && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    focusable[0]?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; lastFocused.current?.focus(); };
  }, [activeProject]);

  const moveDesk = (direction: number) => deskRef.current?.scrollBy({ left: direction * Math.min(window.innerWidth * 0.75, 900), behavior: 'smooth' });
  const dropSticker = (category: Sticker['category']) => { if (!dragging) return; setSorted((current) => ({ ...current, [category]: [...current[category], dragging] })); setDragging(null); };
  const shuffle = () => setSorted({ Build: [], Organize: [], Create: [] });
  const autoSort = () => setSorted({ Build: stickers.filter((item) => item.category === 'Build').map((item) => item.id), Organize: stickers.filter((item) => item.category === 'Organize').map((item) => item.id), Create: stickers.filter((item) => item.category === 'Create').map((item) => item.id) });
  const inFolder = new Set(Object.values(sorted).flat());
  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');
    const message = String(data.get('message') ?? '');
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:mitchellecheptoek@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="app-shell">
      <div className="cursor-star" style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0) scale(${cursor.active ? 1.35 : 1}) rotate(${cursor.active ? 12 : 0}deg)` }} />
      <div className="desk" ref={deskRef} onPointerMove={(event) => event.pointerType === 'mouse' && setCursor({ x: event.clientX - 17, y: event.clientY - 17, active: Boolean((event.target as HTMLElement).closest('button, a, [role="button"]')) })} onPointerLeave={() => setCursor({ x: -50, y: -50, active: false })}>
        <section className="spread hero-spread" aria-labelledby="hero-title">
          <div className="topline"><span className="hand-label">portfolio / 2026</span><span className="issue-mark">NBI • 01</span></div>
          <div className="hero-copy">
            <p className="eyebrow">A multi-hyphenate creative desk</p>
            <h1 id="hero-title" aria-label="Mitchelle Cheptoek" className="ransom-title">{'MITCHELLE CHEPTOEK'.split('').map((letter, index) => <span aria-hidden="true" key={`${letter}-${index}`} className={`letter-tile ${letterColors[index % letterColors.length]}`} style={{ '--tilt': `${(index % 5) - 2}deg` } as CSSProperties}>{letter === ' ' ? '\u00a0' : letter}</span>)}</h1>
            <div className="paper-strips"><p className="strip cream-strip">Developer · virtual assistant · podcaster · marketing student</p><p className="strip mint-strip">Nairobi, Kenya. Bold ideas, tidy execution.</p></div>
            <button className="scroll-sticker" onClick={() => moveDesk(1)}>Scroll or swipe <ArrowRight size={18} /></button>
          </div>
          <div className="hero-aside"><span className="scribble">hello, there!</span><div className="polaroid"><div className="tape" /><img src="/images/Prof_pic.jpeg" alt="Mitchelle Cheptoek" /><p>Hi, I’m Mitchelle!</p></div><p className="aside-note">Software, systems<br />& good stories.</p></div>
          <div className="edge-note">keep going <ArrowDown size={16} /></div>
        </section>

        <section className="spread work-spread" aria-labelledby="work-title">
          <div className="section-heading"><span className="section-number">02 / the cut-outs</span><h2 id="work-title">Things I’ve made<br /><em>and made happen.</em></h2><p>Pick a folder. Open a cut-out. Stay a while.</p></div>
          <div className="folder-groups">{(['Build', 'Organize', 'Create', 'Learn'] as Category[]).map((category, groupIndex) => <div className={`folder-group ${category.toLowerCase()}`} key={category}><div className="folder-tab">{category}<span>0{groupIndex + 1}</span></div><div className="cards">{projects.filter((project) => project.category === category).map((project, index) => <button key={project.id} className="project-card" style={{ '--tilt': `${((index + groupIndex) % 3 - 1) * 2}deg` } as CSSProperties} onClick={() => { lastFocused.current = document.activeElement as HTMLButtonElement; setActiveProject(project); }}><div className="card-tape" /><div className={`category-band ${project.color}`}>{project.label}</div>{project.image && <img className="project-shot" src={project.image} alt={`${project.title} preview`} />}<div className="card-body"><h3>{project.title}</h3><p>{project.blurb}</p><span>Open <ArrowRight size={15} /></span></div></button>)}</div></div>)}</div>
          <div className="nav-arrows"><button aria-label="Previous spread" onClick={() => moveDesk(-1)}><ArrowRight className="arrow-back" /></button><button aria-label="Next spread" onClick={() => moveDesk(1)}><ArrowRight /></button></div>
        </section>

        <section className="spread skills-spread" aria-labelledby="skills-title">
          <div className="skills-intro"><span className="section-number">03 / tactile skills board</span><h2 id="skills-title">Sort my<br /><em>skills.</em></h2><p>Drag each sticker into the folder where it belongs. Or let me do the filing.</p><div className="skill-actions"><button className="dark-button" onClick={autoSort}>sort them for me <Check size={16} /></button><button className="plain-button" onClick={shuffle}>shuffle</button></div></div>
          <div className="corkboard"><div className="board-pin" /><div className="pile-label">the pile <span>↘</span></div><div className="sticker-pile">{stickers.filter((sticker) => !inFolder.has(sticker.id)).map((sticker, index) => <div className="skill-sticker" key={sticker.id} style={{ '--tilt': `${(index % 5 - 2) * 2}deg` } as CSSProperties} onPointerDown={() => setDragging(sticker.id)}>{sticker.label}</div>)}</div><div className="folders">{(['Build', 'Organize', 'Create'] as const).map((folder) => <div className={`skill-folder ${folder.toLowerCase()} ${dragging ? 'is-ready' : ''}`} key={folder} onPointerUp={() => dropSticker(folder)}><div className="folder-head"><span>{folder}</span><b>{sorted[folder].length}/{stickers.filter((item) => item.category === folder).length}</b></div><div className="drop-zone">{sorted[folder].map((id) => { const item = stickers.find((sticker) => sticker.id === id); return item ? <div className="sorted-sticker" key={id}>{item.label}</div> : null; })}{sorted[folder].length === 0 && <span>drop here</span>}</div></div>)}</div></div>
        </section>

        <section className="spread contact-spread" aria-labelledby="contact-title"><div className="contact-card"><span className="section-number">04 / your turn</span><div className="contact-star">✳</div><h2 id="contact-title">Got something to<br /><em>build, organize<br />or amplify?</em></h2><p>Tell me what you’re working on and let’s make it happen.</p><form className="contact-form" onSubmit={handleContactSubmit}><label htmlFor="name">Your name<input id="name" name="name" type="text" autoComplete="name" required /></label><label htmlFor="email">Your email<input id="email" name="email" type="email" autoComplete="email" required /></label><label htmlFor="message">Your message<textarea id="message" name="message" rows={4} required /></label><button className="contact-button" type="submit">Send message <Mail size={18} /></button></form><span className="contact-footer">mitchellecheptoek@gmail.com <span>✦</span> Nairobi, Kenya</span></div><div className="contact-doodle">make<br />good<br /><strong>noise.</strong></div></section>
      </div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(5, progress * 100)}%` }} /></div>
      {activeProject && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setActiveProject(null)}><article className={`project-modal ${activeProject.color}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="close-modal" aria-label="Close project details" onClick={() => setActiveProject(null)}><X /></button><span className="modal-pill">{activeProject.category} / {activeProject.label}</span><h2 id="modal-title">{activeProject.title}</h2>{activeProject.image && <img src={activeProject.image} alt={`${activeProject.title} project preview`} /> }<p>{activeProject.detail}</p>{activeProject.link && <a className="modal-link" href={activeProject.link} target="_blank" rel="noreferrer">{activeProject.linkLabel} <ExternalLink size={16} /></a>}<div className="modal-footer"><span>Mitchelle Cheptoek</span><MoveRight size={22} /></div></article></div>}
    </main>
  );
}

export default App;
