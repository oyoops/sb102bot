import requests
import math
import logging

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
