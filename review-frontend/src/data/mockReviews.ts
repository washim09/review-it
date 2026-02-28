// mockReviews.ts - Fallback review data for when API calls fail
import { Review } from '../types/index';

// Modified to match Review interface from types/index.ts
export const mockReviews: Review[] = [
  {
    id: 101,
    title: 'Excellent Smartphone Experience',
    content: 'This smartphone exceeded my expectations in every way.',
    review: 'I haveve been using this phone for the last three months and I m thoroughly impressed. The battery life is exceptional, lasting a full day even with heavy use. The camera system produces stunning photos in all lighting conditions, and the performance is snappy with no lag even when multitasking. The build quality feels premium and durable. Highly recommended for anyone looking for a reliable smartphone.',
    rating: 5,
    entity: 'Galaxy S23 Ultra',
    imageUrl: 'https://picsum.photos/id/96/600/400',
    videoUrl: undefined,
    authorId: 101,
    author: {
      id: 101,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      profileImage: 'https://picsum.photos/id/1010/200/200',
      createdAt: new Date().toISOString()
    },
    tags: ['tech', 'smartphone', 'photography'],
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    title: 'Disappointing Laptop Performance',
    content: 'This laptop does not deliver on its promises.',
    review: 'After using this laptop for a month, I am quite disappointed with its performance. Despite the advertised specs, it struggles with basic multitasking and heats up quickly. The battery life is about half of what was promised, barely lasting 3 hours of regular use. The keyboard feels cheap and the trackpad is inconsistent. On the positive side, the display is decent and the speakers are surprisingly good. I would not recommend this for professionals or anyone needing reliable performance.',
    rating: 2,
    entity: 'TechBook Pro X15',
    imageUrl: 'https://picsum.photos/id/48/600/400',
    videoUrl: undefined,
    authorId: 102,
    author: {
      id: 102,
      name: 'Samantha Miller',
      email: 'samantha@example.com',
      profileImage: 'https://picsum.photos/id/1011/200/200',
      createdAt: new Date().toISOString()
    },
    tags: ['tech', 'laptop', 'productivity'],
    createdAt: new Date().toISOString()
  },
  {
    id: 103,
    title: 'Game-Changing Wireless Earbuds',
    content: 'Best earbuds I have ever owned, with incredible sound quality.',
    review: 'These wireless earbuds have completely changed my audio experience. The sound quality is exceptional with deep bass and crystal clear highs. The noise cancellation works remarkably well, even in noisy environments. Battery life is impressive - I get about 6 hours of continuous use with ANC on, and the case provides 3-4 additional charges. The fit is comfortable for extended wear, and they stay secure during workouts. The companion app offers useful customization options. Absolutely worth the investment!',
    rating: 5,
    entity: 'SoundCore Pro Buds',
    imageUrl: 'https://picsum.photos/id/26/600/400',
    videoUrl: undefined, // Removed problematic video URL
    authorId: 103,
    author: {
      id: 103,
      name: 'David Chen',
      email: 'david@example.com',
      profileImage: 'https://picsum.photos/id/1012/200/200',
      createdAt: new Date().toISOString()
    },
    tags: ['audio', 'wireless', 'tech'],
    createdAt: new Date().toISOString()
  },
  {
    id: 104,
    title: 'Mediocre Coffee Machine',
    content: 'This coffee maker is just average, with some annoying design flaws.',
    review: 'I have been using this coffee machine for about two months now. It makes decent coffee, but has several design flaws that make it frustrating to use daily. The water reservoir is awkwardly positioned, making it difficult to fill without spilling. The machine is also quite loud during operation. On the positive side, it brews quickly and the temperature control is accurate. The programmable timer feature works well for morning coffee. Overall, its just okay - I would not purchase it again at this price point.',
    rating: 3,
    entity: 'BrewMaster 5000',
    imageUrl: 'https://picsum.photos/id/30/600/400',
    videoUrl: undefined,
    authorId: 104,
    author: {
      id: 104,
      name: 'Emily Parker',
      email: 'emily@example.com',
      profileImage: 'https://picsum.photos/id/1013/200/200',
      createdAt: new Date().toISOString()
    },
    tags: ['kitchen', 'coffee', 'appliances'],
    createdAt: new Date().toISOString()
  },
  {
    id: 105,
    title: 'Revolutionary Smart Home System',
    content: 'This smart home hub has transformed how I interact with my home.',
    review: 'Installing this smart home system was one of the best decisions I have made for my home. The setup was surprisingly simple, and the hub connects seamlessly with devices from multiple brands. The voice recognition is accurate and responsive, even from across the room. I particularly love the automation routines - my home now adjusts lighting, temperature, and music based on time of day and my location. The energy monitoring features have helped reduce my electricity bill by 15%. The app interface is intuitive and rarely glitches. Highly recommended for anyone looking to start or expand their smart home setup.',
    rating: 5,
    entity: 'HomeIQ Hub',
    imageUrl: 'https://picsum.photos/id/1/600/400',
    videoUrl: undefined, // Removed problematic YouTube embed
    authorId: 105,
    author: {
      id: 105,
      name: 'Michael Foster',
      email: 'michael@example.com',
      profileImage: 'https://picsum.photos/id/1014/200/200',
      createdAt: new Date().toISOString()
    },
    tags: ['smart home', 'automation', 'tech'],
    createdAt: new Date().toISOString()
  },
  {
    id: 106,
    title: 'Impressive Gaming Monitor',
    content: 'This monitor delivers exceptional performance for gaming and productivity.',
    review: 'After upgrading to this gaming monitor, I can not believe I waited so long. The 1440p resolution at 165Hz is the perfect balance between visual quality and performance. Colors are vibrant and accurate right out of the box, with minimal calibration needed. The HDR implementation is surprisingly good for this price range. I appreciate the ergonomic stand that allows for height, tilt, and pivot adjustments. The built-in USB hub is convenient for peripherals. Gaming feels incredibly smooth with adaptive sync eliminating screen tearing. Even for productivity work, the screen real estate and clarity make a noticeable difference. Highly recommended for both gamers and professionals.',
    rating: 5,
    entity: 'ViewMax XG27',
    imageUrl: 'https://picsum.photos/id/119/600/400',
    videoUrl: undefined,
    authorId: 106,
    author: {
      id: 106,
      name: 'Jordan Wilson',
      email: 'jordan@example.com',
      profileImage: 'https://picsum.photos/id/1015/200/200',
      createdAt: new Date().toISOString()
    },
    tags: ['gaming', 'monitor', 'tech'],
    createdAt: new Date().toISOString()
  }
];

export default mockReviews;
