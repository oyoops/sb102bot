import requests
import math
import logging
import utilities

from constants import GOOGLE_API_KEY

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
            logging.error(f"Error geocoding address: {data}")
            raise ValueError("Error geocoding address. Check the address and try again.")
        
        self.latitude = data['results'][0]['geometry']['location']['lat']
        self.longitude = data['results'][0]['geometry']['location']['lng']
        logging.debug(f"Latitude: {self.latitude}, Longitude: {self.longitude}")

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
            logging.error(f"Error fetching city and county: {data}")
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

@staticmethod
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance