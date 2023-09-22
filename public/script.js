const mainHeader = document.getElementById('mainHeader');

async function reverseGeocode(lat, lng) {
    const API_KEY = 'AIzaSyDJlvljO' + '-' + 'CVH5ax4paudEnj9RoERL6Xhbc';
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
  
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.status === "OK") {
        // Return the formatted address
        //return data.results[0].formatted_address;  //////////////////////////////
        return data.results[0];
      } else {
        console.error("Geocoding error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
      return null;
    }
  }

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
        const response = await fetch('https://sb102bot-gh.vercel.app/api/building_height', {
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

        // Reverse geocode the tallest building
        // 
        //  WHY AM I DOING THIS HERE??
        //  SHOULD BE DONE SERVERSIDE
        //
        const tallestBuilding = await reverseGeocode(latitudeTallest, longitudeTallest);

        const tallestStreetNumber = tallestBuilding.address_components.find(c => c.types[0] === 'street_number')?.short_name;
        const tallestStreetName = tallestBuilding.address_components.find(c => c.types[0] === 'route')?.short_name;
        const tallestCity = tallestBuilding.address_components.find(c => c.types[0] === 'locality')?.short_name;
        const tallestState = tallestBuilding.address_components.find(c => c.types[0] === 'administrative_area_level_1')?.short_name;
        const tallestZip = tallestBuilding.address_components.find(c => c.types[0] === 'postal_code')?.short_name;
        const tallestAddress = `${tallestStreetNumber ? tallestStreetNumber + ' ' : ''}${tallestStreetName ? tallestStreetName + ', ' : ''}${tallestCity ? tallestCity + ', ' : ''}${tallestState ? tallestState + ' ' : ''}${tallestZip ? tallestZip : ''}`;

        //
        //   THIS IS INCORRECT !!!
        //   AS IT STANDS, IT'S JUST THE INPUT ADDRESS  !!!
        //
        // Show the input property in Street View / Google Maps
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;
        
        // Show tallest building within radius in street view / google maps
        const googleMapsURLTallest = `https://www.google.com/maps?q=${latitudeTallest},${longitudeTallest}`;
        const streetViewURLTallest = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitudeTallest},${longitudeTallest}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;

        let resultContent = `
            <div class="imageContainer">
                <div class="imageItem">
                    <div class="fade-in-line"><br><u><b><h3>Your Property</h3></b></u></div>
                    <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${streetViewURLInput}" alt="Google Street View of Your Input Address"></a></div>
                    <div class="fade-in-line">See <a href="${googleMapsURLInput}" target="_blank">your site</a> in Google Maps<br><br></div>
                </div>
                <div class="imageItem">
                    <div class="fade-in-line"><br><u><b><h3>Tallest Nearby</h3></b></u></div>
                    <div class="fade-in-line"><a href="${googleMapsURLTallest}" target="_blank"><img src="${streetViewURLTallest}" alt="Google Street View of Tallest Nearby Building"></a></div>
                    <div class="fade-in-line">See <a href="${googleMapsURLTallest}" target="_blank">tallest building</a> within a mile<br><br></div>
                </div>
            </div>
        `;
    
        console.log("Tallest Bldg. Address: ", tallestAddress)

        if (tallestAddress === "- ") {
            // this may be obsolete
            resultContent += `
            <div class="fade-in-line">By utilizing the <a href="https://cresunshine.com/live-local-storm/" target="_blank">Live Local Act</a>, you can build up to the height of the <a href="${googleMapsURLTallest}" target="_blank">building</a> shown above.</div>
                <div class="fade-in-line"><br>Your <a href="${googleMapsURLInput}" target="_blank">property</a> is only <b>${distance} miles</b> away, so the height limit here would be <b>${height} feet</b>.</div>
            `;
        } else {
            // this may always trigger
            resultContent += `
                <div class="fade-in-line">By utilizing the <a href="https://cresunshine.com/live-local-storm/" target="_blank">Live Local Act</a>, you can build up to the height of the building located at <a href="${googleMapsURLTallest}" target="_blank">${tallestAddress}</a>, shown above.</div>
                <div class="fade-in-line"><br>Your <a href="${googleMapsURLInput}" target="_blank">property</a> is only <b>${distance} miles</b> away, so the height limit here would be <b>${height} feet</b>.</div>
            `;
        }
        
        if (!density || density <= 0) {
            resultContent += `
                <div class="fade-in-line"><br>Unfortunately, I don't know the maximum residential density here...</div>
                <div class="fade-in-line">Cheer up, though, because I've just added your property to the list of municipalities to add some day. Check back next week.<br></div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line"><br>The highest residential density allowed in ${tallestCity !== '-' ? tallestCity : county} is ${density} units per acre, so a Live Local-qualified development at this location would be able to match that.<br><br><br></div>
            `;
        }

        // Set the content of the result div
        resultDiv.innerHTML = resultContent;
        resultDiv.style.opacity = '1';

        // Fade in the lines one by one
        let delay = 0;
        const fadeInLines = document.querySelectorAll('.fade-in-line');
        fadeInLines.forEach(line => {
            setTimeout(() => {
                line.style.opacity = '1';
            }, delay);
            delay += 500; // 0.5 seconds delay for each line
        });

        // Hide loading indicator and show the 'Try Again' button
        loadingDiv.style.display = 'none';
        tryAgainButton.style.display = 'block';

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Sorry, an error occurred...<br>Try again later  :-(";
    }
});

// Handle 'Try Again' button click
document.getElementById('tryAgainButton').addEventListener('click', function() {
    const resultDiv = document.getElementById('result');
    const initialContent = document.getElementById('initialContent');
    const tryAgainButton = document.getElementById('tryAgainButton');
    const mainHeader = document.getElementById('mainHeader');

    // Hide results and "Try Again" button
    resultDiv.style.opacity = '0';
    tryAgainButton.style.display = 'none';

    // Show the initial content and the main header
    initialContent.style.display = 'block';
    mainHeader.style.display = 'block';

    // Scroll to the top of the page
    window.scrollTo(0, 0);
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