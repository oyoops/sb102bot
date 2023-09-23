##################
## ONLY         ##
## WORKS        ##
## PARTIALLY!!! ##
##################


from main import *
from density import get_density, density_data
from location import Location
from http.server import BaseHTTPRequestHandler
import json

###  This setup allows you to send a POST request
###  to https://sb102bot/api/building_height
###  to execute get_building_height_from_input.

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
        self.wfile.write(str("Send a POST request with an address to get the tallest building height within a 1-mile radius.").encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        input_data = post_data.decode("utf-8")

        # Get the results for the given location
        result = get_tallest_building_within_one_mile(input_data)
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
        # Determine density value based on city or county or default to 0
        if city:
            density_value = get_density(city)
        elif county:
            density_value = get_density(county)
        else:
            density_value = 0
        # Print the determined density value
        print("Max density in this municipality: ", density_value, "units/ac.")
        #####################################################################################################

        # Set headers
        self.send_response(200)
        self.send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Compose the response
        response = {
            "building_name": result["result"].get("name", None),
            "address": result["result"].get("address", None),
            "latitude": result["result"].get("latitude", None),
            "longitude": result["result"].get("longitude", None),
            "county": result["result"].get("county", None),
            "city": result["result"].get("city", None),
            "distance": result["result"].get("distance", None),
            "height": result["result"].get("height", None),
            "density": result["result"].get("density", None),
            "walkscore": result["result"].get("walkscore", None),
        }

        # Send the response
        self.wfile.write(json.dumps(response).encode())

def get_tallest_building_within_one_mile(input_data):
    # Get location object
    loc = Location(input_data)
    lat, lon = get_location_coordinates(input_data, loc)
    city, county = loc.get_city_and_county()

    # Get building object
    building_obj = Building(lat, lon)

    print(f"\n--------------------------------------------------------------------------------------\n\nSEARCHING...")
    print(f"\nSUBJECT PROPERTY:")
    print(f"Lat/Long: {round(lat, 5)}, {round(lon, 5)}")
    print(f"City: {city if city else 'Unknown'}, County: {county if county else 'Unknown'}\n")

    # Get top buildings
    top_buildings = get_top_buildings(building_obj)
    print_top_buildings(top_buildings, building_obj)

    # Get approx. stories
    tallest_building_details = get_tallest_building_details(top_buildings, building_obj)
    approx_stories = int(tallest_building_details['height'] / FEET_IN_STORY)
    print(f"Approx. stories: {approx_stories}")

    # Get walkability score
    walkability_score = loc.get_walkability_score()
    print(f"\nWalkability Score: {walkability_score}")

    # Get max density in municipality
    max_density = get_density(city) if city else get_density(county)
    
    # Log results
    print(f"\n .--------------------------------------------------------------------------------.")
    print(f" |  Live Local Act allows for a building height of up to {round(approx_stories * FEET_IN_STORY,0)} feet (~{approx_stories} stories)   |")
    print(f" '--------------------------------------------------------------------------------'\n\n")
    
    # Collect results
    result = {
        "height": tallest_building_details.get('height', 'Unknown'),
        "address": tallest_building_details.get('address', 'Unknown'),
        "latitude": tallest_building_details.get('latitude', 'Unknown'),
        "longitude": tallest_building_details.get('longitude', 'Unknown'),
        "city": city,
        "county": county,
        "density": max_density,
        "distance": tallest_building_details.get('distance', 'Unknown'),
        "building_name": tallest_building_details.get('name', 'Unknown'),
        "location": loc
    }

    # Return results dictionary
    response = {"result": result}
    return response