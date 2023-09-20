import requests
import xml.etree.ElementTree as ET
from constants import METERS_IN_MILE, DEFAULT_RADIUS_IN_MILES

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
