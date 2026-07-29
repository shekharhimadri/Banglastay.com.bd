export interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
  description: string;
  badge?: string;
}

export const hotels: Hotel[] = [
  {
    id: 'h1',
    name: 'Long Beach Resort & Spa',
    destinationId: 'coxs-bazar',
    destinationName: "Cox's Bazar",
    rating: 4.8,
    reviews: 2143,
    pricePerNight: 6200,
    image:
      'https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    amenities: ['Sea view', 'Pool', 'Spa', 'Free breakfast', 'Beachfront'],
    description:
      'A five-star beachfront resort offering uninterrupted views of the Bay of Bengal, an infinity pool, and a full-service Ayurvedic spa.',
    badge: 'Guest favourite',
  },
  {
    id: 'h2',
    name: 'Sajek Cloud Resort',
    destinationId: 'sajek',
    destinationName: 'Sajek Valley',
    rating: 4.6,
    reviews: 812,
    pricePerNight: 3400,
    image:
      'https://images.pexels.com/photos/7507131/pexels-photo-7507131.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    amenities: ['Mountain view', 'Bonfire', 'Restaurant', 'Free WiFi'],
    description:
      'Wake up above the clouds. Hilltop cottages with panoramic valley views, evening bonfires, and locally sourced cuisine.',
    badge: 'Trending',
  },
  {
    id: 'h3',
    name: 'Sundarban Eco Lodge',
    destinationId: 'sundarbans',
    destinationName: 'Sundarbans',
    rating: 4.7,
    reviews: 534,
    pricePerNight: 7200,
    image:
      'https://images.pexels.com/photos/97083/pexels-photo-97083.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    amenities: ['River tours', 'Wildlife guide', 'Eco-friendly', 'Full board'],
    description:
      'An eco-lodge on the edge of the mangroves with guided tiger-tracking safaris, boat safaris, and birdwatching tours.',
  },
  {
    id: 'h4',
    name: 'Padma Riverside Retreat',
    destinationId: 'padma',
    destinationName: 'Mawa',
    rating: 4.5,
    reviews: 1289,
    pricePerNight: 4100,
    image:
      'https://images.pexels.com/photos/2736384/pexels-photo-2736384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    amenities: ['River view', 'Boat rental', 'Restaurant', 'Parking'],
    description:
      'A serene riverside retreat near the Padma Bridge, perfect for sunset cruises and fresh hilsa dining.',
  },
  {
    id: 'h5',
    name: 'Heritage Old Town Hotel',
    destinationId: 'dhaka-river',
    destinationName: 'Old Dhaka',
    rating: 4.4,
    reviews: 3056,
    pricePerNight: 2900,
    image:
      'https://images.pexels.com/photos/6466496/pexels-photo-6466496.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    amenities: ['City center', 'Rooftop café', 'Free WiFi', 'Airport shuttle'],
    description:
      'A boutique hotel in the heart of Old Dhaka, steps from Sadarghat riverfront, with a rooftop café overlooking the bustling port.',
  },
  {
    id: 'h6',
    name: 'Coral Island Beach Villas',
    destinationId: 'saint-martin',
    destinationName: "Saint Martin's",
    rating: 4.9,
    reviews: 421,
    pricePerNight: 8800,
    image:
      'https://images.pexels.com/photos/33684437/pexels-photo-33684437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    amenities: ['Beachfront', 'Snorkeling', 'Private balcony', 'Full board'],
    description:
      'Private beachfront villas on Bangladesh\u2019s only coral island, with snorkeling trips, fresh seafood, and bioluminescent night swims.',
    badge: 'Luxury',
  },
];
