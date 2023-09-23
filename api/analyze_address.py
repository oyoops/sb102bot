from main import *
from density import get_density, density_data
from location import Location
from http.server import BaseHTTPRequestHandler
import json

###  This endpoint accepts client POST requests to https://sb102bot/api/analyze_address
###  which executes ________?________ function using address input.

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
        self.wfile.write(str("Send a POST request with an address to analyze an address.").encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        input_data = post_data.decode("utf-8")
        userInputAddress = input_data

        # Get a "perfect" Location object for the input address
        result = get_address_analysis(userInputAddress)
        loc = result['result'].get('location', None) # Extract just the Location object from the result dictionary

        # Get the city and county
        if loc:
            city, county = loc.get_city_and_county()
        else:
            city, county = None, None

        # Look the city/county up in our max. municipal densities table
        if city:
            municipality = city
            density_value = get_density(municipality)
            print("Highest density in", municipality, "is", density_value, "units/ac.")
        elif county:
            municipality = county
            density_value = get_density(municipality)
            print("Highest density in", municipality, "is", density_value, "units/ac.")
        else:
            municipality = "Unknown"
            # no data for this municipality
            density_value = 0
            print("No density data available for this municipality.")        
        
        # Print max. municipal density results
        print("City:", city)
        print("County:", county)
        print("Municipality:", municipality)
        print("Density:", density_value, "units/ac.")
        

        #####################################################################################################


        ## RESPONSE:

        # Set headers
        self.send_response(200)
        self.send_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        # Compose the response
        response = {
            "address": result["result"].get("address", None),
            "city": result["result"].get("city", None),
            "county": result["result"].get("county", None),
            "density": result["result"].get("density", None),
            "walkscore": result["result"].get("walkscore", None),
            "latitude": result["result"].get("latitude", None),
            "longitude": result["result"].get("longitude", None)
        }

        # Send the response to client
        self.wfile.write(json.dumps(response).encode())


# --------------


# CLEAN and DETAIL location (geocodes and reverse geocodes user input)
def get_address_analysis(input_data):
    
    # Initialize the input as a Location object 
    loc = Location(input_data)
        # ^ Will this fail if the address is not found / bad input? If so, would it cause the whole web app to stop functioning?
    
    # Get details of the location
    lat, lon = loc.geocode_address()
    city, county = loc.get_city_and_county()
    walkability_score = loc.get_walkability_score()
    max_density = get_density(city) if city else get_density(county)
    ### NEED A LOC.GET ADDRESS FUNCTION TO RETURN THE FIXED ADDRESS AS A STRING
    
    # Log results
    print(f"\n ,--------------.---------------------------.")
    print(f" |     RESULTS    |  Live Local Act Analysis  |")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   SUBJECT:     | {input_data}")
    print(f" |   Lat/Long     | {round(lat, 5)}, {round(lon, 5)}")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   City         | {city if city else 'Unknown'}\nCounty: {county if county else 'Unknown'}")    
    print(f" |   Max. Density | {max_density} units/ac.")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   Walkability  | {walkability_score}")
    print(f" '----------------^---------------------------'\n")
    
    # Compose result dictionary
    result = {
        "address": {input_data},
        "city": city,
        "county": county,
        "density": max_density,
        "walkscore": walkability_score,
        "latitude": lat,
        "longitude": lon,
        "location": loc
    }

    # (debug)
    print("Result:", result)

    # Return results as a dictionary
    response = {"result": result}
    return response