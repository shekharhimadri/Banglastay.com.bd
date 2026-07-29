export interface Destination {
  id: string;
  name: string;
  region: string;
  tagline: string;
  image: string;
  properties: number;
  fromPrice: number;
}

export const destinations: Destination[] = [
  {
    id: 'coxs-bazar',
    name: "Cox's Bazar",
    region: 'Chattogram',
    tagline: "World's longest natural sandy beach",
    image:
      'https://images.pexels.com/photos/18884161/pexels-photo-18884161.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    properties: 248,
    fromPrice: 3200,
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans',
    region: 'Khulna',
    tagline: 'Mangrove home of the Bengal tiger',
    image:
      'https://images.pexels.com/photos/17554879/pexels-photo-17554879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    properties: 64,
    fromPrice: 5400,
  },
  {
    id: 'sajek',
    name: 'Sajek Valley',
    region: 'Rangamati',
    tagline: 'Clouds rolling over emerald hills',
    image:
      'https://images.pexels.com/photos/28672619/pexels-photo-28672619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    properties: 38,
    fromPrice: 2800,
  },
  {
    id: 'padma',
    name: 'Padma River',
    region: 'Mawa',
    tagline: 'The mighty heart of the delta',
    image:
      'https://images.pexels.com/photos/38657669/pexels-photo-38657669.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    properties: 52,
    fromPrice: 2200,
  },
  {
    id: 'dhaka-river',
    name: 'Old Dhaka',
    region: 'Dhaka',
    tagline: 'Rivers of boats and centuries of stories',
    image:
      'https://images.pexels.com/photos/37541321/pexels-photo-37541321.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    properties: 412,
    fromPrice: 1800,
  },
  {
    id: 'saint-martin',
    name: "Saint Martin's",
    region: 'Cox\'s Bazar',
    tagline: 'Bangladesh\'s coral island paradise',
    image:
      'https://images.pexels.com/photos/6138765/pexels-photo-6138765.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    properties: 29,
    fromPrice: 4100,
  },
];
