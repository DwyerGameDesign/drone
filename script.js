document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('clickMe');
    const heading = document.querySelector('h1');
    
    button.addEventListener('click', () => {
        heading.textContent = 'Hello World! (Clicked!)';
        heading.style.color = '#e81a1a';
        
        setTimeout(() => {
            heading.textContent = 'Hello World!';
            heading.style.color = '#1a73e8';
        }, 1000);
    });
}); 