from constants import GOOGLE_API_KEY
import utilities
import requests
import math
import logging
import json


# Initialize logging
logging.basicConfig(level=logging.DEBUG)

class Location:

    def __init__(self, input_data):
        self.input_data = input_data
        self.latitude = None
        self.longitude = None

    def geocode_address(self):
        logging.debug("Geocoding address.")
        base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': self.input_data,
            'key': GOOGLE_API_KEY
        }
        response = requests.get(base_url, params=params)
        data = response.json()

        if data['status'] != 'OK':
            logging.error(f"Error geocoding address: \n  {data}")
            raise ValueError("Error geocoding address.\nCheck the address and try again.")
        
        self.latitude = data['results'][0]['geometry']['location']['lat']
        self.longitude = data['results'][0]['geometry']['location']['lng']
        logging.debug(f"Geocoded:  {data}\n       via G-API into\n   Latitude:  {self.latitude} \n Longitude:  {self.longitude}\n")

        return self.latitude, self.longitude

    def get_city_and_county(self):
        logging.debug("Fetching city and county using Google Maps API.")
        
        if self.latitude is None or self.longitude is None:
            logging.error("Latitude and/or longitude have not been set.")
            raise ValueError("Latitude and/or longitude have not been set.")
        
        base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'latlng': f"{self.latitude},{self.longitude}",
            'key': GOOGLE_API_KEY
        }
        response = requests.get(base_url, params=params)
        data = response.json()

        if data['status'] != 'OK':
            logging.error(f"Error fetching city and county: \n  {data}")
            raise ValueError("Error fetching city and county.")
                
        city = None
        county = None
        for result in data['results']:
            for component in result['address_components']:
                if 'locality' in component['types']:
                    city = component['long_name']
                if 'administrative_area_level_2' in component['types']:
                    county = component['long_name']
        
        if city is None or county is None:
            logging.error("Could not find city or county.")
            raise ValueError("Could not find city or county.")

        logging.debug(f"Extracted City: {city}, Extracted County: {county}")

        return city, county

    def get_walkability_score(self):
        API_KEY = GOOGLE_API_KEY
        types = ['grocery_or_supermarket', 'park', 'school', 'transit_station']
        score = 0
        
        for amenity_type in types:
            endpoint = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={self.latitude},{self.longitude}&radius=1000&type={amenity_type}&key={API_KEY}"
            
            try:
                response = requests.get(endpoint)
                data = json.loads(response.text)
                
                if data['status'] == 'OK' and len(data['results']) > 0:
                    # THIS IS A LAUGHABLY STUPID METHOD TO CALCULATE A "WALKABILITY SCORE"
                    score += 25  # Increment score for each amenity type found within 1km
                    print(f"Found {amenity_type} within 1km of {self.latitude}, {self.longitude}")

            except Exception as e:
                print(f"Failed to fetch nearby places: {e}")
                
        return score
    

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371  # Radius of Earth in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) \
            * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        distance = distance * 0.621371 # Convert to miles
        return distance