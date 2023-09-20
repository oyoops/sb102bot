
# Define the max-density-per-acre dictionary
density_data = {
    "MIAMI-DADE": 50,
    "MIAMI-DADE COUNTY": 50,
    "MIAMI DADE COUNTY": 50,
    "MIAMI": 100,
    "MIAMI BEACH": 100,
    "FT. LAUDERDALE": 100,
    "FORT LAUDERDALE": 100,
    "FT LAUDERDALE": 100,
    "FORT LAUDERDALE": 100,
    "BROWARD": 50,
    "PALM BEACH": 50,
    "PALM BEACH COUNTY": 50,

    "MARTIN": 15,
    "MARTIN COUNTY": 15,
    "ST. LUCIE": 15,
    "ST LUCIE": 15,
    "ST. LUCIE COUNTY": 15,
    "ST LUCIE COUNTY": 15,
    "INDIAN RIVER": 15,
    "INDIAN RIVER COUNTY": 15,
    "OKEECHOBEE": 15,
    "OKEECHOBEE COUNTY": 15,
    "HENDRY": 15,
    "HENDRY COUNTY": 15,
    "GLADES": 15,
    "GLADES COUNTY": 15,
    "COLLIER": 15,
    "COLLIER COUNTY": 15,
    "LEE": 15,
    "LEE COUNTY": 15,
    "CHARLOTTE": 15,
    "CHARLOTTE COUNTY": 15,
    "DESOTO": 15,
    "DESOTO COUNTY": 15,
    "HIGHLANDS": 15,
    "HIGHLANDS COUNTY": 15,
    "HARDEE": 15,
    "HARDEE COUNTY": 15,
    "MANATEE": 15,
    "MANATEE COUNTY": 15,
    "SARASOTA": 15,
    "SARASOTA COUNTY": 15,
    "DE SOTO": 15,
    "DE SOTO COUNTY": 15,
    "PINELLAS": 15,
    "PINELLAS COUNTY": 15,
    "HILLSBOROUGH": 15,
    "HILLSBOROUGH COUNTY": 15,
    "PASCO": 15,
    "PASCO COUNTY": 15,
    "HERNANDO": 15,
    "HERNANDO COUNTY": 15,
    "CITRUS": 15,
    "CITRUS COUNTY": 15,
    "SUMTER": 15,
    "SUMTER COUNTY": 15,
    "LAKE": 15,
    "LAKE COUNTY": 15,
    "VOLUSIA": 15,

    "DAYTONA": 15,
    "DAYTONA BEACH": 15,
    "ORMOND": 15,
    "ORMOND BEACH": 15,
    "FLAGLER": 15,
    "FLAGLER COUNTY": 15,

    "JACKSONVILLE": 15,

    "TAMPA": 15,

    "ORLANDO": 15,

    "OCALA": 15,

    "GAINESVILLE": 15,

    "TALLAHASSEE": 15,

    "PENSACOLA": 15,

    "KEY WEST": 100,

    "KEY LARGO": 100,

    "MARATHON": 100,

    "ISLAMORADA": 100,

    "BIG PINE": 100,

    "BIG PINE KEY": 100,


    "STUART": 30,

    "PORT ST. LUCIE": 30,
    "PORT ST LUCIE": 30,
    "PORT SAINT LUCIE": 30,

    "FORT PIERCE": 30,

    "VERO BEACH": 30,

    "OKEECHOBEE": 30,

    "CLEWISTON": 30,

    "BELLE GLADE": 30,

    "PAHOKEE": 30,

    "SOUTH BAY": 30,

    "IMMOKALEE": 30,

    "NAPLES": 30,

    "FORT MYERS": 30,

    "CAPE CORAL": 30,

    "PUNTA GORDA": 30,

    "ARCADIA": 30,

    "BRADENTON": 30,

    "SARASOTA": 30,

    "VENICE": 30,

    "NORTH PORT": 30,

    "PORT CHARLOTTE": 30,

    "BROOKSVILLE": 30,

    "INVERNESS": 30,

    "BUSHNELL": 30,

    "LEESBURG": 30,

    "EUSTIS": 30,

    "DELAND": 30,

    "HOLLYWOOD": 100,
    "HOLLYWOOD BEACH": 100,
    
    "HALLANDALE": 100,
    "HALLANDALE BEACH": 100,

    "SUNNY ISLES": 100,
    "SUNNY ISLES BEACH": 100,

    "AVENTURA": 100,

    "NORTH MIAMI": 100,
    "NORTH MIAMI BEACH": 100,

    "MIAMI GARDENS": 100,

    "MIAMI LAKES": 100,

    "MIAMI SPRINGS": 100,

    "MIAMI SHORES": 100,

    "MIAMI BEACH": 100,

    "SURFSIDE": 100,

    "BAL HARBOUR": 100,

    "BAY HARBOR": 100,
    "BAY HARBOR ISLANDS": 100,

    "INDIAN CREEK": 100,

    "SOUTH MIAMI": 100,

    "CORAL GABLES": 100,

    "COCONUT GROVE": 100,
    
    "KEY BISCAYNE": 100,

    "PINECREST": 100,

    "PALMETTO BAY": 100,

    "CUTLER BAY": 100,

    "HOMESTEAD": 100,

    "FLORIDA CITY": 100,

    "SWEETWATER": 100,

    "WEST MIAMI": 100,

    "MIAMI": 100,
    
    "ST. PETE": 80,
    "ST PETE": 80,
    "ST. PETERSBURG": 80,
    "ST PETERSBURG": 80,
    "ST. AUGUSTINE": 50,

}

def get_density(location: str) -> int:
    """Retrieve the density per acre for a given location."""
    # Convert the location to uppercase to match the dictionary keys
    location = location.upper()
    
    # Printing the received location and the resulting density value
    density_val = density_data.get(location, 0)
    print(f"Location Received: {location}, Density Value: {density_val}")
    
    # Return the density value
    return density_val

