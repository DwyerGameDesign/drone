// Card definitions based on resource adjustments
const cardDefinitions = [
    // Cards affecting 1 resource
    { id: 1, title: "Simple Soul Boost", effects: { soul: 1 }, rarity: "common" },
    { id: 2, title: "Simple Soul Drain", effects: { soul: -1 }, rarity: "common" },
    { id: 3, title: "Small Connection", effects: { connections: 1 }, rarity: "common" },
    { id: 4, title: "Lost Connection", effects: { connections: -1 }, rarity: "common" },
    { id: 5, title: "Energy Boost", effects: { energy: 1 }, rarity: "common" },
    { id: 6, title: "Energy Drain", effects: { energy: -1 }, rarity: "common" },
    { id: 7, title: "Small Income", effects: { money: 1 }, rarity: "common" },
    { id: 8, title: "Small Expense", effects: { money: -1 }, rarity: "common" },
    
    // Larger single resource changes
    { id: 9, title: "Major Soul Experience", effects: { soul: 2 }, rarity: "uncommon" },
    { id: 10, title: "Soul-Crushing Event", effects: { soul: -2 }, rarity: "uncommon" },
    { id: 11, title: "New Friendship Group", effects: { connections: 2 }, rarity: "uncommon" },
    { id: 12, title: "Falling Out", effects: { connections: -2 }, rarity: "uncommon" },
    { id: 13, title: "Renewed Vigor", effects: { energy: 2 }, rarity: "uncommon" },
    { id: 14, title: "Exhausting Project", effects: { energy: -2 }, rarity: "uncommon" },
    { id: 15, title: "Unexpected Bonus", effects: { money: 2 }, rarity: "uncommon" },
    { id: 16, title: "Major Expense", effects: { money: -2 }, rarity: "uncommon" },
    
    // Cards affecting 2 resources (positive/negative)
    { id: 17, title: "Soul-Enriching Activity", effects: { soul: 1, energy: -1 }, rarity: "common" },
    { id: 18, title: "Social Gathering", effects: { connections: 1, energy: -1 }, rarity: "common" },
    { id: 19, title: "Overtime Work", effects: { money: 1, energy: -1 }, rarity: "common" },
    { id: 20, title: "Spiritual Retreat", effects: { soul: 1, money: -1 }, rarity: "common" },
    { id: 21, title: "Group Dinner", effects: { connections: 1, money: -1 }, rarity: "common" },
    { id: 22, title: "Self-Care Day", effects: { soul: 1, connections: -1 }, rarity: "common" },
    { id: 23, title: "Workout Session", effects: { energy: 1, connections: -1 }, rarity: "common" },
    { id: 24, title: "Meditation", effects: { soul: 1, money: 0 }, rarity: "common" },
    
    // Cards affecting 2 resources (both positive)
    { id: 25, title: "New Hobby", effects: { soul: 1, energy: 1 }, rarity: "uncommon" },
    { id: 26, title: "Reconnect With Friends", effects: { soul: 1, connections: 1 }, rarity: "uncommon" },
    { id: 27, title: "Job Promotion", effects: { money: 1, soul: 1 }, rarity: "uncommon" },
    { id: 28, title: "Team Building", effects: { connections: 1, energy: 1 }, rarity: "uncommon" },
    { id: 29, title: "Side Hustle", effects: { money: 1, connections: 1 }, rarity: "uncommon" },
    { id: 30, title: "Exercise Class", effects: { energy: 1, soul: 1 }, rarity: "uncommon" },
    
    // Cards affecting 2 resources (both negative)
    { id: 31, title: "Argument", effects: { soul: -1, connections: -1 }, rarity: "common" },
    { id: 32, title: "Missed Deadline", effects: { money: -1, connections: -1 }, rarity: "common" },
    { id: 33, title: "Illness", effects: { energy: -1, money: -1 }, rarity: "common" },
    { id: 34, title: "Burnout", effects: { energy: -1, soul: -1 }, rarity: "common" },
    { id: 35, title: "Lost Job", effects: { money: -2, soul: -1 }, rarity: "uncommon" },
    
    // Cards affecting 3 resources
    { id: 36, title: "Vacation", effects: { soul: 2, energy: 1, money: -2 }, rarity: "rare" },
    { id: 37, title: "New Relationship", effects: { soul: 1, connections: 2, energy: -1 }, rarity: "rare" },
    { id: 38, title: "Career Change", effects: { soul: 1, money: -1, energy: -1 }, rarity: "rare" },
    { id: 39, title: "Family Emergency", effects: { connections: -1, energy: -1, money: -1 }, rarity: "rare" },
    { id: 40, title: "Volunteer Work", effects: { soul: 2, connections: 1, money: -1 }, rarity: "rare" },
    
    // Cards affecting all 4 resources
    { id: 41, title: "Life Transformation", effects: { soul: 2, connections: 1, energy: -1, money: -2 }, rarity: "very rare" },
    { id: 42, title: "Spiritual Awakening", effects: { soul: 3, connections: -1, energy: -1, money: -1 }, rarity: "very rare" },
    { id: 43, title: "Major Life Crisis", effects: { soul: -2, connections: -1, energy: -2, money: -1 }, rarity: "very rare" },
    { id: 44, title: "New Beginning", effects: { soul: 2, connections: 2, energy: 1, money: -3 }, rarity: "very rare" },
    
    // Album-themed cards (from Drone Man concept)
    { id: 45, title: "Write Along The Way", effects: { soul: 2, energy: -1 }, rarity: "uncommon", albumTrack: "Write Along The Way" },
    { id: 46, title: "Last Life", effects: { connections: -2, energy: -1 }, rarity: "uncommon", albumTrack: "Last Life" },
    { id: 47, title: "Strange Passenger", effects: { connections: 1, soul: -1 }, rarity: "uncommon", albumTrack: "Strange Passenger" },
    { id: 48, title: "For Me", effects: { money: -1, soul: -1 }, rarity: "uncommon", albumTrack: "For Me" },
    { id: 49, title: "Bioavailable", effects: { energy: -2, soul: -1 }, rarity: "rare", albumTrack: "Bioavailable" },
    { id: 50, title: "Life Between Life", effects: { soul: 2, connections: -1 }, rarity: "rare", albumTrack: "Life Between Life" },
    { id: 51, title: "Squares", effects: { soul: -1, connections: -1, energy: -1 }, rarity: "rare", albumTrack: "Squares" },
    { id: 52, title: "Star Light", effects: { energy: -2, soul: 1 }, rarity: "uncommon", albumTrack: "Star Light" },
    { id: 53, title: "Sick of Home", effects: { soul: 1, connections: -1, energy: 1 }, rarity: "rare", albumTrack: "Sick of Home" },
    { id: 54, title: "Contact High", effects: { soul: 2, connections: 1, energy: -1, money: -1 }, rarity: "very rare", albumTrack: "Contact High" },
    { id: 55, title: "The Feel", effects: { soul: 3, energy: -1, money: -1 }, rarity: "rare", albumTrack: "The Feel" }
];

// Thematic descriptions for later development
const thematicDescriptions = {
    45: "Starting to live your dream, excited about doing it your way. You're moving forward undeliberately, jumping onto the train of life.",
    46: "Wasting away with surface connections and people you never meet in person. Time slips away on activities that don't fulfill you.",
    47: "You meet someone unexpectedly. You know something's off, but you proceed anyway. Danger ahead and your soul knows it.",
    48: "Greed and materialism take hold. You're trying to keep up with friends and colleagues, acquiring stuff to satisfy an overactive ego.",
    49: "You're addicted to adrenaline and the constant fight-or-flight rush. The anxiety is compounding but you can't stop.",
    50: "Your soul is beginning to stir, asking 'Why? What's it all for?' You're searching for life between life.",
    51: "Work from home has changed everything. You're in your box looking at your square computer screen, feeling the years wear on.",
    52: "Insomnia takes hold. As your soul awakens, so do latent fears and anxieties. The outline of that star-shaped chandelier is all you see night after night.",
    53: "You have a peaceful revelation. You're sick of yourself and your life, so you commit to change.",
    54: "Years of stagnation and self-inflicted beatdowns have led to this moment of self-discovery. You're nearing the last outbound stop.",
    55: "You've exited the train and left the station. Is this freedom? Is this life? Whatever it is, you like the feel."
};

// You can expand this with more detailed thematic descriptions and variations
// as the game develops