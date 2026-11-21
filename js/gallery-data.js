/**
 * AAKAR FILMS - Photography Gallery Data Architecture
 * Compatible with future Admin Dashboard / CMS
 * Each item contains:
 * - id: unique identifier
 * - title: photograph title
 * - category: 'weddings' | 'pre-wedding' | 'engagement' | 'haldi-mehndi' | 'candid' | 'reception'
 * - categoryLabel: user friendly label
 * - image: high-resolution image URL
 * - aspect: 'tall' | 'wide' | 'square'
 * - description: editorial description
 * - featured: boolean
 */
const GALLERY_DATA = [
    // 1. WEDDINGS
    {
        id: "w-01",
        title: "The Royal Vows",
        category: "weddings",
        categoryLabel: "Weddings",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=85&w=1600&auto=format&fit=crop",
        video: "assets/videos/hero-wedding.mp4",
        isVideo: true,
        aspect: "tall",
        description: "Regal Gujarati wedding rituals captured in traditional splendor.",
        featured: true
    },
    {
        id: "w-02",
        title: "Grace of the Bride",
        category: "weddings",
        categoryLabel: "Weddings",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Intricate bridal heirloom jewellery and timeless portraits.",
        featured: true
    },
    {
        id: "w-03",
        title: "Sacred Unions & Varmala",
        category: "weddings",
        categoryLabel: "Weddings",
        image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=85&w=1600&auto=format&fit=crop",
        aspect: "wide",
        description: "Emotional floral exchange under the ornate heritage mandap.",
        featured: true
    },
    {
        id: "w-04",
        title: "Imperial Grandeur",
        category: "weddings",
        categoryLabel: "Weddings",
        image: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=85&w=1600&auto=format&fit=crop",
        aspect: "square",
        description: "Palace courtyards lit by hundred traditional torches.",
        featured: false
    },
    {
        id: "w-05",
        title: "The Royal Mandap Canopy",
        category: "weddings",
        categoryLabel: "Weddings",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Bespoke floral architecture designed for unforgettable vows.",
        featured: false
    },
    {
        id: "w-06",
        title: "The Regal Groom",
        category: "weddings",
        categoryLabel: "Weddings",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1600&auto=format&fit=crop",
        aspect: "square",
        description: "Royal safa and ceremonial wedding portrait.",
        featured: false
    },

    // 2. PRE-WEDDING
    {
        id: "pw-01",
        title: "Udaipur Whispers",
        category: "pre-wedding",
        categoryLabel: "Pre-Wedding",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=85&w=1600&auto=format&fit=crop",
        video: "assets/videos/colorful-wedding-powder.mp4",
        isVideo: true,
        aspect: "wide",
        description: "Twilight romance along the serene waters of Lake Pichola.",
        featured: true
    },
    {
        id: "pw-02",
        title: "Dunes of Jaisalmer",
        category: "pre-wedding",
        categoryLabel: "Pre-Wedding",
        image: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Cinematic golden hour across the golden sand expanses.",
        featured: true
    },
    {
        id: "pw-03",
        title: "Misty Mountain Embrace",
        category: "pre-wedding",
        categoryLabel: "Pre-Wedding",
        image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Intimate destination shoot in the mist of green hilltops.",
        featured: false
    },
    {
        id: "pw-04",
        title: "Solitude by the Shores",
        category: "pre-wedding",
        categoryLabel: "Pre-Wedding",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=1600&auto=format&fit=crop",
        aspect: "wide",
        description: "Natural raw emotions against dramatic coastal backdrops.",
        featured: false
    },

    // 3. ENGAGEMENT
    {
        id: "eg-01",
        title: "The Golden Promise",
        category: "engagement",
        categoryLabel: "Engagement",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=85&w=1600&auto=format&fit=crop",
        aspect: "square",
        description: "Exquisite diamond ring ceremony and family blessings.",
        featured: true
    },
    {
        id: "eg-02",
        title: "Twilight Ring Ceremony",
        category: "engagement",
        categoryLabel: "Engagement",
        image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Exchanging rings in a fairytale twilight garden setting.",
        featured: true
    },
    {
        id: "eg-03",
        title: "Whispered Promises",
        category: "engagement",
        categoryLabel: "Engagement",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Unfiltered smiles following the formal ring exchange.",
        featured: false
    },

    // 4. HALDI & MEHNDI
    {
        id: "hm-01",
        title: "Colors of Euphoria",
        category: "haldi-mehndi",
        categoryLabel: "Haldi & Mehndi",
        image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=85&w=1600&auto=format&fit=crop",
        video: "assets/videos/colorful-wedding-powder.mp4",
        isVideo: true,
        aspect: "tall",
        description: "Intricate bridal henna designs and joyful celebrations.",
        featured: true
    },
    {
        id: "hm-02",
        title: "Sunlight & Marigold",
        category: "haldi-mehndi",
        categoryLabel: "Haldi & Mehndi",
        image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=85&w=1600&auto=format&fit=crop",
        aspect: "square",
        description: "Golden turmeric splashes and pure family laughter.",
        featured: true
    },
    {
        id: "hm-03",
        title: "Henna Symphony",
        category: "haldi-mehndi",
        categoryLabel: "Haldi & Mehndi",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=85&w=1600&auto=format&fit=crop",
        aspect: "wide",
        description: "Traditional motifs painted with meticulous artisan precision.",
        featured: false
    },

    // 5. CANDID MOMENTS
    {
        id: "cd-01",
        title: "Forever In A Gaze",
        category: "candid",
        categoryLabel: "Candid Moments",
        image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "An unscripted moment between couple amidst ceremony grandeur.",
        featured: true
    },
    {
        id: "cd-02",
        title: "Tears of Tenderness",
        category: "candid",
        categoryLabel: "Candid Moments",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=85&w=1600&auto=format&fit=crop",
        aspect: "square",
        description: "Father daughter emotional vidaai glance captured silently.",
        featured: true
    },
    {
        id: "cd-03",
        title: "The Quiet Breath",
        category: "candid",
        categoryLabel: "Candid Moments",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=85&w=1600&auto=format&fit=crop",
        aspect: "wide",
        description: "Stealing a quiet second before step onto the grand stage.",
        featured: false
    },

    // 6. RECEPTION
    {
        id: "rc-01",
        title: "Celestial Stage",
        category: "reception",
        categoryLabel: "Reception",
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=85&w=1600&auto=format&fit=crop",
        aspect: "tall",
        description: "Grand reception evening with royal chandeliers and banquet splendor.",
        featured: true
    },
    {
        id: "rc-02",
        title: "First Dance Under Lights",
        category: "reception",
        categoryLabel: "Reception",
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=85&w=1600&auto=format&fit=crop",
        aspect: "wide",
        description: "Couple takes center stage under thousands of starlit bulbs.",
        featured: true
    },
    {
        id: "rc-03",
        title: "Banquet of Royals",
        category: "reception",
        categoryLabel: "Reception",
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=85&w=1600&auto=format&fit=crop",
        aspect: "square",
        description: "Celebratory champagne toasts and joyful congregation.",
        featured: false
    }
];
