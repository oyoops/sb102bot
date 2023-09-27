import psycopg2

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

# Step 1: Create the Unified Parcels Table
cur.execute("""
    CREATE TABLE parcels_master AS 
    SELECT * 
    FROM parcels_broward 
    WHERE 1=0;
""")

# Step 2: Add a New Column for Unique gid Values
cur.execute("""
    ALTER TABLE parcels_master ADD COLUMN new_gid SERIAL;
""")

# Step 3: Copy Data from Each County Table to the Master Table
cur.execute("""
    DO $$
    DECLARE
        tbl_name text;
    BEGIN
        FOR tbl_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'parcels_%')
        LOOP
            EXECUTE 'INSERT INTO parcels_master(parcelno, geom, county_name, new_gid) SELECT parcelno, geom, county_name, nextval(''parcels_master_new_gid_seq'') FROM ' || tbl_name;
        END LOOP;
    END $$;
""")

# Step 4: Reorganize gid in the Master Table
cur.execute("""
    ALTER TABLE parcels_master DROP COLUMN gid;
    ALTER TABLE parcels_master RENAME COLUMN new_gid TO gid;
    ALTER TABLE parcels_master ADD PRIMARY KEY (gid);
""")

# Step 5: Create the Spatial Index
cur.execute("""
    CREATE INDEX idx_parcels_master_geom ON parcels_master USING gist(geom);
""")

# Commit the changes and close the connection
conn.commit()
cur.close()
conn.close()
