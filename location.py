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

    def get_city_and_county(self):
        overpass_url = "https://overpass-api.de/api/interpreter"
        
        query = f"""
        [out:json];
        (
            is_in({self.latitude}, {self.longitude});
            area._[boundary=administrative][admin_level~"[68]"];
        );
        out tags;
        """
        
        response = requests.get(overpass_url, params={'data': query})
        data = response.json()
        
        # Printing the entire data from Overpass API
        print("Overpass API Data:", data)
        
        city = None
        county = None

        for element in data['elements']:
            if 'tags' in element:
                if 'admin_level' in element['tags'] and element['tags']['admin_level'] == '6':
                    county = element['tags'].get('name', None)
                elif 'admin_level' in element['tags'] and element['tags']['admin_level'] == '8':
                    city = element['tags'].get('name', None)

        # Printing the final city and county values
        print("Extracted City:", city)
        print("Extracted County:", county)
                    
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

