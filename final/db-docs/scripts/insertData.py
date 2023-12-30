import json
import sys
from operator import itemgetter

import psycopg2

json_files = [
    "../json-data/daan-district-restaurants.json",
    "../json-data/zhongzheng-district-restaurants.json",
]
blacklisted_types = ["food", "point_of_interest", "establishment"]
types_list = []


def insertData(conn, inputFile):
    try:
        print("Inserting " + inputFile + "...")
        with open(inputFile, "r", encoding="utf-8") as file:
            restaurants = json.load(file)
        for restaurant in restaurants:
            try:
                cur = conn.cursor()
                placeId, name, address, location, types, openingHours = itemgetter(
                    "placeId", "title", "address", "location", "types", "openingHours"
                )(restaurant)
                cur.execute(
                    """
                    INSERT INTO restaurants (placeId, name, address, latitude, longitude) 
                    VALUES (%s, %s, %s, %s, %s);
                    """,
                    (
                        placeId,
                        name,
                        address,
                        float(location.get("lat")),
                        float(location.get("lng")),
                    ),
                )
                for type in types:
                    if type not in blacklisted_types:
                        cur.execute(
                            """
                            INSERT INTO restaurantTypes (placeId, type) 
                            VALUES (%s, %s);
                            """,
                            (placeId, type),
                        )
                        if type not in types_list:
                            types_list.append(type)
                for openingHour in openingHours:
                    cur.execute(
                        """
                        INSERT INTO openingHours (placeId, day, hours) 
                        VALUES (%s, %s, %s);
                        """,
                        (placeId, openingHour.get("day"), openingHour.get("hours")),
                    )
                conn.commit()
            except Exception as error:
                print("Violating placeId:", placeId)
                print("Rolling back due to error: ", error)
                conn.rollback()
            finally:
                cur.close()
        print(inputFile + "inserted successfully.")
    except Exception as error:
        print("An error occurred:", error)


def main():
    if len(sys.argv) < 4:
        print("Missing arguments")
        return
    with open(json_files[0], "r", encoding="utf-8") as file:
        restaurants = json.load(file)
    try:
        conn = psycopg2.connect(
            f"dbname='{sys.argv[1]}' user='{sys.argv[2]}' host='{sys.argv[3]}' password='{sys.argv[4]}' port='5432' sslmode='require'"
        )
        for inputFile in json_files:
            insertData(conn, inputFile)
        print("Full list of types:", types_list)
        conn.close()
    except Exception as error:
        print(error)


if __name__ == "__main__":
    main()
