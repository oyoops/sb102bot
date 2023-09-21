const mainHeader = document.getElementById('mainHeader');

document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const inputAddress = document.getElementById('addressInput').value;
    const resultDiv = document.getElementById('result');
    const initialContent = document.getElementById('initialContent');
    const tryAgainButton = document.getElementById('tryAgainButton');
    const loadingDiv = document.querySelector('.loading');

    // Show the loading indicator and hide the initial content
    loadingDiv.style.display = 'block';
    mainHeader.style.display = 'none';
    initialContent.style.display = 'none';

    // Reset the result div opacity to 0 to achieve the fade-in effect on new data
    resultDiv.style.opacity = 0;

    // Reset the result div content to the loading indicator
    try {
        const response = await fetch('https://sb102bot.vercel.app/api/building_height', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: inputAddress }),
        });

        const data = await response.json();
        console.log(data);
        
        const {
            height,
            latitude,
            longitude,
            city,
            county,
            address,
            density,
            distance,
            building_name
        } = data;
        
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;
        
        // Assuming the tallest building's latitude and longitude are available
        // (you'll need to replace these placeholder variables with the actual values from your data)
        const latitudeTallest = latitude;
        const longitudeTallest = longitude;
        const googleMapsURLTallest = `https://www.google.com/maps?q=${latitudeTallest},${longitudeTallest}`;
        const streetViewURLTallest = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitudeTallest},${longitudeTallest}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;
        
        let resultContent = `
            <div class="fade-in-line"><u><b>Your Input Address</b></u></div>
            <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${streetViewURLInput}" alt="Google Street View of Your Input Address"></a></div>
            <div class="fade-in-line">See it on <a href="${googleMapsURLInput}" target="_blank">Google Maps</a></div>
            <br>
            <div class="fade-in-line"><u><b>Tallest Building Nearby</b></u></div>
        `;
        
        if (address === "- ") {
            resultContent += `
                <div class="fade-in-line">By utilizing the Live Local Act here, you could build as high as <b>${height} feet</b>,</div>
                <div class="fade-in-line">which is as tall as this building at ${latitude}, ${longitude}:</div>
                <div class="fade-in-line"><a href="${googleMapsURLTallest}" target="_blank"><img src="${streetViewURLTallest}" alt="Google Street View of ${latitude},${longitude}"></a></div>
                <div class="fade-in-line">See it on <a href="${googleMapsURLTallest}" target="_blank">Google Maps</a></div>
                <div class="fade-in-line">Your site is ${distance} miles away, so it qualifies.</div>
                <div class="fade-in-line">${density} | ${city} | ${county}</div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line">By utilizing the Live Local Act here, you could build as high as <b>${height} feet</b>,</div>
                <div class="fade-in-line">which is as tall as this building at ${address}:</div>
                <div class="fade-in-line"><a href="${googleMapsURLTallest}" target="_blank"><img src="${streetViewURLTallest}" alt="Google Street View of ${address}"></a></div>
                <div class="fade-in-line">Find it on <a href="${googleMapsURLTallest}" target="_blank">Google Maps</a></div>
                <div class="fade-in-line">Since your property is only ${distance} miles away, you're eligible to build up to this limit.</div>
            `;
        }
        
        if (!density || density <= 0) {
            resultContent += `
                <div class="fade-in-line"><br>Unfortunately, I don't know the maximum residential density here.</div>
                <div class="fade-in-line">Worry not, though, because I just added this municipality to the list of supported cities & counties.</div>
                <div class="fade-in-line"><br>Check back next week!</div>
                <div class="fade-in-line"><br><br><br><br><u>debug info:</u><br> city = ${city} ... county = ${county} ... density = ${density}<br><br><br><br>Made by <a href="https://twitter.com/oyoops">@oyoops</a></div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line">The highest residential density in ${city !== '-' ? city : county} is ${density} units per acre, so a Live Local-qualified development at this location would be able to match that.</div>
            `;
        }
    
        // Set the content of the result div
        resultDiv.innerHTML = resultContent;
        resultDiv.style.opacity = '1';

        let delay = 0;
        const fadeInLines = document.querySelectorAll('.fade-in-line');
        fadeInLines.forEach(line => {
            setTimeout(() => {
                line.style.opacity = '1';
            }, delay);
            delay += 1000; // 1.0 seconds delay for each line
        });

        // Hide loading indicator and show 'Try Again' button
        loadingDiv.style.display = 'none';
        tryAgainButton.style.display = 'block';

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Sorry, an error occurred. Please try again later.";
    }
});



async function reverseGeocode(lat, lng) {
    const API_KEY = 'AIzaSyDJlvljO' + '-' + 'CVH5ax4paudEnj9RoERL6Xhbc';
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (data.status === "OK") {
            // Return the formatted address
            return data.results[0].formatted_address;
        } else {
            console.error("Geocoding error:", data.status);
            return null;
        }
    } catch (error) {
        console.error("Failed to reverse geocode:", error);
        return null;
    }
}


// Handle "Try Again" button click
document.getElementById('tryAgainButton').addEventListener('click', function() {
    const resultDiv = document.getElementById('result');
    const initialContent = document.getElementById('initialContent');
    const tryAgainButton = document.getElementById('tryAgainButton');

    // Hide results and "Try Again" button
    resultDiv.style.opacity = '0';
    tryAgainButton.style.display = 'none';

    // Show the initial content
    initialContent.style.display = 'block';
});


// Fade in the input box on page load
//     (add a class to the input after the page loads to trigger the transition)
window.addEventListener('load', () => {
    setTimeout(() => {
        const input = document.getElementById('addressInput');
        input.style.opacity = 1;
        input.style.transform = 'translateY(0)';
    }, 100); // slight delay to ensure styles are applied after load
});