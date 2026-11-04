require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const unsplashImages = require('./unsplashImages');

const prisma = new PrismaClient();

const apartments = [
  {
    title: 'Luxury Beachfront Villa',
    description:
      'Stunning oceanfront property with breathtaking views, private pool, and direct beach access. Perfect for a romantic getaway or family vacation. Wake up to the sound of waves and enjoy spectacular sunsets from your private terrace.',
    location: 'Miami, Florida',
    pricePerNight: 140000,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    amenities: ['WiFi', 'Pool', 'Air Conditioning', 'Kitchen', 'Parking', 'Beach Access', 'BBQ', 'Washer/Dryer'],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
  },
  {
    title: 'Modern Downtown Loft',
    description:
      'Chic industrial-style loft in the heart of downtown. Walking distance to restaurants, galleries, and nightlife. Floor-to-ceiling windows offer stunning city views. Fully equipped kitchen and high-speed WiFi included.',
    location: 'New York, New York',
    pricePerNight: 95000,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Gym Access', 'Doorman', 'City Views'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
  },
  {
    title: 'Cozy Mountain Cabin',
    description:
      'Rustic yet comfortable cabin nestled in the mountains. Enjoy hiking trails, fresh air, and stunning mountain vistas right from your doorstep. Features a cozy fireplace, hot tub, and fully equipped kitchen.',
    location: 'Aspen, Colorado',
    pricePerNight: 145000,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Parking', 'Hot Tub', 'Mountain Views', 'Hiking Trails'],
    images: [
      'https://images.unsplash.com/photo-1501024878088-86ce21e6a7ab?w=800&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
    ],
  },
  {
    title: 'Charming Parisian Studio',
    description:
      'Elegant studio apartment in the City of Light. Minutes from the Eiffel Tower, the Louvre, and the finest French dining. Authentically decorated with Haussmannian architecture and modern comforts.',
    location: 'Paris, France',
    pricePerNight: 80000,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchenette', 'City Views', 'Metro Access'],
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
    ],
  },
  {
    title: 'Tropical Jungle Retreat',
    description:
      'Escape to this stunning eco-friendly villa surrounded by lush tropical rainforest. Wildlife sightings guaranteed! Features an infinity pool overlooking the jungle canopy, outdoor shower, and daily breakfast included.',
    location: 'Bali, Indonesia',
    pricePerNight: 65000,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Outdoor Shower', 'Infinity Pool', 'Breakfast Included', 'Nature Tours', 'Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
  },
  {
    title: 'Historic Tuscany Farmhouse',
    description:
      'Beautifully restored 18th-century farmhouse surrounded by vineyards and olive groves. Experience authentic Italian rural life with a private pool, wine cellar stocked with local wines, and panoramic countryside views.',
    location: 'Tuscany, Italy',
    pricePerNight: 180000,
    bedrooms: 5,
    bathrooms: 3,
    maxGuests: 10,
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Wine Cellar', 'Garden', 'Parking', 'BBQ', 'Fireplace'],
    images: [
      'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80',
    ],
  },
  {
    title: 'Contemporary Tokyo Apartment',
    description:
      "Sleek, modern apartment in one of Tokyo's most vibrant neighborhoods. Impeccably designed with smart home technology and all modern conveniences. Walking distance to excellent dining, shopping, and metro.",
    location: 'Tokyo, Japan',
    pricePerNight: 155000,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Smart TV', 'Washer', 'Metro Access', 'City Views'],
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    ],
  },
  {
    title: 'Lakeside Swiss Chalet',
    description:
      'Picture-perfect Swiss chalet with panoramic lake and Alpine views. Ski slopes in winter, hiking and watersports in summer. Features a private sauna, stone fireplace, and outdoor terrace with breathtaking views.',
    location: 'Interlaken, Switzerland',
    pricePerNight: 95000,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Sauna', 'Parking', 'Lake Views', 'Ski Storage', 'Terrace'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    ],
  },
];

const markets = [
  { city: 'Lisbon, Portugal', areas: ['Alfama', 'Baixa', 'Graça', 'Príncipe Real'] },
  { city: 'London, United Kingdom', areas: ['Shoreditch', 'Notting Hill', 'South Bank', 'Marylebone'] },
  { city: 'Barcelona, Spain', areas: ['El Born', 'Eixample', 'Gràcia', 'Barceloneta'] },
  { city: 'Copenhagen, Denmark', areas: ['Indre By', 'Nørrebro', 'Vesterbro', 'Christianshavn'] },
  { city: 'Kyoto, Japan', areas: ['Gion', 'Higashiyama', 'Nishijin', 'Arashiyama'] },
  { city: 'Marrakech, Morocco', areas: ['Medina', 'Gueliz', 'Kasbah', 'Hivernage'] },
  { city: 'Cape Town, South Africa', areas: ['Gardens', 'Sea Point', 'De Waterkant', 'Woodstock'] },
  { city: 'Vancouver, Canada', areas: ['Gastown', 'Kitsilano', 'West End', 'Mount Pleasant'] },
  { city: 'Mexico City, Mexico', areas: ['Roma Norte', 'Condesa', 'Polanco', 'Coyoacán'] },
  { city: 'Sydney, Australia', areas: ['Surry Hills', 'Manly', 'Newtown', 'Darlinghurst'] },
  { city: 'Athens, Greece', areas: ['Plaka', 'Koukaki', 'Pangrati', 'Monastiraki'] },
  { city: 'Prague, Czechia', areas: ['Malá Strana', 'Vinohrady', 'Old Town', 'Karlín'] },
  { city: 'Reykjavík, Iceland', areas: ['Old Harbour', 'Miðborg', 'Vesturbær', 'Laugardalur'] },
];

const propertyStyles = [
  {
    title: 'Sunlit City Studio', bedrooms: 1, bathrooms: 1, maxGuests: 2, basePrice: 65000,
    description: 'A bright, carefully arranged studio with a comfortable queen bed, a practical kitchenette and a quiet place to unwind after a day out.',
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Heating'],
  },
  {
    title: 'Courtyard Apartment', bedrooms: 2, bathrooms: 1, maxGuests: 4, basePrice: 145000,
    description: 'A calm two-bedroom apartment with a private balcony, a dining space for four and an equipped kitchen for easy meals at home.',
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Balcony', 'Washer'],
  },
  {
    title: 'Open-plan Design Loft', bedrooms: 1, bathrooms: 1, maxGuests: 2, basePrice: 85000,
    description: 'An open-plan loft with tall windows, a dedicated work table and simple, comfortable furnishings close to local cafés and transit.',
    amenities: ['WiFi', 'Kitchen', 'Workspace', 'Air Conditioning'],
  },
  {
    title: 'Family Corner Residence', bedrooms: 3, bathrooms: 2, maxGuests: 6, basePrice: 195000,
    description: 'A spacious three-bedroom home with a full kitchen, a shared living room and room for everyone to settle in between outings.',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Washer', 'Air Conditioning'],
  },
];

const expandedApartments = markets.flatMap((market, marketIndex) =>
  propertyStyles.map((style, styleIndex) => {
    const { basePrice, ...listing } = style;
    return {
      ...listing,
      title: `${style.title} · ${market.areas[styleIndex]}`,
      location: `${market.areas[styleIndex]}, ${market.city}`,
      description: `${style.description} Set in ${market.areas[styleIndex]}, ${market.city}, it is a convenient base for exploring the neighbourhood and getting around the city.`,
      pricePerNight: (() => {
        const price = basePrice + marketIndex * 1000;
        return price > 190000 ? price - 100000 : price;
      })(),
    };
  })
);

const catalog = [...apartments, ...expandedApartments].map((apartment, index) => ({
  ...apartment,
  images: [0, 1, 2].map((offset) => unsplashImages[(index + offset) % unsplashImages.length]),
}));

async function main() {
  console.log('🌱 Seeding database...\n');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@apartmentbooking.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@apartmentbooking.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  const userPassword = await bcrypt.hash('user123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log(`✅ User:  ${testUser.email}`);

  console.log(`\nCreating ${catalog.length} apartments with Unsplash photos...`);
  for (const apt of catalog) {
    const existing = await prisma.apartment.findFirst({ where: { title: apt.title, location: apt.location } });
    const created = existing
      ? await prisma.apartment.update({ where: { id: existing.id }, data: apt })
      : await prisma.apartment.create({ data: apt });
    console.log(`  ✅ ${created.title}`);
  }

  console.log('\nSeeding complete.');
  console.log('\n📋 Demo credentials:');
  console.log('  Admin → admin@apartmentbooking.com / admin123');
  console.log('  User  → user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
