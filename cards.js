// Card definitions for the simplified two-resource system
const cardDefinitions = [
    // Money-earning cards (negative or neutral resource effects)
    { id: 1, title: "Overtime Work", effects: { soul: -1 }, cost: -2, rarity: "common" },
    { id: 2, title: "Side Gig", effects: { soul: -1 }, cost: -1, rarity: "common" },
    { id: 3, title: "Paycheck", effects: {}, cost: -3, rarity: "common" },
    { id: 4, title: "Corporate Job", effects: { soul: -2 }, cost: -4, rarity: "uncommon" },
    { id: 5, title: "Cancel Plans", effects: { connections: -1 }, cost: -1, rarity: "common" },
    { id: 6, title: "Work Weekend", effects: { connections: -1, soul: -1 }, cost: -3, rarity: "uncommon" },
    { id: 7, title: "Networking Event", effects: { connections: 1, soul: -1 }, cost: -1, rarity: "common" },
    { id: 8, title: "Business Trip", effects: { connections: -2 }, cost: -4, rarity: "uncommon" },
    { id: 9, title: "Investment Pays Off", effects: {}, cost: -5, rarity: "rare" },
    
    // Soul-focused cards (positive soul effects, cost money)
    { id: 10, title: "Meditation", effects: { soul: 1 }, cost: 0, rarity: "common" },
    { id: 11, title: "Journal Writing", effects: { soul: 1 }, cost: 0, rarity: "common" },
    { id: 12, title: "Art Class", effects: { soul: 2 }, cost: 1, rarity: "common" },
    { id: 13, title: "Nature Hike", effects: { soul: 2 }, cost: 1, rarity: "common" },
    { id: 14, title: "Concert Tickets", effects: { soul: 3 }, cost: 2, rarity: "uncommon" },
    { id: 15, title: "Buy a Guitar", effects: { soul: 3 }, cost: 3, rarity: "uncommon" },
    { id: 16, title: "Spiritual Retreat", effects: { soul: 4, connections: -1 }, cost: 4, rarity: "rare" },
    
    // Connection-focused cards (positive connection effects, cost money)
    { id: 17, title: "Quick Text", effects: { connections: 1 }, cost: 0, rarity: "common" },
    { id: 18, title: "Coffee Date", effects: { connections: 1 }, cost: 1, rarity: "common" },
    { id: 19, title: "Host Dinner Party", effects: { connections: 2 }, cost: 2, rarity: "common" },
    { id: 20, title: "Weekend Trip", effects: { connections: 3 }, cost: 3, rarity: "uncommon" },
    { id: 21, title: "Reunion Event", effects: { connections: 3, soul: 1 }, cost: 3, rarity: "uncommon" },
    { id: 22, title: "Build Community", effects: { connections: 4 }, cost: 4, rarity: "rare" },
    
    // Mixed effect cards
    { id: 23, title: "Night Out", effects: { connections: 2, soul: 1 }, cost: 2, rarity: "uncommon" },
    { id: 24, title: "Family Time", effects: { connections: 2, soul: 1 }, cost: 1, rarity: "common" },
    { id: 25, title: "Skip Social Event", effects: { connections: -1, soul: 1 }, cost: 0, rarity: "common" },
    { id: 26, title: "Solitary Walk", effects: { soul: 1, connections: -1 }, cost: 0, rarity: "common" },
    
    // Free cards with mixed effects
    { id: 27, title: "Deep Conversation", effects: { soul: 1, connections: 1 }, cost: 0, rarity: "uncommon" },
    { id: 28, title: "Social Media Binge", effects: { soul: -1, connections: -1 }, cost: 0, rarity: "common" },
    { id: 29, title: "Arguments", effects: { connections: -2 }, cost: 0, rarity: "common" },
    { id: 30, title: "Volunteer Work", effects: { soul: 1, connections: 1 }, cost: 0, rarity: "uncommon" },
    
    // Album-themed cards
    { id: 31, title: "Write Along The Way", effects: { soul: 2 }, cost: 0, rarity: "uncommon", albumTrack: "Write Along The Way" },
    { id: 32, title: "Last Life", effects: { connections: -2 }, cost: -1, rarity: "uncommon", albumTrack: "Last Life" },
    { id: 33, title: "Strange Passenger", effects: { connections: 1, soul: -1 }, cost: 0, rarity: "uncommon", albumTrack: "Strange Passenger" },
    { id: 34, title: "For Me", effects: { soul: -1 }, cost: -2, rarity: "uncommon", albumTrack: "For Me" },
    { id: 35, title: "Bioavailable", effects: { soul: -2 }, cost: -2, rarity: "rare", albumTrack: "Bioavailable" },
    { id: 36, title: "Life Between Life", effects: { soul: 2, connections: -1 }, cost: 2, rarity: "rare", albumTrack: "Life Between Life" },
    { id: 37, title: "Squares", effects: { soul: -1, connections: -1 }, cost: -3, rarity: "rare", albumTrack: "Squares" },
    { id: 38, title: "Star Light", effects: { soul: 1 }, cost: 0, rarity: "uncommon", albumTrack: "Star Light" },
    { id: 39, title: "Sick of Home", effects: { soul: 1, connections: -1 }, cost: 1, rarity: "rare", albumTrack: "Sick of Home" },
    { id: 40, title: "Contact High", effects: { soul: 2, connections: 1 }, cost: 2, rarity: "very rare", albumTrack: "Contact High" },
    { id: 41, title: "The Feel", effects: { soul: 3 }, cost: 3, rarity: "rare", albumTrack: "The Feel" }
];

// Thematic descriptions for later development
const thematicDescriptions = {
    31: "Starting to live your dream, excited about doing it your way. You're moving forward undeliberately, jumping onto the train of life.",
    32: "Wasting away with surface connections and people you never meet in person. Time slips away on activities that don't fulfill you.",
    33: "You meet someone unexpectedly. You know something's off, but you proceed anyway. Danger ahead and your soul knows it.",
    34: "Greed and materialism take hold. You're trying to keep up with friends and colleagues, acquiring stuff to satisfy an overactive ego.",
    35: "You're addicted to adrenaline and the constant fight-or-flight rush. The anxiety is compounding but you can't stop.",
    36: "Your soul is beginning to stir, asking 'Why? What's it all for?' You're searching for life between life.",
    37: "Work from home has changed everything. You're in your box looking at your square computer screen, feeling the years wear on.",
    38: "Insomnia takes hold. As your soul awakens, so do latent fears and anxieties. The outline of that star-shaped chandelier is all you see night after night.",
    39: "You have a peaceful revelation. You're sick of yourself and your life, so you commit to change.",
    40: "Years of stagnation and self-inflicted beatdowns have led to this moment of self-discovery. You're nearing the last outbound stop.",
    41: "You've exited the train and left the station. Is this freedom? Is this life? Whatever it is, you like the feel."
};