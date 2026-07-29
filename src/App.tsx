import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  MapPin,
  Users,
  Star,
  ChevronRight,
  Menu,
  X,
  Globe,
  Heart,
  ArrowRight,
  Wifi,
  Waves,
  Mountain,
  Utensils,
  Car,
  Check,
  Shield,
  Sparkles,
  TrendingUp,
  LogOut,
  Minus,
  Plus,
  User as UserIcon,
} from 'lucide-react';
import { destinations } from '@/data/destinations';
import { hotels } from '@/data/hotels';
import type { Hotel } from '@/data/hotels';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useFavorites } from '@/lib/useFavorites';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/AuthModal';
import { DateRangePicker } from '@/components/DateRangePicker';

const amenityIcon: Record<string, typeof Wifi> = {
  'Free WiFi': Wifi,
  'Sea view': Waves,
  'Mountain view': Mountain,
  'River view': Waves,
  'Beachfront': Waves,
  'City center': MapPin,
  Restaurant: Utensils,
  'Free breakfast': Utensils,
  'Full board': Utensils,
  Pool: Waves,
  Spa: Sparkles,
  'Eco-friendly': Sparkles,
  Parking: Car,
  'Airport shuttle': Car,
  Bonfire: Sparkles,
  'Private balcony': Mountain,
  'Rooftop café': Utensils,
};

function formatBDT(n: number) {
  return new Intl.NumberFormat('en-IN').format(n);
}

/* ---------- Header ---------- */
function Header({ onAuthOpen, onTripsOpen }: { onAuthOpen: () => void; onTripsOpen: () => void }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900 tracking-tight">
              Bangla<span className="text-green-600">Stay</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#destinations" className="hover:text-green-700 transition-colors">Destinations</a>
            <a href="#stays" className="hover:text-green-700 transition-colors">Stays</a>
            <a href="#experiences" className="hover:text-green-700 transition-colors">Experiences</a>
            <a href="#deals" className="hover:text-green-700 transition-colors">Deals</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onTripsOpen}
                  className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-green-700 transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> My trips
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAuthOpen}
                  className="text-sm font-medium text-stone-600 hover:text-green-700 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={onAuthOpen}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>
          <button className="md:hidden p-2 text-stone-700" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3">
          <a href="#destinations" className="block text-stone-700 font-medium" onClick={() => setOpen(false)}>Destinations</a>
          <a href="#stays" className="block text-stone-700 font-medium" onClick={() => setOpen(false)}>Stays</a>
          <a href="#experiences" className="block text-stone-700 font-medium" onClick={() => setOpen(false)}>Experiences</a>
          <a href="#deals" className="block text-stone-700 font-medium" onClick={() => setOpen(false)}>Deals</a>
          {user ? (
            <>
              <button onClick={() => { setOpen(false); onTripsOpen(); }} className="block w-full text-left text-stone-700 font-medium">My trips</button>
              <button onClick={() => { setOpen(false); signOut(); }} className="block w-full text-left text-red-600 font-medium">Sign out</button>
            </>
          ) : (
            <button onClick={() => { setOpen(false); onAuthOpen(); }} className="w-full text-sm font-semibold px-4 py-2 rounded-lg bg-green-600 text-white">Register</button>
          )}
        </div>
      )}
    </header>
  );
}

/* ---------- Search Bar ---------- */
interface SearchState {
  destination: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
}

function SearchBar({ onSearch }: { onSearch: (s: SearchState) => void }) {
  const [destination, setDestination] = useState('');
  const [destOpen, setDestOpen] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const destRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false);
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setGuestsOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const guestLabel = `${adults} adult${adults !== 1 ? 's' : ''} · ${children} child${children !== 1 ? 'ren' : ''} · ${rooms} room${rooms !== 1 ? 's' : ''}`;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch({ destination, checkIn, checkOut, adults, children, rooms });
        document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className="bg-white rounded-2xl shadow-xl p-2 sm:p-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-0 max-w-5xl mx-auto"
    >
      {/* Destination dropdown */}
      <div className="relative flex-1" ref={destRef}>
        <button
          type="button"
          onClick={() => setDestOpen(!destOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 md:border-r md:border-stone-200 text-left hover:bg-stone-50/50 rounded-xl md:rounded-none transition-colors"
        >
          <MapPin className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Destination</label>
            <span className={`block text-sm font-medium ${destination ? 'text-stone-800' : 'text-stone-400'}`}>
              {destination || 'Where in Bangladesh?'}
            </span>
          </div>
        </button>
        {destOpen && (
          <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 w-full min-w-[240px] max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={() => { setDestination(''); setDestOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-stone-50 text-sm font-medium text-stone-700"
            >
              All destinations
            </button>
            {destinations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setDestination(d.name); setDestOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-stone-50 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{d.name}</p>
                  <p className="text-xs text-stone-500">{d.region} · {d.properties} properties</p>
                </div>
                <span className="text-xs font-semibold text-green-700">৳{formatBDT(d.fromPrice)}+</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date range picker */}
      <DateRangePicker
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
      />

      {/* Guests stepper */}
      <div className="relative flex-1" ref={guestsRef}>
        <button
          type="button"
          onClick={() => setGuestsOpen(!guestsOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 md:border-r md:border-stone-200 text-left hover:bg-stone-50/50 rounded-xl md:rounded-none transition-colors"
        >
          <Users className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Guests</label>
            <span className="block text-sm font-medium text-stone-800 truncate">{guestLabel}</span>
          </div>
        </button>
        {guestsOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-stone-100 p-4 w-72">
            <Stepper label="Adults" sub="Ages 13 or above" value={adults} min={1} max={20} onChange={setAdults} />
            <div className="h-px bg-stone-100 my-3" />
            <Stepper label="Children" sub="Ages 2–12" value={children} min={0} max={10} onChange={setChildren} />
            <div className="h-px bg-stone-100 my-3" />
            <Stepper label="Rooms" sub="Rooms you need" value={rooms} min={1} max={10} onChange={setRooms} />
            <button
              type="button"
              onClick={() => setGuestsOpen(false)}
              className="mt-4 w-full bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm">
        <Search className="w-5 h-5" />
        <span className="md:hidden">Search</span>
      </button>
    </form>
  );
}

function Stepper({ label, sub, value, min, max, onChange }: { label: string; sub: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-stone-800">{label}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-stone-300 text-stone-600 hover:border-green-500 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-stone-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-stone-300 text-stone-600 hover:border-green-500 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero({ onSearch }: { onSearch: (s: SearchState) => void }) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/33626644/pexels-photo-33626644.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/50 to-stone-900/70" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium border border-white/20 mb-6">
            <Sparkles className="w-4 h-4" />
            Discover the golden Bengal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Find your stay in <span className="text-green-400">Bangladesh</span>
          </h1>
          <p className="mt-5 text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed">
            From the world's longest beach to the cloud-kissed hills of Sajek — book handpicked hotels, eco-lodges, and beachfront villas across the delta.
          </p>
        </div>
        <div className="mt-10">
          <SearchBar onSearch={onSearch} />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-stone-200">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Verified properties</span>
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Free cancellation on most stays</span>
          <span className="flex items-center gap-2"><Star className="w-4 h-4 text-green-400" /> 4.7 average guest rating</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Destinations ---------- */
function Destinations({ onPick }: { onPick: (id: string) => void }) {
  return (
    <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Explore destinations</h2>
          <p className="mt-2 text-stone-500">Six unforgettable regions across Bangladesh</p>
        </div>
        <button onClick={() => onPick('all')} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
          See all stays <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              onPick(d.id);
              document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3] text-left"
          >
            <img
              src={d.image}
              alt={d.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-300 mb-1">
                <MapPin className="w-3.5 h-3.5" /> {d.region}
              </div>
              <h3 className="text-xl font-bold tracking-tight">{d.name}</h3>
              <p className="text-sm text-stone-200 mt-0.5">{d.tagline}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-200">{d.properties} properties</span>
                <span className="text-sm font-semibold">from ৳{formatBDT(d.fromPrice)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Hotel Card ---------- */
function HotelCard({
  hotel,
  isFav,
  onToggleFav,
  onBook,
}: {
  hotel: Hotel;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onBook: (h: Hotel) => void;
}) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hotel.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-green-700 shadow-sm">
            {hotel.badge}
          </span>
        )}
        <button
          onClick={() => onToggleFav(hotel.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label="Save"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-stone-500'}`} />
        </button>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 tracking-tight leading-snug">{hotel.name}</h3>
            <p className="text-sm text-stone-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {hotel.destinationName}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg shrink-0">
            <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
            <span className="text-sm font-bold text-green-700">{hotel.rating}</span>
          </div>
        </div>
        <p className="text-sm text-stone-600 mt-3 leading-relaxed line-clamp-2">{hotel.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hotel.amenities.slice(0, 4).map((a) => {
            const Icon = amenityIcon[a] ?? Sparkles;
            return (
              <span key={a} className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                <Icon className="w-3 h-3" /> {a}
              </span>
            );
          })}
        </div>
        <div className="flex items-end justify-between mt-5 pt-4 border-t border-stone-100">
          <div>
            <span className="text-xs text-stone-400">{hotel.reviews.toLocaleString()} reviews</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-stone-900">৳{formatBDT(hotel.pricePerNight)}</span>
              <span className="text-xs text-stone-500">/ night</span>
            </div>
          </div>
          <button
            onClick={() => onBook(hotel)}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Book now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------- Stays ---------- */
function Stays({
  filter,
  search,
  onPick,
  onToggleFav,
  favorites,
  onBook,
}: {
  filter: string;
  search: SearchState;
  onPick: (id: string) => void;
  onToggleFav: (id: string) => void;
  favorites: Set<string>;
  onBook: (h: Hotel) => void;
}) {
  const filtered = useMemo(() => {
    let list = hotels;
    if (filter !== 'all') list = list.filter((h) => h.destinationId === filter);
    const q = search.destination.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.destinationName.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [filter, search.destination]);

  return (
    <section id="stays" className="bg-stone-50 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Featured stays</h2>
          <p className="mt-2 text-stone-500">
            {search.destination.trim() ? `Results for "${search.destination.trim()}"` : 'Handpicked properties loved by travellers'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip label="All stays" active={filter === 'all'} onClick={() => onPick('all')} />
          {destinations.map((d) => (
            <FilterChip key={d.id} label={d.name} active={filter === d.id} onClick={() => onPick(d.id)} />
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">No stays found. Try a different destination or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((h) => (
              <HotelCard
                key={h.id}
                hotel={h}
                isFav={favorites.has(h.id)}
                onToggleFav={onToggleFav}
                onBook={onBook}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-green-600 text-white shadow-sm'
          : 'bg-white text-stone-600 border border-stone-200 hover:border-green-300 hover:text-green-700'
      }`}
    >
      {label}
    </button>
  );
}

/* ---------- Experiences ---------- */
function Experiences() {
  const items = [
    { icon: Waves, title: 'Beach & islands', desc: "Cox's Bazar, Saint Martin's, Kuakata" },
    { icon: Mountain, title: 'Hill trails', desc: 'Sajek, Bandarban, Rangamati' },
    { icon: Sparkles, title: 'Wildlife', desc: 'Sundarbans tiger safaris' },
    { icon: Utensils, title: 'Food trails', desc: 'Hilsa, biryani, street eats of Old Dhaka' },
  ];
  return (
    <section id="experiences" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Experiences to add to your trip</h2>
      <p className="mt-2 text-stone-500 mb-8">Curated things to do, beyond the hotel room</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it) => (
          <div key={it.title} className="group p-6 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <it.icon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-stone-900">{it.title}</h3>
            <p className="text-sm text-stone-500 mt-1">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Deals banner ---------- */
function Deals() {
  return (
    <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-700 to-emerald-800 p-8 sm:p-12">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-green-500/20 blur-2xl" />
        <div className="absolute -left-8 -bottom-12 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-white max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-4">
              <TrendingUp className="w-3.5 h-3.5" /> Limited time
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Up to 30% off monsoon stays</h2>
            <p className="mt-3 text-green-100 leading-relaxed">
              Plan a misty season escape to the hills of Sajek or the mangroves of the Sundarbans. Free breakfast included on selected properties.
            </p>
          </div>
          <button
            onClick={() => document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' })}
            className="self-start md:self-center bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Browse deals
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const cols = [
    { h: 'Discover', links: ['Destinations', 'Experiences', 'Travel guides', 'Deals'] },
    { h: 'Company', links: ['About us', 'Careers', 'Press', 'Sustainability'] },
    { h: 'Support', links: ['Help center', 'Cancellation', 'Safety', 'Contact us'] },
  ];
  const sectionMap: Record<string, string> = {
    Destinations: 'destinations',
    Experiences: 'experiences',
    Deals: 'deals',
  };
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bangla<span className="text-green-400">Stay</span></span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">Your home for discovering and booking stays across Bangladesh.</p>
          </div>
          {cols.map((col) => (
            <div key={col.h}>
              <h4 className="font-semibold text-white text-sm mb-4">{col.h}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => {
                  const target = sectionMap[l];
                  return (
                    <li key={l}>
                      {target ? (
                        <a href={`#${target}`} className="hover:text-green-400 transition-colors">{l}</a>
                      ) : (
                        <a href="#top" className="hover:text-green-400 transition-colors">{l}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <p>© 2026 BanglaStay. Made with care in Dhaka.</p>
          <div className="flex gap-6">
            <a href="#top" className="hover:text-green-400 transition-colors">Privacy</a>
            <a href="#top" className="hover:text-green-400 transition-colors">Terms</a>
            <a href="#top" className="hover:text-green-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Booking Modal ---------- */
function BookingModal({
  hotel,
  onClose,
  onAuthRequired,
}: {
  hotel: Hotel | null;
  onClose: () => void;
  onAuthRequired: () => void;
}) {
  const { user } = useAuth();
  const { favorites, toggle: toggleFav } = useFavorites();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(2);

  if (!hotel) return null;
  const total = hotel.pricePerNight * nights;
  const taxes = Math.round(total * 0.15);
  const grand = total + taxes;

  const handleClose = () => {
    setConfirmed(false);
    setError(null);
    onClose();
  };

  async function handleConfirm() {
    if (!user) {
      onAuthRequired();
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('bookings').insert({
      hotel_id: hotel!.id,
      hotel_name: hotel!.name,
      destination_name: hotel!.destinationName,
      nights,
      guests,
      price_per_night: hotel!.pricePerNight,
      total: grand,
      status: 'confirmed',
    });
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
      setConfirmed(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="relative h-44">
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent" />
          <button onClick={handleClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white">
            <X className="w-5 h-5 text-stone-700" />
          </button>
          <button
            onClick={() => toggleFav(hotel.id)}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
            aria-label="Save"
          >
            <Heart className={`w-4 h-4 ${favorites.has(hotel.id) ? 'fill-red-500 text-red-500' : 'text-stone-500'}`} />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h3 className="text-xl font-bold">{hotel.name}</h3>
            <p className="text-sm text-stone-200 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {hotel.destinationName}</p>
          </div>
        </div>
        {confirmed ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Booking confirmed!</h3>
            <p className="text-stone-500 mt-2">Your stay at {hotel.name} is reserved. A confirmation has been sent to your email.</p>
            <div className="mt-6 bg-stone-50 rounded-xl p-4 text-left text-sm">
              <div className="flex justify-between py-1"><span className="text-stone-500">Check-in</span><span className="font-medium text-stone-800">Tomorrow</span></div>
              <div className="flex justify-between py-1"><span className="text-stone-500">Nights</span><span className="font-medium text-stone-800">{nights}</span></div>
              <div className="flex justify-between py-1"><span className="text-stone-500">Guests</span><span className="font-medium text-stone-800">{guests}</span></div>
              <div className="flex justify-between py-1 pt-2 mt-2 border-t border-stone-200"><span className="text-stone-500">Total paid</span><span className="font-bold text-stone-900">৳{formatBDT(grand)}</span></div>
            </div>
            <button onClick={handleClose} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">Done</button>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-bold text-stone-900">Reserve your stay</h3>
            <p className="text-sm text-stone-500 mt-1">{hotel.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">Nights</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNights(Math.max(1, nights - 1))} className="w-9 h-9 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50">-</button>
                  <span className="flex-1 text-center font-semibold text-stone-800">{nights}</span>
                  <button onClick={() => setNights(nights + 1)} className="w-9 h-9 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50">+</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">Guests</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-9 h-9 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50">-</button>
                  <span className="flex-1 text-center font-semibold text-stone-800">{guests}</span>
                  <button onClick={() => setGuests(guests + 1)} className="w-9 h-9 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50">+</button>
                </div>
              </div>
            </div>
            <div className="mt-5 bg-stone-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">৳{formatBDT(hotel.pricePerNight)} × {nights} nights</span><span className="font-medium text-stone-800">৳{formatBDT(total)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Taxes & fees (15%)</span><span className="font-medium text-stone-800">৳{formatBDT(taxes)}</span></div>
              <div className="flex justify-between pt-2 mt-2 border-t border-stone-200"><span className="font-bold text-stone-900">Total</span><span className="font-bold text-stone-900">৳{formatBDT(grand)}</span></div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{error}</div>}
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="mt-5 w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
            >
              {saving ? 'Processing…' : user ? `Confirm booking · ৳${formatBDT(grand)}` : 'Sign in to confirm booking'}
            </button>
            <p className="text-xs text-stone-400 text-center mt-3">Free cancellation up to 48 hours before check-in</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Trips Modal ---------- */
interface TripBooking {
  id: string;
  hotel_id: string;
  hotel_name: string;
  destination_name: string;
  nights: number;
  guests: number;
  total: number;
  created_at: string;
}

function TripsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from('bookings')
      .select('id, hotel_id, hotel_name, destination_name, nights, guests, total, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTrips((data as TripBooking[]) ?? []);
        setLoading(false);
      });
  }, [open, user]);

  if (!open) return null;

  const favHotels = hotels.filter((h) => favorites.has(h.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">My trips</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center">
            <X className="w-5 h-5 text-stone-700" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-3">Saved favorites</h3>
            {favHotels.length === 0 ? (
              <p className="text-sm text-stone-500">No saved properties yet. Tap the heart on any stay to save it here.</p>
            ) : (
              <div className="space-y-3">
                {favHotels.map((h) => (
                  <div key={h.id} className="flex gap-3 items-center">
                    <img src={h.image} alt={h.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900 text-sm">{h.name}</p>
                      <p className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {h.destinationName}</p>
                      <p className="text-xs font-medium text-green-700 mt-0.5">৳{formatBDT(h.pricePerNight)} / night</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-3">Your bookings</h3>
            {loading ? (
              <p className="text-sm text-stone-500">Loading…</p>
            ) : trips.length === 0 ? (
              <p className="text-sm text-stone-500">No bookings yet. Reserve a stay to see it here.</p>
            ) : (
              <div className="space-y-3">
                {trips.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-stone-50 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{t.hotel_name}</p>
                      <p className="text-xs text-stone-500">{t.destination_name} · {t.nights} nights · {t.guests} guests</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900 text-sm">৳{formatBDT(t.total)}</p>
                      <span className="text-xs text-green-600 font-medium">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
function AppInner() {
  const [booking, setBooking] = useState<Hotel | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState<SearchState>({ destination: '', checkIn: null, checkOut: null, adults: 2, children: 0, rooms: 1 });
  const { user } = useAuth();
  const { favorites, toggle: toggleFav } = useFavorites();

  const handleToggleFav = async (hotelId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    await toggleFav(hotelId);
  };

  return (
    <div id="top" className="min-h-screen bg-white text-stone-900 antialiased">
      <Header onAuthOpen={() => setAuthOpen(true)} onTripsOpen={() => setTripsOpen(true)} />
      <Hero onSearch={setSearch} />
      <Destinations onPick={setFilter} />
      <Stays
        filter={filter}
        search={search}
        onPick={setFilter}
        onToggleFav={handleToggleFav}
        favorites={favorites}
        onBook={setBooking}
      />
      <Experiences />
      <Deals />
      <Footer />
      <BookingModal hotel={booking} onClose={() => setBooking(null)} onAuthRequired={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <TripsModal open={tripsOpen} onClose={() => setTripsOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
