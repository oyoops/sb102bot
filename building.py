import requests
import xml.etree.ElementTree as ET
from location import Location
from constants import METERS_IN_MILE, DEFAULT_RADIUS_IN_MILES, FEET_IN_STORY
import math

class Building:

    def __init__(self, latitude, longitude):
        self.latitude = latitude
        self.longitude = longitude

    def get_building_heights(self, radius_meters=METERS_IN_MILE*DEFAULT_RADIUS_IN_MILES):
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        (
          way["building"](around:{radius_meters},{self.latitude},{self.longitude});
          relation["building"](around:{radius_meters},{self.latitude},{self.longitude});
        );
        out body;
        """
        response = requests.get(overpass_url, params={'data': query})
        data = response.json()

        buildings = []
        for element in data['elements']:
            if 'tags' in element and 'height' in element['tags']:
                buildings.append({
                    'type': element['type'],
                    'id': element['id'],
                    'height': element['tags']['height']
                })
        return buildings

    def get_building_info(self, building_id, building_type='way'):
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        {building_type}(id:{building_id});
        out body;
        """
        response = requests.get(overpass_url, params={'data': query})
        data = response.json()
        
        if not data['elements']:
            print(f"No information found for {building_type} with ID {building_id}")
            return
        
        building_info = data['elements'][0]
        summary = {
            'ID': building_info['id'],
            'Type': building_info['type'],
            'Latitude': building_info['center']['lat'] if 'center' in building_info else None,
            'Longitude': building_info['center']['lon'] if 'center' in building_info else None,
            'Tags': building_info['tags'] if 'tags' in building_info else None
        }
        return summary
        
    def get_detailed_building_info(self, building):
        building_details = {}

        # Convert meters to feet
        building_details['height'] = int(float(building['height']) * 3.28084)
        # Estimate stories
        building_details['stories'] = int(building_details['height'] / FEET_IN_STORY)

        # Get building info
        binfo = self.get_building_info(building['id'], building['type'])
        building_details['name'] = binfo.get('Tags', {}).get('name', "Unknown")
        building_details['address'] = f"{binfo.get('Tags', {}).get('addr:housenumber', '-')}, {binfo.get('Tags', {}).get('addr:street', '')}"

        # Get building's lat/long from its geometry, if available
        geometry = self.fetch_geometry(building['id'], building['type'])
        if geometry and len(geometry) > 0:
            building_details['latitude'], building_details['longitude'] = geometry[0]
        else:
            building_details['latitude'] = None
            building_details['longitude'] = None

        if building_details['latitude'] is not None and building_details['longitude'] is not None:
            distance = Location.haversine_distance(self.latitude, self.longitude, building_details['latitude'], building_details['longitude'])
            building_details['distance'] = round(distance, 2)
        else:
            building_details['distance'] = None

        return building_details

    def fetch_geometry(self, osm_id, osm_type):
        if osm_type not in ['way', 'relation']:
            return None

        url = f"https://api.openstreetmap.org/api/0.6/{osm_type}/{osm_id}.json"
        response = requests.get(url)
        data = response.json()

        if osm_type == 'way':
            nodes = data['elements'][0]['nodes']
        else:
            return None

        nodes_str = ",".join(map(str, nodes))
        url = f"https://api.openstreetmap.org/api/0.6/nodes?nodes={nodes_str}"
        response = requests.get(url)
            
        if response.status_code != 200:
            print(f"Error fetching nodes. Status Code: {response.status_code}")
            print("Response content:")
            print(response.text)
            return None

        root = ET.fromstring(response.content)
        nodes = []
        for node in root.findall('node'):
            lat = float(node.attrib['lat'])
            lon = float(node.attrib['lon'])
            nodes.append((lat, lon))

        geometry = nodes
            
        return geometry

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