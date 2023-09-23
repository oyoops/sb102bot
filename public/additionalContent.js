function displayAdditionalContent(data) {
    const resultDiv = document.getElementById('result');
    
    // Your logic to display additional content goes here.
    // Use 'data' to populate the content. For example:
    const { walkscore } = data;
    
    resultDiv.innerHTML += `<p>Additional Data: Walkscore - ${walkscore}</p>`;
}

