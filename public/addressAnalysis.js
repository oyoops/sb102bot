
async function fetchAndDisplay() {
    const userInputText = document.getElementById('addressInput').value;
    const response = await fetch('https://sb102bot-gh.vercel.app/api/analyze_address', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: userInputText }),
    });
    const data = await response.json();
    displayInitialContent(data);
    displayAdditionalContent(data);  // Function from additionalContent.js
}

function displayInitialContent(data) {
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.querySelector('.loading');
    const tryAgainButton = document.getElementById('tryAgainButton');
    
    // Your existing logic to display the initial content goes here.
    // Use 'data' to populate the content. For example:
    const { address, city, county, density, walkscore, latitude, longitude } = data;
    
    // Existing code for displaying the initial content would go here...
    // In this example, I am just adding a placeholder for the content.
    resultDiv.innerHTML += `<p>Initial Data: Address - ${address}, City - ${city}, Density - ${density}</p>`;
    
    loadingDiv.style.display = 'none';
    tryAgainButton.style.display = 'block';
}

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    fetchAndDisplay();
});
