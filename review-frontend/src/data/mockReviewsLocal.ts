import { generateLocalAvatar, generatePlaceholderImage } from '../utils/avatarGenerator';

// Mock reviews with local fallback images (no external dependencies)
const mockReviews = [
  {
    id: 1,
    title: 'Amazing Phone - Best Purchase Ever!',
    review: 'I haveve been using this phone for the last three months and I m thoroughly impressed. The battery life is exceptional, lasting a full day even with heavy use. The camera system produces stunning photos in all lighting conditions, and the performance is snappy with no lag even when multitasking. The build quality feels premium and durable. Highly recommended for anyone looking for a reliable smartphone.',
    rating: 5,
    entity: 'Galaxy S23 Ultra',
    imageUrl: generatePlaceholderImage('Galaxy S23 Ultra'),
    videoUrl: undefined,
    authorId: 101,
    author: {
      id: 101,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      profileImage: generateLocalAvatar('Alex Johnson'),
      createdAt: new Date().toISOString()
    },
    tags: ['tech', 'smartphone', 'photography'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: 127,
    comments: 23
  },
  {
    id: 2,
    title: 'Disappointing Performance - Not Worth the Price',
    review: 'After all the hype, I expected much better performance from this laptop. The battery barely lasts 3 hours with normal use, the screen has noticeable backlight bleeding, and the keyboard feels cheap. The laptop also runs quite hot even during basic tasks. Customer support was unhelpful when I raised these concerns. For the premium price, there are much better options available in the market.',
    rating: 2,
    entity: 'TechBook Pro X15',
    imageUrl: generatePlaceholderImage('TechBook Pro X15'),
    videoUrl: undefined,
    authorId: 102,
    author: {
      id: 102,
      name: 'Samantha Miller',
      email: 'samantha@example.com',
      profileImage: generateLocalAvatar('Samantha Miller'),
      createdAt: new Date().toISOString()
    },
    tags: ['tech', 'laptop', 'productivity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: 45,
    comments: 12
  },
  {
    id: 3,
    title: 'Perfect Sound Quality for the Price',
    review: 'These earbuds exceeded all my expectations! The active noise cancellation is on par with models twice the price, and the sound quality is crisp and balanced. The battery life easily gets me through my workday, and the quick charge feature is a lifesaver. The fit is comfortable even after hours of use. The only minor issue is the touch controls can be a bit sensitive, but you get used to it.',
    rating: 5,
    entity: 'SoundCore Pro Buds',
    imageUrl: generatePlaceholderImage('SoundCore Pro Buds'),
    videoUrl: undefined,
    authorId: 103,
    author: {
      id: 103,
      name: 'David Chen',
      email: 'david@example.com',
      profileImage: generateLocalAvatar('David Chen'),
      createdAt: new Date().toISOString()
    },
    tags: ['audio', 'wireless', 'tech'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: 89,
    comments: 34
  },
  {
    id: 4,
    title: 'Decent Coffee Maker with Room for Improvement',
    review: 'This coffee maker does the job, but it is not without its flaws. The coffee temperature is perfect, and it brews quickly. However, the water reservoir is small for the price point, requiring frequent refills. The programmable features are nice but the interface could be more intuitive. The built-in grinder is loud but effective. Overall, its a decent machine but I expected more for the premium price.',
    rating: 3,
    entity: 'BrewMaster 5000',
    imageUrl: generatePlaceholderImage('BrewMaster 5000'),
    videoUrl: undefined,
    authorId: 104,
    author: {
      id: 104,
      name: 'Emily Parker',
      email: 'emily@example.com',
      profileImage: generateLocalAvatar('Emily Parker'),
      createdAt: new Date().toISOString()
    },
    tags: ['kitchen', 'coffee', 'appliances'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: 56,
    comments: 18
  },
  {
    id: 5,
    title: 'Game Changer for Smart Home Automation',
    review: 'This smart home hub has completely transformed how I interact with my home. The setup was surprisingly easy, and it integrates seamlessly with all my existing smart devices. The voice recognition is accurate, and the automation routines save me so much time. The app is well-designed and responsive. Security features give me peace of mind. Worth every penny for anyone serious about home automation.',
    rating: 5,
    entity: 'HomeIQ Hub',
    imageUrl: generatePlaceholderImage('HomeIQ Hub'),
    videoUrl: undefined,
    authorId: 105,
    author: {
      id: 105,
      name: 'Michael Foster',
      email: 'michael@example.com',
      profileImage: generateLocalAvatar('Michael Foster'),
      createdAt: new Date().toISOString()
    },
    tags: ['smart home', 'automation', 'tech'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: 234,
    comments: 67
  },
  {
    id: 6,
    title: 'Best Gaming Monitor Under $500',
    review: 'If youre looking for a high-refresh gaming monitor without breaking the bank, this is it. The 144Hz refresh rate is buttery smooth, and the 1ms response time eliminates any ghosting. Colors are vibrant and accurate right out of the box. The build quality is solid, and the adjustable stand is a nice touch. G-Sync compatibility works flawlessly with my NVIDIA card. Highly recommended for competitive gamers.',
    rating: 5,
    entity: 'ViewMax XG27',
    imageUrl: generatePlaceholderImage('ViewMax XG27'),
    videoUrl: undefined,
    authorId: 106,
    author: {
      id: 106,
      name: 'Jordan Wilson',
      email: 'jordan@example.com',
      profileImage: generateLocalAvatar('Jordan Wilson'),
      createdAt: new Date().toISOString()
    },
    tags: ['gaming', 'monitor', 'tech'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    helpful: 178,
    comments: 45
  }
];

export default mockReviews;
