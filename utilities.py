# Get a value from a nested dictionary, even if the key doesn't exist
def safe_get(dictionary, keys, default=None):
    """
    A helper function to safely get a value from a nested dictionary.
    """
    for key in keys:
        if key in dictionary:
            dictionary = dictionary[key]
        else:
            return default
    return dictionary

# Get coord pair from geometry
def calculate_centroid(geometry):
    """
    Get the centroid from a geometry list.
    """
    # If the geometry list is not empty, return the first coordinate pair
    if geometry and isinstance(geometry, list) and isinstance(geometry[0], tuple) and len(geometry[0]) >= 2:
        return geometry[0]
    return None, None
