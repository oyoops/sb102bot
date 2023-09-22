from location import Location
from building import Building
from density import get_density
from constants import FEET_IN_STORY, DEFAULT_RADIUS_IN_MILES, METERS_IN_MILE

# Main wrapper (called by api/building_height.py endpoint)
def get_building_height_from_input(input_data):
    if not input_data:
        return {"error": "Invalid input data."}
    result = main(input_data)
    response = {"result": result}
    return response

# TEST to eliminate main wrapper (called by api/building_height.py endpoint)
def get_building_height_from_input2(input_data):
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


# ---


# Utility to get latitude and longitude
def get_location_coordinates(input_data, loc_obj):
    try:
        lat, lon = map(float, input_data.split(','))
        print(f"Input Lat/Long: {round(lat, 5)}, {round(lon, 5)}")
    except ValueError:
        lat, lon = loc_obj.geocode_address()
        print(f"Geocoded Lat/Long: {round(lat, 5)}, {round(lon, 5)}")
    return lat, lon

# Function to get top buildings
def get_top_buildings(building_obj):
    buildings = building_obj.get_building_heights()
    return sorted(buildings, key=lambda x: float(x['height']), reverse=True)[:3]

# Function to print top buildings
def print_top_buildings(top_buildings, building_obj):
    for idx, building in enumerate(top_buildings):
        building_details = building_obj.get_detailed_building_info(building)
        print(f"\n  #{idx + 1}  Name:        {building_details['name']}")
        print(f"      Height:      {building_details['height']} feet")
        print(f"      Address:     {building_details['address']}")
        print(f"      Lat, Long:   {building_details['latitude']}, {building_details['longitude']}")
        print(f"      Distance:    {building_details['distance']} mi.")

# Function to get tallest building details
def get_tallest_building_details(buildings, building_obj):
    tallest_building = max(buildings, key=lambda x: float(x['height']))
    tallest_building_info = building_obj.get_building_info(tallest_building['id'], tallest_building['type'])
    tallest_bldg_name = tallest_building_info.get('Tags', {}).get('name', "Unknown")
    tallest_bldg_address = f"{tallest_building_info.get('Tags', {}).get('addr:housenumber', '-')}, {tallest_building_info.get('Tags', {}).get('addr:street', '')}"
    tallest_geometry = building_obj.fetch_geometry(tallest_building['id'], tallest_building['type'])
    tallest_building_lat, tallest_building_lon = tallest_geometry[0] if tallest_geometry and len(tallest_geometry) > 0 else (None, None)
    distance = Location.haversine_distance(building_obj.latitude, building_obj.longitude, tallest_building_lat, tallest_building_lon) if tallest_building_lat is not None and tallest_building_lon is not None else None
    distance = round(distance, 2) if distance else None
    
    return {
        "height": int(round(float(tallest_building['height']))),
        "address": tallest_bldg_address,
        "latitude": tallest_building_lat,
        "longitude": tallest_building_lon,
        "distance": distance,
        "building_name": tallest_bldg_name
    }


# ---


# Main script
def main(input_data):

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
    
    # Return results
    return {
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


# Script entry point
if __name__ == '__main__':
    main()
