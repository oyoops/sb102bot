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

        // Check if the data contains all the necessary fields
        if (!data || !data.height || !data.latitude || !data.longitude) {
            throw new Error("Incomplete data received from the server.");
        }

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
            <u><b>${buildingName}</b></u><br><br>
            By utilizing the Live Local Act here, you could build as high as <b>${height} feet</b>,
            which is as tall as this building at ${latitude}, ${longitude}:<br><br>
            <a href="${googleMapsURL}" target="_blank"><img src="${streetViewURL}" alt="Google Street View of ${latitude},${longitude}"></a><br>
            See it on <a href="${googleMapsURL}" target="_blank">Google Maps</a><br><br>
            Your site is ${distance} miles away, so it qualifies.<br>${density} | ${city} | ${county}<br>
        ` : `
            By utilizing the Live Local Act here, you could build as high as <b>${height} feet</b>,
            which is as tall as this building at ${address}:<br><br>
            <a href="${googleMapsURL}" target="_blank"><img src="${streetViewURL}" alt="Google Street View of ${address}"></a><br>
            See it on <a href="${googleMapsURL}" target="_blank">Google Maps</a><br><br>
            Your site is ${distance} miles away, so it qualifies.<br>${density} | ${city} | ${county}<br>
        `;

        if (!density || density <= 0) {
            resultContent += `<i>Sorry, I don't know the maximum residential density in this municipality. <br>On the bright side, I've automatically added it to my list of requested cities/counties to add in the near future.<br><br>Try again some other day!<br><br>${city} ${county}<br>`;
        } else {
            resultContent += `The highest residential density in ${city !== '-' ? city : county} is ${density} units per acre, so a Live Local-qualified development at this location could match that.<br><br>`;
        }

        resultDiv.innerHTML = resultContent;

        // Show the result div content with a fade-in effect
        resultDiv.style.opacity = 1;

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "Sorry, an error occurred. Please try again later.";
        resultDiv.style.opacity = 1;
    } finally {
        // Hide the loading indicator
        loadingDiv.style.display = 'none';
    }
});