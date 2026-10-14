export type Region = 'Asia' | 'Europe' | 'Africa' | 'North America' | 'South America' | 'Oceania'
export type Destination = {
  id: string
  name: string
  country: string
  flag: string
  region: Region
  image: string
  rating: number
  summary: string
  season: string
  daily: number
  nights: number
  weather: string
  highlights: string[]
  lat: number
  lon: number
}

const image = (id: string, width = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

export const destinations: Destination[] = [
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', flag: '🇯🇵', region: 'Asia', image: image('photo-1493976040374-85c8e12f0c0e'), rating: 4.9, summary: 'Where lantern-lit lanes and quiet gardens keep their own time.', season: 'Spring', daily: 185, nights: 5, weather: 'Mild, around 18°C', highlights: ['Walk the torii gates of Fushimi Inari', 'A tea ceremony in Gion', 'Sunrise at Arashiyama bamboo grove'], lat: 35, lon: 135 },
  { id: 'amalfi', name: 'Amalfi Coast', country: 'Italy', flag: '🇮🇹', region: 'Europe', image: image('photo-1533105079780-92b9be482077'), rating: 4.9, summary: 'Salt air, pastel villages and long lunches above the sea.', season: 'Summer', daily: 245, nights: 6, weather: 'Sunny, around 26°C', highlights: ['Take the coastal path to Ravello', 'Swim beneath the cliffs at Fiordo di Furore', 'A slow ferry between Positano and Amalfi'], lat: 40.6, lon: 14.6 },
  { id: 'marrakech', name: 'Marrakech', country: 'Morocco', flag: '🇲🇦', region: 'Africa', image: image('photo-1539020140153-e479b8c22e70'), rating: 4.8, summary: 'A sensory maze of spice, craft and courtyard calm.', season: 'Autumn', daily: 110, nights: 4, weather: 'Warm, around 24°C', highlights: ['Get lost in the medina souks', 'The blue calm of Jardin Majorelle', 'Sunset from a rooftop over Jemaa el-Fnaa'], lat: 31.6, lon: -8 },
  { id: 'banff', name: 'Banff', country: 'Canada', flag: '🇨🇦', region: 'North America', image: image('photo-1503614472-8c93d56cd5b5'), rating: 4.9, summary: 'Glacial blue lakes beneath a horizon of wild peaks.', season: 'Summer', daily: 210, nights: 5, weather: 'Crisp, around 16°C', highlights: ['See Moraine Lake before the crowds', 'Ride the Banff Gondola at golden hour', 'A lakeside walk at Lake Louise'], lat: 51.2, lon: -115.6 },
  { id: 'cusco', name: 'Cusco', country: 'Peru', flag: '🇵🇪', region: 'South America', image: image('photo-1526392060635-9d6019884377'), rating: 4.9, summary: 'Ancient stonework, Andean air and a city made for wandering.', season: 'Winter', daily: 95, nights: 5, weather: 'Dry, around 17°C', highlights: ['Explore the Sacred Valley by train', 'Trace Inca walls in the old town', 'Early entry to Machu Picchu'], lat: -13.5, lon: -71.9 },
  { id: 'queenstown', name: 'Queenstown', country: 'New Zealand', flag: '🇳🇿', region: 'Oceania', image: image('photo-1507699622108-4be3abd695ad'), rating: 4.8, summary: 'A lakeside basecamp where the mountains steal the show.', season: 'Autumn', daily: 220, nights: 5, weather: 'Fresh, around 15°C', highlights: ['Cruise Lake Wakatipu', 'Take the Skyline gondola above town', 'Spend a day among the vines in Gibbston'], lat: -45, lon: 168.7 },
  { id: 'bali', name: 'Ubud', country: 'Indonesia', flag: '🇮🇩', region: 'Asia', image: image('photo-1537996194471-e657df975ab4'), rating: 4.8, summary: 'Rice terraces, temple bells and a softer pace of life.', season: 'Spring', daily: 90, nights: 6, weather: 'Tropical, around 29°C', highlights: ['Walk the Campuhan Ridge at dawn', 'Visit Tirta Empul water temple', 'A cooking class in a family compound'], lat: -8.5, lon: 115.3 },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', region: 'Europe', image: image('photo-1555881400-74d7acaacd8b'), rating: 4.8, summary: 'Tile-blue streets, late dinners and light that lingers.', season: 'Autumn', daily: 145, nights: 4, weather: 'Bright, around 22°C', highlights: ['Ride the old tram through Alfama', 'Listen to fado in a candlelit tavern', 'Day trip to the palaces of Sintra'], lat: 38.7, lon: -9.1 },
  { id: 'serengeti', name: 'Serengeti', country: 'Tanzania', flag: '🇹🇿', region: 'Africa', image: image('photo-1516026672322-bc52d61a55d5'), rating: 5.0, summary: 'Wide-open savannah and wildlife encounters that stay with you.', season: 'Winter', daily: 390, nights: 6, weather: 'Dry, around 27°C', highlights: ['Go out on a sunrise game drive', 'Watch the migration cross the plains', 'Meet Maasai hosts with a local guide'], lat: -2.3, lon: 34.8 },
  { id: 'new-york', name: 'New York City', country: 'United States', flag: '🇺🇸', region: 'North America', image: image('photo-1519608487953-e999c86e7455'), rating: 4.7, summary: 'Neighborhoods with their own rhythm, all in one city.', season: 'Autumn', daily: 290, nights: 5, weather: 'Comfortable, around 20°C', highlights: ['Walk the High Line into Chelsea', 'Catch a small jazz set in the Village', 'Take the ferry for a skyline at dusk'], lat: 40.7, lon: -74 },
  { id: 'patagonia', name: 'Patagonia', country: 'Argentina', flag: '🇦🇷', region: 'South America', image: image('photo-1464822759023-fed622ff2c3b'), rating: 4.9, summary: 'A far edge of the world, best explored one trail at a time.', season: 'Summer', daily: 175, nights: 7, weather: 'Cool, around 14°C', highlights: ['Hike beneath the towers of Fitz Roy', 'See Perito Moreno Glacier calve', 'Stay one night at an estancia'], lat: -50.3, lon: -73.2 },
  { id: 'santorini', name: 'Santorini', country: 'Greece', flag: '🇬🇷', region: 'Europe', image: image('photo-1613395877344-13d4a8e0d49e'), rating: 4.8, summary: 'Whitewashed paths, volcanic shores and unhurried evenings.', season: 'Summer', daily: 235, nights: 4, weather: 'Dry, around 27°C', highlights: ['Walk the caldera trail from Fira', 'Swim at the red volcanic beach', 'Taste Assyrtiko beside the vineyards'], lat: 36.4, lon: 25.4 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', flag: '🇦🇺', region: 'Oceania', image: image('photo-1506973035872-a4ec16b8e8d9'), rating: 4.8, summary: 'A harbor city that makes the outdoors part of every day.', season: 'Spring', daily: 230, nights: 5, weather: 'Sunny, around 23°C', highlights: ['Walk the coast from Bondi to Coogee', 'Sail across the harbor at sunset', 'Find a quiet cove in the Royal Botanic Garden'], lat: -33.9, lon: 151.2 },
]

export const regions: Region[] = ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania']