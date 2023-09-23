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

        print("Debugging: input_data:", input_data)
        print("User input address:", userInputAddress)

        # Geocode, then reverse-geocode, the input address
        subjectLocation = get_address_analysis(userInputAddress)
        # Extract just the Location object from the resulting dictionary
        subjectLoc = subjectLocation.get('location', None)

        # Get city and county
        if subjectLoc:
            city, county = subjectLoc.get_city_and_county()
        else:
            city, county = None, None

        # Max. municipal densities table lookup
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
            "address": subjectLocation.get("address", None),
            "city": subjectLocation.get("city", None),
            "county": subjectLocation.get("county", None),
            "density": subjectLocation.get("density", None),
            "walkscore": subjectLocation.get("walkscore", None),
            "latitude": subjectLocation.get("latitude", None),
            "longitude": subjectLocation.get("longitude", None)
        }

        # Send the response to client
        self.wfile.write(json.dumps(response).encode())


# --------------


# CLEAN and DETAIL location (geocodes and reverse geocodes user input)
def get_address_analysis(input_data):
    userInputAddress = input_data

    # Initialize the input as a Location object 
    loc = Location(userInputAddress)
        # ^ Will this fail if the address is not found / bad input? If so, would it cause the whole web app to stop functioning?
    
    # Get details of the location
    lat, lon = loc.geocode_address()
    city, county = loc.get_city_and_county()
    walkability_score = loc.get_walkability_score()
    max_density = get_density(city) if city else get_density(county)
    
    # Log results
    print(f"\n ,----------------.---------------------------.")
    print(f" |   RESULTS       /  Live Local Act Analysis |")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   SUBJECT:     |", userInputAddress,"\n")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   Lat/Long     | {round(lat, 5)}, {round(lon, 5)}")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   City         | {city if city else 'Unknown'}\n")
    print(f" |   County       | {county if county else 'Unknown'}")
    print(f" |   Max. Density | {max_density} units/ac.")
    print(f"  >---------------+---------------------------|\n")    
    print(f" |   Walkability  | {walkability_score}")
    print(f" '----------------^---------------------------'\n")
    
    # Compose result dictionary
    result = {
        "address": userInputAddress,
        "city": city,
        "county": county,
        "density": max_density,
        "walkscore": walkability_score,
        "latitude": lat,
        "longitude": lon,
        "location": loc
    }

    # Return result dictionary
    return result