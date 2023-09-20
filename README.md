 <|>===========<|>
 <|>  Outline  <|>
 <|>===========<|>


>> MAIN_LOGIC.py
  Main Logic and Execution
  
    - main(input_data)
    - get_building_height_from_input(input_data)
    - main_script()


>> CONSTANTS.py
  Constants:
  
      (constants stay in main, ensuring they're accessible to all modules)


>> UTILITIES.py
  Utility Functions:
  
    - safe_get(dictionary, keys, default=None)
    - calculate_centroid(geometry)


>> LOCATION.py
  Geocoding and Location Information:
  
    - geocode_address(address)
    - get_city_and_county(lat, lon)
    - haversine_distance(lat1, lon1, lat2, lon2)


>> BUILDING.py
  Building Information:
  
    - get_building_heights(lat, lon, radius_meters = METERS_IN_MI * RADIUS_MI)
    - get_building_info(building_id, building_type='way')
    - fetch_geometry(osm_id, osm_type)
