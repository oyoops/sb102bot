from main import run_site_lookup_from_input
from density import get_density, density_data
from location import Location
from http.server import BaseHTTPRequestHandler
import json

###  This setup allows you to send a POST request
###  to https://sb102bot/api/site_lookup
###  to execute the run_site_lookup_from_input function.

###    run_site_lookup_from_input(...) in main.py



class handler(BaseHTTPRequestHandler):

    def send_cors_headers(self):
        """Set headers for Cross-Origin Resource Sharing (CORS)"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        """Respond to an OPTIONS request."""
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        # Handle the GET request here, maybe return a basic message or form
        self.send_response(200)
        self.send_cors_headers()
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(str("Send a POST request with an address to get the location data.").encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        input_data = post_data.decode("utf-8")

        # Get the location data for the given location
        result = run_site_lookup_from_input(input_data)
        loc = result['result'].get('location', None)

        # Get the city and county from the Location object
        if loc:
            city, county = loc.get_city_and_county()
        else:
            city, county = None, None
        # Print city and county values after they are determined
        print("City:", city)
        print("County:", county)

        ## Clean data:

        # Fix building name if it is '-' or missing
        building_name = result["result"].get("name", None)
        if not building_name or building_name == "-":
            building_name = "Unknown"
        # Round the distance to 2 decimal places
        distance = result["result"].get("distance", None)
        if distance is not None:
            distance = round(distance, 2)

        #####################################################################################################
        # Determine density value based on city or county, or 0 if neither exists in our density database
        if city:
            density_value = get_density(city)
        elif county:
            density_value = get_density(county)
        else:
            density_value = 0
        # Print the determined density value
        print("Max density in municipality: ", density_value, "units/ac.")
        #####################################################################################################


        # Set headers
        self.send_response(200)
        self.send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Compose the response
        response = {
            "height": result["result"].get("height", None),
            "address": result["result"].get("address", None),
            "latitude": result["result"].get("latitude", None),
            "longitude": result["result"].get("longitude", None),
            "city": city or "-",
            "county": county or "-",
            "density": density_value,
            "distance": distance,
            "building_name": building_name
        }

        # Send the response
        self.wfile.write(json.dumps(response).encode())