const mainHeader = document.getElementById('mainHeader');
let minAffordablePercent = 0.4;
let globalDensity = null; // global variable to store the density value for later use in the unit calculations
let globalTotalUnits = null; // global variable to store the total unit count for later use in the unit calculations
let globalAffordableUnits = null; // global variable to store the affordable unit count for later use in the unit calculations
let globalMarketRateUnits = null; // global variable to store the market rate unit count for later use in the unit calculations


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
    // Show the loading indicator
    loadingDiv.style.display = 'block';
    
    // Reset the result div opacity to 0 to achieve the fade-in effect on new data
    resultDiv.style.opacity = 0;

    // Send input address to endpoint /analyze_address
    try {
        //console.log("Sending address to endpoint analyze_address...");
        const response = await fetch('https://sb102bot-gh.vercel.app/api/analyze_address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                address: userInputText
            }),
        });

        // Await response from sb102bot server
        const data = await response.json();
        //console.log("Response from /analyze_address: \n", data);
        
        // Extract the data from the response
        const { address, city, county, density, walkscore, latitude, longitude } = data;
        //  .****.
        //  | ^--+-- WILL THIS BREAK IF IT IS NOT PERFECTLY MAPPED OUT TO THE ENDPOINT'S RESPONSE??
        //  '****'

        // Set the globalDensity variable to the density from the response
        globalDensity = density;        

        //   .--------------------------------------,
        //   |  Reverse-geocode on client side     /    (THIS IS BAD FORM! It should be done serverside!)
        //   '------------------------------------'

        // "Clean" the user input address by reverse-geocoding the already-geocoded address (this should really be done server-side) 
        const inputLocationClean = await reverseGeocode(latitude, longitude);
        const inputAddressClean = inputLocationClean.formatted_address;        
        //console.log("Cleaned address: ", inputAddressClean);

        // Print all values in address_components
        console.log("Address components: ", inputLocationClean.address_components);

        // Use the cleaned Location object to get the details we need
        const inputStreetNumber = inputLocationClean.address_components.find(c => c.types[0] ==='street_number')?.short_name
        const inputStreetName = inputLocationClean.address_components.find(c => c.types[0] === 'route')?.short_name
        const inputCity = inputLocationClean.address_components.find(c => c.types[0] === 'locality')?.short_name
        const inputCounty = inputLocationClean.address_components.find(c => c.types[0] === 'administrative_area_level_2')?.short_name
        const inputState = inputLocationClean.address_components.find(c => c.types[0] === 'administrative_area_level_1')?.short_name
        const inputZip = inputLocationClean.address_components.find(c => c.types[0] === 'postal_code')?.short_name
        // Compose the Location's complete "address" as I want it to be shown (i.e, No city, state, zip, or country)
        const inputAddressConstructed = `${inputStreetNumber ? inputStreetNumber + ' ' : ''}${inputStreetName ? inputStreetName + ', ': ''}${inputCity ? inputCity + '': ''}`;
        console.log("Constructed address:", inputAddressConstructed); // from custom reconstruction

        //   .--------------------------------------,
        //   |    Prepare assets for response      /
        //   '------------------------------------'

        // Google Maps redirect URL:
        const googleMapsURLInput = `https://www.google.com/maps?q=${latitude},${longitude}`;
        // Street View image URL:
        const streetViewURLInput = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;        
        // Satellite image URL:
        const satelliteURLInput = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=18&size=600x300&maptype=satellite&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;

        //   .--------------------------------------,
        //   |  Construct the complete response    /
        //   '------------------------------------'

        // STREET VIEW & GOOGLE MAPS LINK:
        let resultContent = `
            <div class="fade-in-line"><u><b><h3>${inputAddressConstructed}</h3></b></u></div>

            <div class="imageContainer">
                <div class="imageItem">
                    <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${satelliteURLInput}" alt="Google Satellite View of Your Input Address"></a></div>
                    <div class="fade-in-line">See <a href="${googleMapsURLInput}" target="_blank">property</a> in Google Maps<br></div>
                </div>
                <div class="imageItem">
                    <div class="fade-in-line"><a href="${googleMapsURLInput}" target="_blank"><img src="${streetViewURLInput}" alt="Google Street View of Your Input Address"></a></div>
                    <div class="fade-in-line">See <a href="${googleMapsURLInput}" target="_blank">property</a> in Google Maps<br></div>
                </div>
            </div>
        `;
        
        // MAXIMUM MUNICIPAL DENSITY LOOKUP:
        if (!density || density <= 0) {
            resultContent += `
                <div class="fade-in-line"><br>Unfortunately, I don't know ${inputCity !== '-' ? inputCity : inputCounty}'s maximum residential density.<br>This info is necessary for coming up with a unit count.</div>
                <div class="fade-in-line">Cheer up, though, because I've just added your property to the list of cities and counties to someday add. Check back next week?</div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line"><br>The maximum allowed residential density anywhere in ${inputCity !== '-' ? inputCity : inputCounty} is ${density} units/acre, so a Live Local-qualifying development here could match that.</div>
            `;
        }
        resultContent += `<br><br>`;
        
        //   .------------------------------------,
        //   |    Display the full response      /
        //   '----------------------------------'

        // Set the content of the result div to our fully-generated content
        resultDiv.innerHTML = resultContent;
        resultDiv.style.opacity = '1';

        // Append the "Try Again" button to the result div
        resultDiv.appendChild(document.getElementById('tryAgainButton'));

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

        // Show the acreage input section after analysis is complete
        document.getElementById('acreageSection').style.display = 'block';

        // Scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);

        // ...
        // ...
        // ...
        
    } catch (error) {
        console.log("Error while sending/receiving data: ", error);
        resultDiv.innerHTML = "<u>Sorry, an error occurred.</u><br>Try again later. <br><br><h2>:'-(</h2>";
        loadingDiv.innerHTML = "<u>Sorry, an error occurred.</u><br>Try again later. <br><br><h2>:'-(</h2>";
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


// Event listener for the Calculate Units button
document.getElementById('calculateUnitsButton').addEventListener('click', function() {
    const acreage = parseFloat(document.getElementById('acreageInput').value);
    if (isNaN(acreage)) {
        alert("Please enter a valid acreage.");
        return;
    }

    // Store the total/affordable/market unit counts in a global variable for later use
    const totalUnits = Math.floor(acreage * globalDensity); // Use the globalDensity variable
    globalTotalUnits = totalUnits; // Store the total units in a global variable for later use  
    const affordableUnits = Math.ceil(totalUnits * minAffordablePercent);
    globalAffordableUnits = affordableUnits; // Store the affordable units in a global variable for later use
    const marketRateUnits = totalUnits - affordableUnits;
    globalMarketRateUnits = marketRateUnits; // Store the market rate units in a global variable for later use

    // Clear previous results if any
    const resultDiv = document.getElementById('unitCalculationResult');
    resultDiv.innerHTML = "";

    // Create a single cohesive sentence
    const cohesiveSentenceElem = document.createElement('p');
    cohesiveSentenceElem.textContent = `Based on the acreage, you could develop a total of ${totalUnits} units, comprising ${affordableUnits} affordable units and ${marketRateUnits} market-rate units.`;

    // Apply the 'fade-in-line' class for the fade-in effect
    cohesiveSentenceElem.className = 'fade-in-line';

    // Append the sentence to the result div
    resultDiv.appendChild(cohesiveSentenceElem);

    // Apply the fade-in effect
    setTimeout(() => {
        cohesiveSentenceElem.style.opacity = '1';
    }, 500);

    // Scroll to the bottom of the page
    window.scrollTo(0, document.body.scrollHeight);

    // ---
    
    // Clear previous bedroom type inputs if any
    const bedroomTypeInputDiv = document.getElementById('bedroomTypeInputDiv');
    bedroomTypeInputDiv.innerHTML = "";

    // Generate inputs for the new section
    const generateBedroomTypeInputs = (label) => {
        return `
            <div class="bedroomTypeInputGroup">
                <label>${label}</label>
                <input type="number" placeholder="10" class="${label.toLowerCase()}Input studio" data-bedroom="Studio">
                <input type="number" placeholder="45" class="${label.toLowerCase()}Input oneBd" data-bedroom="1BD">
                <input type="number" placeholder="35" class="${label.toLowerCase()}Input twoBd" data-bedroom="2BD">
                <input type="number" placeholder="10" class="${label.toLowerCase()}Input threeBd" data-bedroom="3BD">
                <span>Total: <span id="${label.toLowerCase()}TotalPercentage">0</span>%</span>
            </div>
        `;
    };    

    const affordableInputGroup = generateBedroomTypeInputs('Affordable', affordableUnits);
    const marketRateInputGroup = generateBedroomTypeInputs('Market', marketRateUnits);

    bedroomTypeInputDiv.innerHTML = `<h3>Apportion the unit mix:</h3>${affordableInputGroup}${marketRateInputGroup}`;
    bedroomTypeInputDiv.innerHTML += '<button id="submitBedroomTypes">Submit unit mix</button>';
    // Show the new section
    bedroomTypeInputDiv.style.display = 'block';
    
    // Scroll to the bottom of the page
    window.scrollTo(0, document.body.scrollHeight);

    // ...
    // ...
    // ...

});

// Scroll to the bottom of the page
window.scrollTo(0, document.body.scrollHeight);

// Add a new event listener for the "Submit Bedroom Types" button
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'submitBedroomTypes') {
        // Validate the bedroom type inputs here
        // ...
        // ...
        // ...

        // If validation passes, convert the percentages to unit counts
        const affordableInputs = Array.from(document.querySelectorAll('.affordableInput'));
        const marketRateInputs = Array.from(document.querySelectorAll('.marketRateInput'));
        
        // Debugging: Print out the intermediate arrays
        console.log('Affordable Inputs:', affordableInputs);
        console.log('Market Rate Inputs:', marketRateInputs);

        const affordableUnitCounts = affordableInputs.map(input => {
            const value = Number(input.value);
            return !isNaN(value) ? Math.round(globalAffordableUnits * (value / 100)) : 'N/A';
        });
        const marketRateUnitCounts = marketRateInputs.map(input => {
            const value = Number(input.value);
            return !isNaN(value) ? Math.round(globalMarketRateUnits * (value / 100)) : 'N/A';
        });

        // Debugging: Print out the unit counts
        console.log('Affordable Unit Counts:', affordableUnitCounts);
        console.log('Market Rate Unit Counts:', marketRateUnitCounts);

        // Create a table to display the unit counts
        let tableHTML = '<h3>Units by bedroom count:</h3>';
        tableHTML += '<table><thead><tr><th>Beds</th><th>Affordable</th><th>Market</th></tr></thead><tbody>';
        
        const bedroomTypes = ['Studio', '1BD', '2BD', '3BD'];
        for (let i = 0; i < bedroomTypes.length; i++) {
            tableHTML += `<tr><td>${bedroomTypes[i]}</td><td>${affordableUnitCounts[i]}</td><td>${marketRateUnitCounts[i]}</td></tr>`;
        }

        tableHTML += '</tbody></table>';
        
        // Append the table to the bedroomTypeInputDiv
        const tableDiv = document.createElement('div');
        tableDiv.innerHTML = tableHTML;
        document.getElementById('bedroomTypeInputDiv').appendChild(tableDiv);
        
        // Scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);
    }
});