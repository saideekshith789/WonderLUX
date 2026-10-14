import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Compass, Heart, MapPin, Menu, Minus, Plus, Search, Send, Sparkles, Star, Sun, Wallet, X } from 'lucide-react'
import { destinations, regions } from './data'
import type { Destination } from './data'

const Globe = lazy(() => import('./Globe'))
const photoFallback = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=80'
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const readSaved = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

type Filters = { region: string; season: string; budget: string; sort: string }
type Activity = { id: string; text: string; destination: string }

function App() {
  const reducedMotion = useReducedMotion()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>({ region: 'All regions', season: 'Any season', budget: 'Any budget', sort: 'Curated' })
  const [saved, setSaved] = useState<string[]>(() => readSaved('wanderlux-saved', []))
  const [itinerary, setItinerary] = useState<Activity[][]>(() => readSaved('wanderlux-itinerary', [[], [], []]))
  const [selected, setSelected] = useState<Destination | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'saved' | 'planner'>('discover')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(5)
  const [travellers, setTravellers] = useState(2)
  const [stay, setStay] = useState('Comfort')
  const [budgetDestination, setBudgetDestination] = useState('kyoto')
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState(100)
  const [enquirySent, setEnquirySent] = useState(false)
  const modalCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { localStorage.setItem('wanderlux-saved', JSON.stringify(saved)) }, [saved])
  useEffect(() => { localStorage.setItem('wanderlux-itinerary', JSON.stringify(itinerary)) }, [itinerary])
  useEffect(() => {
    const onScroll = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight
      setProgress(range > 0 ? window.scrollY / range : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    if (!selected) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', closeOnEscape)
    modalCloseRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      previouslyFocused?.focus()
    }
  }, [selected])

  const filtered = destinations.filter((place) => {
    const term = search.trim().toLowerCase()
    const matchesSearch = !term || [place.name, place.country, place.region, place.summary].some((value) => value.toLowerCase().includes(term))
    const matchesRegion = filters.region === 'All regions' || place.region === filters.region
    const matchesSeason = filters.season === 'Any season' || place.season === filters.season
    const matchesBudget = filters.budget === 'Any budget' || (filters.budget === 'Under $150' ? place.daily < 150 : filters.budget === '$150–250' ? place.daily >= 150 && place.daily <= 250 : place.daily > 250)
    const matchesTab = activeTab !== 'saved' || saved.includes(place.id)
    return matchesSearch && matchesRegion && matchesSeason && matchesBudget && matchesTab
  }).sort((first, second) => filters.sort === 'Top rated' ? second.rating - first.rating : filters.sort === 'Lowest budget' ? first.daily - second.daily : filters.sort === 'A–Z' ? first.name.localeCompare(second.name) : 0)

  const toggleSaved = (place: Destination) => {
    const removing = saved.includes(place.id)
    setSaved((current) => removing ? current.filter((id) => id !== place.id) : [...current, place.id])
    setNotice(removing ? `${place.name} removed from your wishlist` : `${place.name} saved for later`)
  }

  const resetFilters = () => {
    setSearch('')
    setFilters({ region: 'All regions', season: 'Any season', budget: 'Any budget', sort: 'Curated' })
    setActiveTab('discover')
  }

  const budgetPlace = destinations.find((place) => place.id === budgetDestination) ?? destinations[0]
  const multipliers: Record<string, number> = { Simple: 0.72, Comfort: 1, Elevated: 1.55 }
  const accommodation = Math.round(budgetPlace.daily * 0.39 * multipliers[stay] * duration)
  const food = Math.round(budgetPlace.daily * 0.27 * duration)
  const transport = Math.round(budgetPlace.daily * 0.14 * duration + 95)
  const activities = Math.round(budgetPlace.daily * 0.2 * duration)
  const total = (accommodation + food + transport + activities) * travellers
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.2, AUD: 1.52 }

  const addActivity = (dayIndex: number, place: Destination) => {
    setItinerary((current) => {
      const next = current.map((day) => [...day])
      next[dayIndex] ??= []
      next[dayIndex].push({ id: `${Date.now()}-${Math.random()}`, text: place.highlights[next[dayIndex].length % place.highlights.length], destination: place.name })
      return next
    })
    setNotice(`${place.name} idea added to day ${dayIndex + 1}`)
  }
  const moveActivity = (dayIndex: number, itemIndex: number, direction: number) => setItinerary((current) => current.map((day, index) => {
    if (index !== dayIndex) return day
    const next = [...day]
    const target = itemIndex + direction
    if (target < 0 || target >= next.length) return day
    ;[next[itemIndex], next[target]] = [next[target], next[itemIndex]]
    return next
  }))
  const removeActivity = (dayIndex: number, itemIndex: number) => setItinerary((current) => current.map((day, index) => index === dayIndex ? day.filter((_, position) => position !== itemIndex) : day))
  const filteredDestination = destinations.find((place) => place.id === budgetDestination) ?? destinations[0]
  const modalGallery = selected ? [selected.image, ...destinations.filter((place) => place.region === selected.region && place.id !== selected.id).slice(0, 3).map((place) => place.image)] : []

  const reveal = { initial: reducedMotion ? false : { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 }, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Wanderlux home"><span className="brand-mark"><Compass size={20} strokeWidth={1.6} /></span><span>WANDERLUX</span></a>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <a href="#explore" onClick={() => setMenuOpen(false)}>Discover</a><a href="#planner" onClick={() => setMenuOpen(false)}>Your trip</a><a href="#budget" onClick={() => setMenuOpen(false)}>Budget planner</a><a href="#contact" onClick={() => setMenuOpen(false)}>Get in touch</a>
        </nav>
        <div className="header-actions"><button className="saved-nav" onClick={() => { setActiveTab('saved'); document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' }) }}><Heart size={16} /> <span>Saved</span><b>{saved.length}</b></button><button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-image" />
          <div className="hero-shade" />
          <div className="hero-grain" />
          <div className="hero-copy">
            <motion.div className="eyebrow light-eyebrow" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}><span /> A world of wonder, well within reach</motion.div>
            <motion.h1 id="hero-heading" initial={reducedMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.8 }}>The world is<br />closer than <em>you think.</em></motion.h1>
            <motion.p initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>Find the places that feel like they were waiting for you.</motion.p>
            <motion.form className="hero-search" onSubmit={(event) => { event.preventDefault(); setActiveTab('discover'); document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' }) }} initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
              <Search size={20} /><input aria-label="Search destinations" placeholder="Where would you like to go?" value={search} onChange={(event) => setSearch(event.target.value)} /><span className="search-divider" /><button type="submit">Explore <ArrowRight size={16} /></button>
            </motion.form>
            <div className="hero-footnote"><span><MapPin size={14} /> {destinations.length} thoughtfully chosen places</span><span className="hero-dot" /> From quiet corners to far horizons</div>
          </div>
          <div className="hero-globe" aria-label="Interactive globe with destination markers"><Suspense fallback={<div className="globe-fallback"><div className="fallback-continent" /></div>}><Globe /></Suspense><div className="globe-caption"><span className="pulse-dot" /> YOUR NEXT SOMEWHERE IS OUT THERE</div></div>
          <a className="hero-scroll" href="#explore"><span>Scroll to explore</span><ArrowDown size={16} /></a>
          <div className="hero-index">01 <span /> 06</div>
        </section>

        <section className="explore section-wrap" id="explore">
          <motion.div className="section-heading" {...reveal}><div><div className="eyebrow"><span /> THE WANDERLUX EDIT</div><h2>Somewhere <em>good</em><br />starts here.</h2></div><p>Not just places to go. Places to feel.<br />A few we can’t stop thinking about.</p></motion.div>
          <div className="explore-controls">
            <div className="tab-list" role="tablist" aria-label="Destination view"><button role="tab" aria-selected={activeTab === 'discover'} className={activeTab === 'discover' ? 'active' : ''} onClick={() => setActiveTab('discover')}>All places <span>{destinations.length}</span></button><button role="tab" aria-selected={activeTab === 'saved'} className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>Your saved <span>{saved.length}</span></button></div>
            <div className="filter-row">
              <label className="filter-select"><span className="sr-only">Filter by region</span><select value={filters.region} onChange={(event) => setFilters({ ...filters, region: event.target.value })}><option>All regions</option>{regions.map((region) => <option key={region}>{region}</option>)}</select><ChevronDown size={14} /></label>
              <label className="filter-select"><span className="sr-only">Filter by season</span><select value={filters.season} onChange={(event) => setFilters({ ...filters, season: event.target.value })}><option>Any season</option>{['Spring', 'Summer', 'Autumn', 'Winter'].map((season) => <option key={season}>{season}</option>)}</select><ChevronDown size={14} /></label>
              <label className="filter-select"><span className="sr-only">Filter by daily budget</span><select value={filters.budget} onChange={(event) => setFilters({ ...filters, budget: event.target.value })}><option>Any budget</option><option>Under $150</option><option>$150–250</option><option>Over $250</option></select><ChevronDown size={14} /></label>
              <label className="filter-select sort-select"><span className="sr-only">Sort destinations</span><select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}><option>Curated</option><option>Top rated</option><option>Lowest budget</option><option>A–Z</option></select><ChevronDown size={14} /></label>
              <button className="clear-filters" onClick={resetFilters}>Clear all <X size={13} /></button>
            </div>
          </div>
          <div className="result-line"><span>{filtered.length} {filtered.length === 1 ? 'place' : 'places'} to fall for</span>{(search || filters.region !== 'All regions' || filters.season !== 'Any season' || filters.budget !== 'Any budget') && <span className="filter-live"><span className="pulse-dot" /> Filters applied</span>}</div>
          {filtered.length ? <div className="destination-grid">{filtered.map((place, index) => <motion.article className="destination-card" key={place.id} {...reveal} transition={{ ...reveal.transition, delay: Math.min(index % 4, 3) * 0.07 }}>
            <button className="card-image-button" aria-label={`View ${place.name} details`} onClick={() => { setSelected(place); setGalleryIndex(0) }}><img src={place.image} alt={`${place.name}, ${place.country}`} loading={index < 4 ? 'eager' : 'lazy'} onError={(event) => { event.currentTarget.src = photoFallback }} /><span className="card-image-wash" /><span className="region-tag">{place.region}</span><span className="card-image-arrow"><ArrowUpRight size={18} /></span></button>
            <button className={`wishlist-button ${saved.includes(place.id) ? 'is-saved' : ''}`} aria-label={saved.includes(place.id) ? `Remove ${place.name} from wishlist` : `Save ${place.name}`} aria-pressed={saved.includes(place.id)} onClick={() => toggleSaved(place)}><Heart size={17} fill={saved.includes(place.id) ? 'currentColor' : 'none'} /></button>
            <div className="card-body"><div className="card-meta"><span>{place.flag} &nbsp;{place.country}</span><span><Star size={13} fill="currentColor" /> {place.rating.toFixed(1)}</span></div><button className="card-title" onClick={() => { setSelected(place); setGalleryIndex(0) }}>{place.name}</button><p>{place.summary}</p><div className="card-bottom"><span><Sun size={14} /> Best in {place.season}</span><span>From <strong>{money(place.daily)}</strong><small> / day</small></span></div></div>
          </motion.article>)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={21} /></span><h3>No places on this path</h3><p>Try a different search, or give the filters a fresh start.</p><button className="text-button" onClick={resetFilters}>Clear search & filters <ArrowRight size={15} /></button></div>}
          {filtered.length > 0 && <div className="grid-end"><span /> <span>YOU’VE REACHED THE END OF THE EDIT</span> <span /></div>}
        </section>

        <section className="manifesto">
          <div className="manifesto-image" />
          <div className="manifesto-overlay" />
          <motion.div className="manifesto-content" {...reveal}><div className="eyebrow light-eyebrow"><span /> TRAVEL, A LITTLE MORE THOUGHTFULLY</div><h2>Go for the feeling.<br /><em>Come back changed.</em></h2><p>The best journeys aren’t measured in miles. They’re the long breakfast, the wrong turn that was right, and the place that somehow feels like yours.</p><a href="#planner" className="button-ivory">Make room for wonder <ArrowRight size={16} /></a></motion.div>
          <div className="manifesto-stamp">THE<br />LONG<br />WAY<br /><span>IS THE<br />RIGHT WAY</span></div>
        </section>

        <section className="planner-section section-wrap" id="budget">
          <motion.div className="section-heading" {...reveal}><div><div className="eyebrow"><span /> A GOOD TRIP, WITHIN REACH</div><h2>Make the numbers<br /><em>feel simple.</em></h2></div><p>A little clarity goes a long way.<br />Shape your trip before you go.</p></motion.div>
          <div className="budget-layout">
            <div className="budget-controls">
              <div className="tool-kicker"><Wallet size={17} /> TRIP ESTIMATOR</div>
              <label className="input-block"><span>Where to?</span><select value={budgetDestination} onChange={(event) => setBudgetDestination(event.target.value)}>{destinations.map((place) => <option value={place.id} key={place.id}>{place.flag} {place.name}, {place.country}</option>)}</select></label>
              <div className="slider-block"><div className="slider-label"><label htmlFor="duration">Trip length</label><strong>{duration} <small>days</small></strong></div><input id="duration" type="range" min="2" max="21" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /><div className="slider-ends"><span>2 days</span><span>3 weeks</span></div></div>
              <div className="split-inputs"><label className="input-block"><span>Travellers</span><span className="stepper"><button aria-label="Remove traveller" onClick={() => setTravellers(Math.max(1, travellers - 1))}><Minus size={15} /></button><strong>{travellers}</strong><button aria-label="Add traveller" onClick={() => setTravellers(Math.min(10, travellers + 1))}><Plus size={15} /></button></span></label><label className="input-block"><span>Stay style</span><select value={stay} onChange={(event) => setStay(event.target.value)}><option>Simple</option><option>Comfort</option><option>Elevated</option></select></label></div>
              <p className="estimate-note">A considered estimate, not a quote. Flights and personal splurges aren’t included.</p>
            </div>
            <div className="budget-result"><div className="budget-result-top"><span>ESTIMATED TOTAL</span><span className="estimate-pill"><Sparkles size={13} /> {filteredDestination.name} edition</span></div><div className="total-price">{money(total)}<small> USD</small></div><div className="per-person">{money(total / travellers)} per traveller <span>·</span> {duration} days</div>
              <div className="cost-chart" aria-label="Estimated travel cost breakdown">{[['Stay', accommodation, '#85d9ca'], ['Food', food, '#efbd83'], ['Getting around', transport, '#97aac1'], ['Little adventures', activities, '#bc9fce']].map(([label, value, color]) => <div className="cost-row" key={String(label)}><span className="cost-label"><i style={{ backgroundColor: String(color) }} />{label}</span><div className="cost-track"><span style={{ width: `${Math.max(4, Number(value) / (accommodation + food + transport + activities) * 100)}%`, backgroundColor: String(color) }} /></div><strong>{money(Number(value) * travellers)}</strong></div>)}</div>
              <div className="budget-footer"><span>Indicative prices · sample USD rates</span><button onClick={() => { document.querySelector('#planner')?.scrollIntoView({ behavior: 'smooth' }); setActiveTab('planner') }}>Build an itinerary <ArrowRight size={14} /></button></div>
            </div>
          </div>
          <div className="currency-strip"><div><span className="currency-icon">↗</span><span><strong>Quick currency check</strong><small>Sample rates only · not live market data</small></span></div><label><span className="sr-only">Amount in US dollars</span><span className="currency-amount"><span>$</span><input type="number" min="0" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></span><ArrowRight size={15} /><select aria-label="Convert US dollars to" value={currency} onChange={(event) => setCurrency(event.target.value)}>{Object.keys(rates).map((rate) => <option key={rate}>{rate}</option>)}</select><strong className="currency-converted">{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : 'A$'}{(amount * rates[currency]).toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong></label></div>
        </section>

        <section className="itinerary-section" id="planner"><div className="section-wrap itinerary-wrap">
          <motion.div className="section-heading" {...reveal}><div><div className="eyebrow light-eyebrow"><span /> YOUR JOURNEY, TAKING SHAPE</div><h2>A little plan.<br /><em>A lot of possibility.</em></h2></div><p>Keep your ideas in one place.<br />They’ll be here when you come back.</p></motion.div>
          <div className="itinerary-toolbar"><div><span className="itinerary-live"><span /> SAVED ON THIS DEVICE</span><p>{itinerary.reduce((sum, day) => sum + day.length, 0)} ideas across {itinerary.length} days</p></div><button className="outline-light-button" onClick={() => setItinerary((current) => [...current, []])}><Plus size={16} /> Add a day</button></div>
          <div className="days-grid">{itinerary.map((day, dayIndex) => <motion.article className="day-card" key={dayIndex} layout><div className="day-card-heading"><span className="day-number">{String(dayIndex + 1).padStart(2, '0')}</span><div><span>DAY {dayIndex + 1}</span><strong>{day.length ? `${day.length} ${day.length === 1 ? 'idea' : 'ideas'}` : 'Still open'}</strong></div>{itinerary.length > 1 && <button className="remove-day" aria-label={`Remove day ${dayIndex + 1}`} onClick={() => setItinerary((current) => current.filter((_, index) => index !== dayIndex))}><X size={15} /></button>}</div>
            <div className="day-activities">{day.length ? day.map((activity, itemIndex) => <div className="activity-row" key={activity.id}><span className="activity-pin"><MapPin size={13} /></span><span className="activity-copy"><small>{activity.destination}</small>{activity.text}</span><span className="activity-actions"><button aria-label="Move activity up" disabled={itemIndex === 0} onClick={() => moveActivity(dayIndex, itemIndex, -1)}><ArrowUp size={13} /></button><button aria-label="Move activity down" disabled={itemIndex === day.length - 1} onClick={() => moveActivity(dayIndex, itemIndex, 1)}><ArrowDown size={13} /></button><button aria-label="Remove activity" onClick={() => removeActivity(dayIndex, itemIndex)}><X size={13} /></button></span></div>) : <div className="day-empty"><span>+</span><p>A blank page is a lovely place to start.</p></div>}</div>
            <label className="add-idea"><span className="sr-only">Choose a destination idea for day {dayIndex + 1}</span><select defaultValue="" onChange={(event) => { const place = destinations.find((item) => item.id === event.target.value); if (place) addActivity(dayIndex, place); event.target.value = '' }}><option value="">Add an idea from…</option>{destinations.map((place) => <option key={place.id} value={place.id}>{place.name}, {place.country}</option>)}</select><Plus size={14} /></label>
          </motion.article>)}</div>
          <div className="planner-weather"><Sun size={18} /><span><strong>Seasonal note · {budgetPlace.name}</strong> {budgetPlace.weather}</span><small>Sample seasonal information</small></div>
        </div></section>

        <section className="contact-section section-wrap" id="contact">
          <motion.div className="contact-intro" {...reveal}><div className="eyebrow"><span /> YOUR NEXT CHAPTER</div><h2>Let’s make<br /><em>somewhere</em><br />happen.</h2><p>Not sure where to begin? Tell us what you’re dreaming about. We’ll help you find a direction.</p><div className="contact-signoff"><span className="signoff-mark"><Compass size={22} /></span><span>Thoughtful travel, always.<small>THE WANDERLUX WAY</small></span></div></motion.div>
          <motion.form className="enquiry-form" {...reveal} onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return; setEnquirySent(true); form.reset() }}>
            <div className="form-header"><div><span>01 / 01</span><h3>Tell us what you’re imagining.</h3></div><Send size={19} /></div>
            {enquirySent ? <div className="success-state" role="status"><span><Check size={19} /></span><div><strong>Your note is ready.</strong><p>This demo doesn’t send messages to a server, but your details passed validation.</p></div><button type="button" onClick={() => setEnquirySent(false)}>Write another</button></div> : <>
              <div className="form-row"><label><span>Your name</span><input name="name" placeholder="First and last name" required minLength={2} /></label><label><span>Email address</span><input name="email" type="email" placeholder="you@example.com" required /></label></div>
              <div className="form-row"><label><span>Somewhere on your mind</span><select name="destination" defaultValue="" required><option value="" disabled>Choose a destination</option>{destinations.map((place) => <option key={place.id}>{place.name}, {place.country}</option>)}</select></label><label><span>When are you thinking?</span><input name="dates" type="month" required /></label></div>
              <div className="form-row"><label><span>Number of travellers</span><select name="travellers" defaultValue="2"><option value="1">Just me</option><option value="2">Two travellers</option><option value="3">Three travellers</option><option value="4">Four travellers</option><option value="5">Five or more</option></select></label><label><span>Anything else?</span><input name="message" placeholder="The feeling you're after…" /></label></div>
              <div className="form-submit-line"><span>No pressure. Just a good place to start.</span><button className="button-dark" type="submit">Send an enquiry <ArrowRight size={16} /></button></div>
            </>}
          </motion.form>
        </section>
      </main>

      <footer className="site-footer"><div className="footer-main"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Compass size={20} /></span><span>WANDERLUX</span></a><p>The world is closer than<br />you think.</p><nav aria-label="Footer navigation"><a href="#explore">Discover</a><a href="#budget">Trip estimator</a><a href="#planner">Your itinerary</a><a href="#contact">Get in touch</a></nav><a className="back-top" href="#top" aria-label="Back to top"><ArrowUp size={18} /></a></div><div className="footer-bottom"><span>© 2025 WANDERLUX. MADE FOR THE WAY OUT THERE.</span><span>Thoughtful travel starts with curiosity.</span></div></footer>

      <AnimatePresence>{selected && <motion.div className="modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><motion.section className="destination-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onKeyDown={(event) => { if (event.key !== 'Tab') return; const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])'); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() } }} initial={{ opacity: 0, y: 22, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3 }}>
        <button ref={modalCloseRef} className="modal-close" aria-label="Close destination details" onClick={() => setSelected(null)}><X size={19} /></button>
        <div className="modal-gallery"><img src={modalGallery[galleryIndex]} alt={`${selected.name} travel view ${galleryIndex + 1}`} onError={(event) => { event.currentTarget.src = photoFallback }} /><div className="gallery-controls"><button aria-label="Previous photo" onClick={() => setGalleryIndex((galleryIndex - 1 + modalGallery.length) % modalGallery.length)}><ArrowLeft size={17} /></button><span>{String(galleryIndex + 1).padStart(2, '0')} <i>/</i> {String(modalGallery.length).padStart(2, '0')}</span><button aria-label="Next photo" onClick={() => setGalleryIndex((galleryIndex + 1) % modalGallery.length)}><ArrowRight size={17} /></button></div><div className="gallery-thumbs">{modalGallery.map((src, index) => <button aria-label={`Show photo ${index + 1}`} className={index === galleryIndex ? 'selected' : ''} key={src} onClick={() => setGalleryIndex(index)}><img src={src} alt="" /></button>)}</div></div>
        <div className="modal-content"><div className="eyebrow"><span /> {selected.region.toUpperCase()} · {selected.country.toUpperCase()}</div><h2 id="detail-title">{selected.name}<span>{selected.flag}</span></h2><p className="modal-summary">{selected.summary}</p><div className="modal-facts"><span><Star size={15} fill="currentColor" /> {selected.rating} / 5</span><span><Sun size={15} /> Best in {selected.season}</span><span><Wallet size={15} /> {money(selected.daily)} / day</span></div><div className="modal-weather"><span><Sun size={18} /></span><div><small>SEASONAL SNAPSHOT · SAMPLE</small><strong>{selected.weather}</strong></div><span className="weather-sample">Typical conditions</span></div><div className="modal-highlights"><div className="eyebrow"><span /> THE GOOD STUFF</div>{selected.highlights.map((item, index) => <div className="highlight-row" key={item}><span>0{index + 1}</span><p>{item}</p><ArrowUpRight size={15} /></div>)}</div><div className="modal-related"><span>More in {selected.region}</span>{destinations.filter((place) => place.region === selected.region && place.id !== selected.id).slice(0, 3).map((place) => <button key={place.id} onClick={() => { setSelected(place); setGalleryIndex(0) }}>{place.name} <ArrowRight size={13} /></button>)}</div><div className="modal-actions"><button className={`button-save ${saved.includes(selected.id) ? 'saved' : ''}`} onClick={() => toggleSaved(selected)}><Heart size={16} fill={saved.includes(selected.id) ? 'currentColor' : 'none'} />{saved.includes(selected.id) ? 'Saved to your list' : 'Save this place'}</button><button className="button-dark" onClick={() => { addActivity(Math.max(0, itinerary.length - 1), selected); setSelected(null); document.querySelector('#planner')?.scrollIntoView({ behavior: 'smooth' }) }}>Add to your trip <ArrowRight size={16} /></button></div></div>
      </motion.section></motion.div>}</AnimatePresence>
      <AnimatePresence>{notice && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><span><Check size={15} /></span>{notice}</motion.div>}</AnimatePresence>
    </>
  )
}

export default App