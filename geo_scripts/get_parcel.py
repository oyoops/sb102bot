import psycopg2

def get_parcel_info(latitude, longitude):
    # Database connection parameters
    db_params = {
        "dbname": "YOUR_DATABASE_NAME",
        "user": "YOUR_USERNAME",
        "password": "YOUR_PASSWORD",
        "host": "YOUR_HOST",
        "port": "YOUR_PORT"
    }

    # Connect to the database
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor()

    # SQL query to get parcel info based on lat and long
    query = f"""
    SELECT p.parcelno, f.area_median_income, p.county_name 
    FROM parcels_master p 
    JOIN florida_counties f ON p.county_name = f.county_name
    WHERE ST_Contains(p.geom, ST_SetSRID(ST_MakePoint({longitude}, {latitude}), 4326))
    LIMIT 1;
    """

    # Execute the query
    cur.execute(query)
    result = cur.fetchone()

    # Close the connection
    cur.close()
    conn.close()

    # Return the result
    return {
        "parcelno": result[0],
        "area_median_income": result[1],
        "county_name": result[2]
    }

# Test the function
info = get_parcel_info(27.1975, -80.2528)
print(info)
