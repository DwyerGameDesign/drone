// Card Definitions
const cardDefinitions = [
    // Money-earning cards (Path B tends to use these)
    {
        id: 'overtime',
        title: 'Overtime Work',
        cost: -2,
        effects: { soul: -1, connections: -1 },
        description: 'Put in extra hours at work to earn more money, sacrificing your personal time and energy.',
        unlockPassive: 'for_me'
    },
    {
        id: 'freelance',
        title: 'Freelance Gig',
        cost: -3,
        effects: { soul: 0, connections: -1 },
        description: "Take on additional work in your spare time. The money's good, but it leaves less time for friends."
    },
    {
        id: 'corporate_bonus',
        title: 'Corporate Bonus',
        cost: -5,
        effects: { soul: -2, connections: 0 },
        description: 'A substantial bonus comes with strings attached and growing expectations.',
        unlockPassive: 'last_life'
    },

    // Soul-focused cards (Path A tends to use these)
    {
        id: 'guitar',
        title: 'Buy a Guitar',
        cost: 3,
        effects: { soul: 2, connections: 0 },
        description: 'Invest in a creative outlet that speaks to your soul. The instrument becomes an extension of your expression.'
    },
    {
        id: 'art_supplies',
        title: 'Art Supplies',
        cost: 2,
        effects: { soul: 1, connections: 1 },
        description: 'Stock up on materials to fuel your artistic journey. Each color holds infinite possibilities.'
    },
    {
        id: 'meditation',
        title: 'Meditation Course',
        cost: 2,
        effects: { soul: 2, connections: 0 },
        description: 'Learn to find peace within yourself through mindfulness and meditation practices.',
        unlockPassive: 'strange_passenger'
    },

    // Connection-focused cards
    {
        id: 'concert_tickets',
        title: 'Concert Tickets',
        cost: 4,
        effects: { soul: 1, connections: 2 },
        description: 'Share an unforgettable live music experience with friends. The memories will last forever.'
    },
    {
        id: 'dinner_party',
        title: 'Host Dinner Party',
        cost: 3,
        effects: { soul: 0, connections: 2 },
        description: 'Bring people together over good food and conversation. Strengthen bonds through shared moments.'
    },
    {
        id: 'join_club',
        title: 'Join a Club',
        cost: 2,
        effects: { soul: 1, connections: 2 },
        description: 'Become part of a community that shares your interests. Find your tribe.',
        unlockPassive: 'write_along'
    },

    // Mixed effect cards
    {
        id: 'road_trip',
        title: 'Weekend Road Trip',
        cost: 4,
        effects: { soul: 2, connections: 1 },
        track: 'Highway',
        illustration: 'Road Illustration'
    },
    {
        id: 'volunteer',
        title: 'Volunteer Work',
        cost: 0,
        effects: { soul: 1, connections: 1 },
        track: 'Giving Back',
        illustration: 'Helping Hands Illustration'
    },
    {
        id: 'night_class',
        title: 'Night Class',
        cost: 3,
        effects: { soul: 1, connections: 1 },
        track: 'Learning',
        illustration: 'Classroom Illustration'
    }
];

// Passive Effect Definitions
const passiveEffects = {
    strange_passenger: {
        id: 'strange_passenger',
        name: 'Strange Passenger',
        description: '-1 Soul each stop',
        type: 'soul-negative',
        effect: { soul: -1 }
    },
    last_life: {
        id: 'last_life',
        name: 'Last Life',
        description: '-1 Soul each stop',
        type: 'soul-negative',
        effect: { soul: -1 }
    },
    for_me: {
        id: 'for_me',
        name: 'For Me',
        description: '+1 Money each stop',
        type: 'money-positive',
        effect: { money: 1 }
    },
    write_along: {
        id: 'write_along',
        name: 'Write Along The Way',
        description: '+1 Connection each stop',
        type: 'connections-positive',
        effect: { connections: 1 }
    }
};

// Thematic descriptions for cards
const thematicDescriptions = {
    overtime: "Put in extra hours at work to earn more money, sacrificing your personal time and energy.",
    freelance: "Take on additional work in your spare time. The money's good, but it leaves less time for friends.",
    corporate_bonus: "A substantial bonus comes with strings attached and growing expectations.",
    guitar: "Invest in a creative outlet that speaks to your soul. The instrument becomes an extension of your expression.",
    art_supplies: "Stock up on materials to fuel your artistic journey. Each color holds infinite possibilities.",
    meditation: "Learn to find peace within yourself through mindfulness and meditation practices.",
    concert_tickets: "Share an unforgettable live music experience with friends. The memories will last forever.",
    dinner_party: "Bring people together over good food and conversation. Strengthen bonds through shared moments.",
    join_club: "Become part of a community that shares your interests. Find your tribe.",
    road_trip: "Break free from routine with an adventure. The open road calls to your spirit.",
    volunteer: "Give your time to help others. The rewards are intangible but deeply fulfilling.",
    night_class: "Expand your horizons while meeting like-minded people. Growth comes in many forms."
};