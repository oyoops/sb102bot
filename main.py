from location import Location
from building import Building
from density import get_density
from constants import FEET_IN_STORY, DEFAULT_RADIUS_IN_MILES, METERS_IN_MILE

# Main wrapper
def get_building_height_from_input(input_data):
    if not input_data:
        return {"error": "Invalid input data."}
    result = main(input_data)
    response = {"result": result}
    return response

# MAIN
def main(input_data):
    print(f"\n--------------------------------------------------------------------------------------\n\nSEARCHING...")
    
    loc = Location(input_data)
    
    # Check whether input_data is in the format of a COORDINATE PAIR or an ADDRESS
    try:
        lat, lon = map(float, input_data.split(','))
        print(f"Input Lat/Long:    {round(float(lat),5)}, {round(float(lon),5)}") 
    except ValueError:
        lat, lon = loc.geocode_address()
        print(f"Geocoded Lat/Long:    {round(float(lat),5)}, {round(float(lon),5)}")
    
    # If both input verification checks fail to yield a subject location, then ignore/override user input, use default coordinates
    if lat is None or lon is None:
        print("    ***********\n   **  ERROR  **   Failed to locate subject site...\n    ***********    Using example coordinates instead.")
        lat, lon = 26.032865, -80.114964  # Example: Villas of Positano (along north Broadwalk in Hollywood Beach)

    # Update the loc object's latitude and longitude
    loc.latitude = lat
    loc.longitude = lon

    # Print the location of the subject property
    print(f"\nSUBJECT PROPERTY:")
    print(f"      Lat/Long:    {round(float(lat),5)}, {round(float(lon),5)}")    
    # Get the city and county
    city, county = loc.get_city_and_county()
    if city:
        print(f"      City:        {city}")
    if county:
        print(f"      County:      {county}\n")

    building_obj = Building(lat, lon)
    buildings = building_obj.get_building_heights()
    
    # Get the three tallest buildings within the radius
    top_buildings = sorted(buildings, key=lambda x: float(x['height']), reverse=True)[:3]
    if len(top_buildings) == 0:
        print(f"RESULTS:\n  No buildings were found within a mile of your site!")
        return
    elif len(top_buildings) == 1:
        print(f"RESULTS:\n  (only {len(top_buildings)} building found)")
    elif len(top_buildings) > 1 and len(buildings) == len(top_buildings):
        print(f"RESULTS:\n  (showing all {len(top_buildings)} buildings found)")
    elif len(buildings) != len(top_buildings):
        print(f"RESULTS:\n  (showing tallest {len(top_buildings)} of the {len(buildings)} total buildings found)")
    else:
        print(f"RESULTS:\n\n  <<-- WARNING! -->>\n\n  (showing only the tallest {len(top_buildings)} of {len(buildings)} buildings found)")

    # Iterate through the top 3 tallest buildings in the results
    for idx, building in enumerate(top_buildings):

        # Convert meters to feet
        building['height'] = float(building['height']) * 3.28084
        
        # Estimate stories. We are only concerned with the tallest building; since the list is already sorted by descending height, calculate approx_stories only once (in the first iteration)
        if idx == 0: approx_stories = int(building['height'] / FEET_IN_STORY)  # Assume 10.5ft/story
        
        # Round down height in feet
        building['height'] = int(building['height'])

        # Get building info
        binfo = building_obj.get_building_info(building['id'], building['type'])

        # Default to getting the building's lat/long from its geometry, if available
        geometry = building_obj.fetch_geometry(building['id'], building['type'])
        if geometry and len(geometry) > 0:
            # Use the first coordinate pair from the geometry as the building's location
            building_lat, building_lon = geometry[0]
            building_lat = round(building_lat, 5)
            building_lon = round(building_lon, 5)
        elif binfo['Latitude'] is not None and binfo['Longitude'] is not None:
            # If geometry is not available but exact coordinates are, use them
            building_lat = round(float(binfo['Latitude']), 5)
            building_lon = round(float(binfo['Longitude']), 5)
        else:
            # If neither geometry nor exact coordinates are available, set to None
            building_lat = None
            building_lon = None

        # Get building info from OSM    --->  MOSTLY USELESS!!  <---
        bldg_name = binfo.get('Tags', {}).get('name', "-")
        bldg_address = f"{binfo.get('Tags', {}).get('addr:housenumber', '-')} {binfo.get('Tags', {}).get('addr:street', '')}"

        # Calculate distance between site and building, if possible
        if building_lat is not None and building_lon is not None:
            distance = Location.haversine_distance(lat, lon, building_lat, building_lon)

            distance_str = "Very close to subject (<0.01 mi.)" if distance < 0.01 else f"{distance:.2f} mi. from subject"
        else:
            distance_str = "Distance not available"

        # Print a summary of the three tallest buildings found
        print(f"\n  #{idx + 1}  Name:        {bldg_name}")
        print(f"      Height:      {building['height']} feet")
        print(f"      Address:     {bldg_address}")
        if building_lat and building_lon:
            print(f"      Lat, Long:   {building_lat}, {building_lon}")
        else:
            print(f"      Lat, Long:   ** Not available **")
        print(f"      Distance:    {distance_str}")

    # Fancy print of final result
    print(f"\n .--------------------------------------------------------------------------------.      ")
    print(f" |  Live Local Act allows for a building height of up to {round(approx_stories * FEET_IN_STORY,0)} feet (~{approx_stories} stories)   |")
    print(f" '--------------------------------------------------------------------------------'     \n\n")
    
    ##bldg_address = f"{bldg_info.get('Tags', {}).get('addr:housenumber', '-')} {bldg_info.get('Tags', {}).get('addr:street', '')}"



    # Get only the tallest building within the radius
    tallest_building = max(buildings, key=lambda x: float(x['height']))
    tallest_building_info = building_obj.get_building_info(tallest_building['id'], tallest_building['type'])
    # Find its name, if it has one
    tallest_bldg_name = tallest_building_info.get('Tags', {}).get('name', None)
    # Fix name if '-' or missing
    if not tallest_bldg_name or tallest_bldg_name == "-":
        tallest_bldg_name = "Unknown"
    # Find its address
    tallest_bldg_address = f"{tallest_building_info.get('Tags', {}).get('addr:housenumber', '-')} {tallest_building_info.get('Tags', {}).get('addr:street', '')}"
    
    # Find its lat/long, if available (default: first point in its OSM geometry)
    tallest_geometry = building_obj.fetch_geometry(tallest_building['id'], tallest_building['type'])
    if tallest_geometry and len(tallest_geometry) > 0:
        # Use the first coordinate pair from the geometry as the building's location
        tallest_building_lat, tallest_building_lon = tallest_geometry[0]
        tallest_building_lat = round(tallest_building_lat, 5)
        tallest_building_lon = round(tallest_building_lon, 5)
    elif tallest_building_info['Latitude'] is not None and tallest_building_info['Longitude'] is not None:
        # If geometry is not available but exact coordinates are, use them
        tallest_building_lat = round(float(tallest_building_info['Latitude']), 5)
        tallest_building_lon = round(float(tallest_building_info['Longitude']), 5)
    else:
        # If neither geometry nor exact coordinates are available, set to None
        tallest_building_lat = None
        tallest_building_lon = None


    # Calculate distance between subject site and the tallest building, if possible
    if tallest_building_lat is not None and tallest_building_lon is not None:
        distance = Location.haversine_distance(lat, lon, tallest_building_lat, tallest_building_lon)
        distance = round(distance, 2)
    else:
        distance = None

    # Lookup max density in our density table
    max_density = get_density(city) if city is not None else get_density(county)

    # Return the necessary info
    return {
        "location": loc, # the object itself
        "height": int(tallest_building['height']),
        "address": tallest_bldg_address,
        "latitude": tallest_building_lat,
        "longitude": tallest_building_lon,
        "city": city,
        "county": county,
        "density": max_density,
        "distance": distance,
        "building_name": tallest_bldg_name
    }

##########################################################################################

# Wrapper of the wrapper of main
def main_script():
    input_data = input("Please enter an address (or lat,long coords): ")
    result = get_building_height_from_input(input_data)
    print(result['result'])

##########################################################################################

if __name__ == '__main__':
    main_script()
