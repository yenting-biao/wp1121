#you can get all restaurant types with a click!
import json
import requests

# Replace with your Google Maps API Key
GOOGLE_MAPS_API_KEY = 'API_KEY'

def get_restaurant_type(place_id, api_key):
    base_url = f"https://places.googleapis.com/v1/places/{place_id}"
    params = {
        "fields": "id,displayName,formattedAddress,types",
        "key": api_key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json().get('types', [])
    else:
        print(f"Failed to get data for placeId {place_id}: {response.text}")
        return []

def main():
    input_filename = 'input.json'
    output_filename = 'output.json'

    with open(input_filename, 'r', encoding='utf-8') as file:
        restaurants = json.load(file)

    for restaurant in restaurants:
        place_id = restaurant.get('placeId')
        if place_id:
            types = get_restaurant_type(place_id, GOOGLE_MAPS_API_KEY)
            restaurant['types'] = types

    with open(output_filename, 'w', encoding='utf-8') as file:
        json.dump(restaurants, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()
