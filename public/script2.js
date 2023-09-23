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

    const userInputText = document.getElementById('addressInput').value;
    const resultDiv = document.getElementById('result');
    const initialContent = document.getElementById('initialContent');
    const tryAgainButton = document.getElementById('tryAgainButton');
    const loadingDiv = document.querySelector('.loading');

    // hide the initial content
    mainHeader.style.display = 'none';
    initialContent.style.display = 'none';
    // Show the loading indicator and 
    loadingDiv.style.display = 'block';
    // Reset the result div opacity to 0 to achieve the fade-in effect on new data
    resultDiv.style.opacity = 0;

    // Send user input to sb102bot server
    try {
        console.log("Sending address to analyze_address endpoint...");
        const response = await fetch('https://sb102bot-gh.vercel.app/api/analyze_address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: userInputText }),
        });

        // Get the response from the server
        const data = await response.json();
        console.log("Got response from analyze_address endpoint.");
        console.log("Response:", data);
        const {
            building_name,
            address,
            latitude,
            longitude,
            county,
            city,
            distance,
            height,
            density,
            walkscore,
        } = data;

        // Reverse geocode the input address
        const inputBuilding = await reverseGeocode(latitude, longitude);
        //const inputLatitude = inputBuilding.geometry.location.lat // no idea if this is a real endpoint or not
        //const inputLongitude = inputBuilding.geometry.location.lng // no idea if this is a real endpoint or not
        const inputStreetNumber = inputBuilding.address_components.find(c => c.types[0] ==='street_number')?.short
        const inputStreetName = inputBuilding.address_components.find(c => c.types[0] === 'route')?.short_name
        const inputCity = inputBuilding.address_components.find(c => c.types[0] === 'locality')?.short_name
        const inputCounty = inputBuilding.address_components.find(c => c.types[0] === 'administrative_area_level_2')?.short_name
        const inputState = inputBuilding.address_components.find(c => c.types[0] === 'administrative_area_level_1')?.short_name
        const inputZip = inputBuilding.address_components.find(c => c.types[0] === 'postal_code')?.short_name
        const inputAddress = `${inputStreetNumber ? inputStreetNumber +'' : ''}${inputStreetName ? inputStreetName + ',': ''}${inputCity ? inputCity + ',': ''}${inputCounty ? inputCounty + ',': ''}${inputState ? inputState +'' : ''}${inputZip ? inputZip : ''}`;
        
        console.log("Corrected input address:", inputAddress);

        // Compose the URLs for Google Maps, Google Street View components
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;        
        

        /*
        // Reverse geocode the tallest building
        const tallestBuilding = await reverseGeocode(latitudeTallest, longitudeTallest);

        //const latitudeTallest = latitude;
        //const longitudeTallest = longitude;

        //  WHY AM I DOING THIS HERE??
        //  SHOULD BE DONE SERVERSIDE

        const tallestStreetNumber = tallestBuilding.address_components.find(c => c.types[0] === 'street_number')?.short_name;
        const tallestStreetName = tallestBuilding.address_components.find(c => c.types[0] === 'route')?.short_name;
        const tallestCity = tallestBuilding.address_components.find(c => c.types[0] === 'locality')?.short_name;
        const tallestState = tallestBuilding.address_components.find(c => c.types[0] === 'administrative_area_level_1')?.short_name;
        const tallestZip = tallestBuilding.address_components.find(c => c.types[0] === 'postal_code')?.short_name;
        const tallestAddress = `${tallestStreetNumber ? tallestStreetNumber + ' ' : ''}${tallestStreetName ? tallestStreetName + ', ' : ''}${tallestCity ? tallestCity + ', ' : ''}${tallestState ? tallestState + ' ' : ''}${tallestZip ? tallestZip : ''}`;
        console.log("Tallest Bldg. Address: ", tallestAddress)

        //   THIS IS INCORRECT !!!
        //   AS IT STANDS, IT'S JUST THE INPUT ADDRESS  !!!
        // Show the input property in Street View / Google Maps
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;        
        // Show tallest building within radius in street view / google maps
        const googleMapsURLTallest = `https://www.google.com/maps?q=${latitudeTallest},${longitudeTallest}`;
        const streetViewURLTallest = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitudeTallest},${longitudeTallest}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;
        */



        //   .------------------------------------------,
        //   |  Construct the entire result content:   /
        //   '----------------------------------------'

        // GOOGLE MAPS & STREET VIEW IMAGES:
        let resultContent = `
            <div class="imageContainer">
                <div class="imageItem">
                    <div class="fade-in-line"><br><u><b><h3>Your Property</h3></b></u></div>
                    <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${streetViewURLInput}" alt="Google Street View of Your Input Address"></a></div>
                    <div class="fade-in-line">See <a href="${googleMapsURLInput}" target="_blank">your site</a> in Google Maps<br><br></div>
                </div>
                <div class="imageItem">
                    <div class="fade-in-line"><br><u><b><h3>Your Property</h3></b></u></div>
                    <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${streetViewURLInput}" alt="Google Street View of Your Input Address"></a></div>
                    <div class="fade-in-line">See <a href="${googleMapsURLInput}" target="_blank">your site</a> in Google Maps<br><br></div>
                </div>
            </div>
        `;
        
        // MAXIMUM MUNICIPAL DENSITY LOOKUP:
        if (!density || density <= 0) {
            resultContent += `
                <div class="fade-in-line"><br>Unfortunately, I don't know the maximum residential density here...</div>
                <div class="fade-in-line">Cheer up, though, because I've just added your property to the list of municipalities to add some day. Check back next week!<br></div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line"><br>The highest residential density allowed in ${inputCity !== '-' ? inputCity : inputCounty} is ${density} units per acre, so a Live Local-qualified development on this property would be able to match that.<br><br><br></div>
            `;
        }


        // Set the content of the result div to our generated content
        resultDiv.innerHTML = resultContent;
        resultDiv.style.opacity = '1';

        // Fade response lines in one by one
        let delayPerLine = 500 // milliseconds
        let delay = 0;
        const fadeInLines = document.querySelectorAll('.fade-in-line');
        fadeInLines.forEach(line => {
            setTimeout(() => {
                line.style.opacity = '1';
            }, delay);
            delay += delayPerLine;
        });
        
        // Hide loading indicator
        loadingDiv.style.display = 'none';
        // Show "Try Again" button
        tryAgainButton.style.display = 'block';

    } catch (error) {
        console.log("Error while sending/receiving data: ", error);
        resultDiv.innerHTML = "Sorry, an error occurred...<br>Try again later  :-(";
        loadingDiv.innerHTML = "Sorry, an error occurred...<br>Try again later  :-(";
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
     // slight delay (100 ms) to ensure styles are applied after load
     setTimeout(() => {
        const input = document.getElementById('addressInput');
        input.style.opacity = 1;
        input.style.transform = 'translateY(0)';
    }, 100);
});