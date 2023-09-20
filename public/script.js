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

        const googleMapsURL = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURL = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;

        let resultContent = (address === "- ") ? `
            <div class="fade-in-line"><u><b><br></b></u></div>
            <div class="fade-in-line">By utilizing the Live Local Act here, you could build as high as <b>${height} feet</b>,</div>
            <div class="fade-in-line">which is as tall as this building at ${latitude}, ${longitude}:</div>
            <div class="fade-in-line"><a href="${googleMapsURL}" target="_blank"><img src="${streetViewURL}" alt="Google Street View of ${latitude},${longitude}"></a></div>
            <div class="fade-in-line">See it on <a href="${googleMapsURL}" target="_blank">Google Maps</a></div>
            <div class="fade-in-line">Your site is ${distance} miles away, so it qualifies.</div>
            <div class="fade-in-line">${density} | ${city} | ${county}</div>
        ` : `
            <div class="fade-in-line">By utilizing the Live Local Act here, you could build as high as <b>${height} feet</b>,</div>
            <div class="fade-in-line">which is as tall as this building at ${address}:</div>
            <div class="fade-in-line"><a href="${googleMapsURL}" target="_blank"><img src="${streetViewURL}" alt="Google Street View of ${address}"></a></div>
            <div class="fade-in-line">See it on <a href="${googleMapsURL}" target="_blank">Google Maps</a></div>
            <div class="fade-in-line">Your site is ${distance} miles away, so it qualifies.</div>
            <div class="fade-in-line">${density} | ${city} | ${county}</div>
        `;
        
        if (!density || density <= 0) {
            resultContent += `
                <div class="fade-in-line"><br>orry, I don't know the maximum residential density here.</div>
                <div class="fade-in-line"><br>But worry not, because I've just added this municipality to my list of cities and counties to add.</div>
                <div class="fade-in-line">Come back next week, maybe?</div>
                <div class="fade-in-line"><br><br>[Debug information]:<br>city = ${city}; county = ${county}<br></div>
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
            delay += 500; // 0.5 seconds delay for each line
        });

        // Hide loading and show "Try Again" button
        loadingDiv.style.display = 'none';
        tryAgainButton.style.display = 'block';

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Sorry, an error occurred. Please try again later.";
    }
});


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