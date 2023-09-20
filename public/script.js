document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const inputAddress = document.getElementById('addressInput').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.querySelector('.loading');

    // Show the loading indicator
    loadingDiv.style.display = 'block';

    // Reset the result div opacity to 0 for the fade-in effect on new data
    resultDiv.style.opacity = 0;

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
            city = '-',
            county = '-',
            address = '-',
            density = 0,
            distance,
            building_name: buildingName = 'Unknown',
        } = data;

        const googleMapsURL = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const streetViewURL = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=AIzaSyCm_XobfqV7s6bQJm0asuqZawWAYkXHN0Q`;

        let resultContent = (address === "- ") ? `
            <div class="fade-in-line"><u><b>${buildingName}</b></u></div>
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
                <div class="fade-in-line"><i>Sorry, I don't know the maximum residential density in this municipality.</i></div>
                <div class="fade-in-line"><i>On the bright side, I've automatically added it to my list of requested cities/counties to add in the near future.</i></div>
                <div class="fade-in-line"><i>Try again some other day!</i></div>
                <div class="fade-in-line">${city} ${county}</div>
            `;
        } else {
            resultContent += `
                <div class="fade-in-line">The highest residential density in ${city !== '-' ? city : county} is ${density} units per acre, so a Live Local-qualified development at this location could match that.</div>
            `;
        }
        
        // Set the content of the result div
        resultDiv.innerHTML = resultContent;

        // Set the opacity of the result div to 1
        resultDiv.style.opacity = '1';

        // Hide the loading indicator
        loadingDiv.style.display = 'none';

        // Fade in each line with a delay
        const lines = resultDiv.querySelectorAll('.fade-in-line');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = 1;
            }, index * 500);  // 500ms delay for each line
        });

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Sorry, an error occurred. Please try again later.";
    }
});



// Fade in the input box on page load
//   (add a class to the input after the page loads to trigger the transition)
window.addEventListener('load', () => {
    setTimeout(() => {
        const input = document.getElementById('addressInput');
        input.style.opacity = 1;
        input.style.transform = 'translateY(0)';
    }, 100); // slight delay to ensure styles are applied after load
});