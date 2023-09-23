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

        // Get response from the endpoint
        const data = await response.json();
        console.log("Response from analyze_address: \n", data);
        
        // Extract the data from the response
        //   <----- WILL THIS BREAK IF NOT PERFECTLY MAPPED OUT?  **********************************
        result = {
            address,
            city,
            county,
            density,
            walkscore,
            latitude,
            longitude,
            location
        } = data;

        // ---

        // Reverse-geocode the geocoded location in order to get one with a clean, complete address (seems redundant, but it works) 
        const inputLocationClean = await reverseGeocode(latitude, longitude);
        // Use this slightly-better Location object to get the details we need
        const inputAddressClean = inputLocationClean.formatted_address;
        const inputStreetNumber = inputLocationClean.address_components.find(c => c.types[0] ==='street_number')?.short
        const inputStreetName = inputLocationClean.address_components.find(c => c.types[0] === 'route')?.short_name
        const inputCity = inputLocationClean.address_components.find(c => c.types[0] === 'locality')?.short_name
        const inputCounty = inputLocationClean.address_components.find(c => c.types[0] === 'administrative_area_level_2')?.short_name
        const inputState = inputLocationClean.address_components.find(c => c.types[0] === 'administrative_area_level_1')?.short_name
        const inputZip = inputLocationClean.address_components.find(c => c.types[0] === 'postal_code')?.short_name
        // Compose the Location's complete "address" as I want it to be shown (i.e, No city, state, zip, or country)
        const inputAddressConstructed = `${inputStreetNumber ? inputStreetNumber +'' : ''}${inputStreetName ? inputStreetName + ',': ''}${inputCity ? inputCity + ',': ''}${inputCounty ? inputCounty + ',': ''}${inputState ? inputState +'' : ''}${inputZip ? inputZip : ''}`;
        console.log("Cleaned address A: ", inputAddressClean); // from reverse geocoding the geocoded location
        console.log("Cleaned address B: ", inputAddressConstructed); // from custom reconstruction

        // ---

        // Compose the URLs for the Google Maps and Street View components
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;        

        //   .--------------------------------------,
        //   |  Construct the complete response    /
        //   '------------------------------------'

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
        
        //   .------------------------------------,
        //   |    Display the full response      /
        //   '----------------------------------'

        // Set the content of the result div to our fully-generated content
        resultDiv.innerHTML = resultContent;
        resultDiv.style.opacity = '1';

        // Fade the response in line-by-line
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
        resultDiv.innerHTML = "<b>Sorry, an error occurred.</b><br><br>Try again later  :-(";
        loadingDiv.innerHTML = "<b>Sorry, an error occurred.</b><br><br>Try again later  :-(";
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


// Fade in the input box upon page load (adds a class to the input after the page loads to trigger the transition)
window.addEventListener('load', () => {
     // slight delay (100 ms) to ensure styles are applied after load
     setTimeout(() => {
        const input = document.getElementById('addressInput');
        input.style.opacity = 1;
        input.style.transform = 'translateY(0)';
    }, 100);
});