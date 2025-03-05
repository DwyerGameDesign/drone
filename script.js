document.addEventListener('DOMContentLoaded', async () => {
    const button = document.getElementById('clickMe');
    const heading = document.querySelector('h1');
    const container = document.querySelector('.container');
    
    // Load events from JSON file
    try {
        const response = await fetch('events.json');
        const data = await response.json();
        
        // Display events
        const eventsList = document.createElement('div');
        eventsList.className = 'events-list';
        
        data.events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-card';
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p>Date: ${event.date}</p>
                <p>${event.description}</p>
                <p>Category: ${event.category}</p>
                <p>Location: ${event.location}</p>
            `;
            eventsList.appendChild(eventElement);
        });
        
        container.appendChild(eventsList);
    } catch (error) {
        console.error('Error loading events:', error);
    }
    
    let clickCount = 0;
    const darkMessages = [
        "Your soul slowly fades away...",
        "The corporate ladder looks tempting...",
        "Your cubicle is your new home...",
        "The coffee machine is your only friend...",
        "Your dreams of escape fade...",
        "The fluorescent lights burn your eyes...",
        "Your life becomes a series of meetings...",
        "The printer is always broken...",
        "Your inbox is never empty...",
        "The office plants are plastic..."
    ];
    
    button.addEventListener('click', () => {
        clickCount++;
        heading.textContent = darkMessages[clickCount % darkMessages.length];
        heading.style.color = '#ffde00';
        heading.style.textShadow = '0 0 10px rgba(255, 222, 0, 0.5)';
        
        // Add a subtle shake animation
        container.style.animation = 'shake 0.5s';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
        
        // Change button text based on clicks
        if (clickCount === 1) {
            button.textContent = "Accept Your Fate";
        } else if (clickCount === 2) {
            button.textContent = "Embrace the Void";
        } else if (clickCount === 3) {
            button.textContent = "Become One With the Machine";
        }
    });
}); 