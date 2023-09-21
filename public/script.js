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
        
        const latitudeTallest = latitude;
        const longitudeTallest = longitude;
        
        
        //
        //   !!!    THIS IS INCORRECT... AS IT STANDS, IT'S JUST THE INPUT ADDRESS  !!!
        //
        // Show the input property in street view / google maps
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;
        
        // Show tallest building within radius in street view / google maps
        const googleMapsURLTallest = `https://www.google.com/maps?q=${latitudeTallest},${longitudeTallest}`;
        const streetViewURLTallest = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitudeTallest},${longitudeTallest}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;

        
        let resultContent = `
        <div class="image-container">
            <div class="image-item">
                <div class="fade-in-line"><br><u><b>Your Property</b></u></div>
                <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${streetViewURLInput}" alt="Google Street View of Your Input Address"></a></div>
                <div class="fade-in-line">See your property in <a href="${googleMapsURLInput}" target="_blank">Google Maps</a><br><br></div>
            </div>
            <div class="image-item">
                <div class="fade-in-line"><br><u><b>Tallest Building Nearby</b></u></div>
                <div class="fade-in-line"><a href="${googleMapsURLTallest}" target="_blank"><img src="${streetViewURLTallest}" alt="Google Street View of Tallest Nearby Building"></a></div>
                <div class="fade-in-line">See the tallest nearby building in <a href="${googleMapsURLTallest}" target="_blank">Google Maps</a><br><br></div>
            </div>
        </div>
        `;
        
        console.log("Tallest Bldg. Address: ", address)

        if (address === "- ") {
            resultContent += `
                <div class="fade-in-line">By utilizing the Live Local Act, you could build as high as <b>${height} feet</b> here,</div>
                <div class="fade-in-line">which is the height of <a href="${googleMapsURLTallest}" target="_blank">this building</a>, pictured above.</div>
                <div class="fade-in-line"><br>Since <a href="${googleMapsURLInput}" target="_blank">your property</a> is only <b>${distance} miles</b> away from it, ${height}' becomes your effective height limit.</div>
                <div class="fade-in-line"><br><br><br><u>debug:</u><br> city = ${city} ... county = ${county} ... density = ${density}<br><br><br><br>Made by <a href="https://twitter.com/oyoops">@oyoops</a></div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line">By utilizing the Live Local Act, you can build as high as <b>${height} feet</b> here,</div>
                <div class="fade-in-line">which is the height of the building at <a href="${googleMapsURLTallest}" target="_blank">${address}</a>, pictured above.</div>
                <div class="fade-in-line"><br>Since <a href="${googleMapsURLInput}" target="_blank">your property</a> is only <b>${distance} miles</b> away from it, ${height}' becomes your effective height limit.</div>
                <div class="fade-in-line"><br><br><br><u>debug:</u><br> city = ${city} ... county = ${county} ... density = ${density}<br><br><br><br>Made by <a href="https://twitter.com/oyoops">@oyoops</a></div>
            `;
        }
        
        if (!density || density <= 0) {
            resultContent += `
                <div class="fade-in-line"><br>Unfortunately, I don't know the maximum residential density here.</div>
                <div class="fade-in-line">Worry not, though, because I just added this municipality to the list of supported cities & counties.</div>
                <div class="fade-in-line"><br>Check back next week!</div>
                <div class="fade-in-line"><br><br><br><u>debug info:</u><br> city = ${city} ... county = ${county} ... density = ${density}<br><br><br><br>Made by <a href="https://twitter.com/oyoops">@oyoops</a></div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line">The highest residential density allowed in ${city !== '-' ? city : county} is ${density} units per acre, so a Live Local-qualified development at this location would be able to match that.<br><br><br><br></div>
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

        // Hide loading indicator and show the 'Try Again' button
        loadingDiv.style.display = 'none';
        tryAgainButton.style.display = 'block';

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Sorry, an error occurred. Try again later, maybe.";
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


// Handle 'Try Again' button click
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


// Fade in the input box upon page load
//     (adds a class to the input after the page loads to trigger the transition)
window.addEventListener('load', () => {
    setTimeout(() => {
        const input = document.getElementById('addressInput');
        input.style.opacity = 1;
        input.style.transform = 'translateY(0)';
    }, 100); // slight delay to ensure styles are applied after load
});