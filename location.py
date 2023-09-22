import requests
import math
from constants import GOOGLE_API_KEY

class Location:

    def __init__(self, input_data):
        self.input_data = input_data
        self.latitude = None
        self.longitude = None

    def geocode_address(self):
        base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': self.input_data,
            'key': GOOGLE_API_KEY
        }
        response = requests.get(base_url, params=params)
        data = response.json()

        if data['status'] != 'OK':
            raise ValueError("Error geocoding address. Check the address and try again.")
        self.latitude = data['results'][0]['geometry']['location']['lat']
        self.longitude = data['results'][0]['geometry']['location']['lng']

        return self.latitude, self.longitude

    def reverse_geocode_coordinates(self):
        base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'latlng': f"{self.latitude},{self.longitude}",
            'key': GOOGLE_API_KEY
        }
        response = requests.get(base_url, params=params)
        data = response.json()

        if data['status'] != 'OK':
            raise ValueError("Error reverse geocoding coordinates.")
        
        return data['results'][0]['formatted_address']

    def get_city_and_county(self):
        base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'latlng': f"{self.latitude},{self.longitude}",
            'key': GOOGLE_API_KEY
        }
        response = requests.get(base_url, params=params)
        data = response.json()

        if data['status'] != 'OK':
            raise ValueError("Error fetching city and county.")
        
        city = None
        county = None
        
        for component in data['results'][0]['address_components']:
            if "locality" in component['types']:
                city = component['long_name']
            elif "administrative_area_level_2" in component['types']:
                county = component['long_name']
        
        return city, county

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = (math.sin(dlat/2)**2 + 
             math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = 6371 * c
        return distance * 0.621371
    