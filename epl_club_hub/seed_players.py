from db import clubs_collection, players_collection


players_data = {
    "Arsenal": [
        {
            "name": "Bukayo Saka",
            "number": 7,
            "position": "RW",
            "nationality": "England",
            "age": 24,
            "appearances": 28,
            "goals": 11,
            "assists": 9,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "Martin Odegaard",
            "number": 8,
            "position": "CM",
            "nationality": "Norway",
            "age": 26,
            "appearances": 30,
            "goals": 8,
            "assists": 10,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "Declan Rice",
            "number": 41,
            "position": "DM",
            "nationality": "England",
            "age": 27,
            "appearances": 31,
            "goals": 6,
            "assists": 7,
            "clean_sheets": 0,
            "image_url": ""
        }
    ],
    "Liverpool": [
        {
            "name": "Mohamed Salah",
            "number": 11,
            "position": "RW",
            "nationality": "Egypt",
            "age": 33,
            "appearances": 32,
            "goals": 20,
            "assists": 11,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "Virgil van Dijk",
            "number": 4,
            "position": "CB",
            "nationality": "Netherlands",
            "age": 34,
            "appearances": 31,
            "goals": 3,
            "assists": 2,
            "clean_sheets": 14,
            "image_url": ""
        },
        {
            "name": "Alexis Mac Allister",
            "number": 10,
            "position": "CM",
            "nationality": "Argentina",
            "age": 27,
            "appearances": 29,
            "goals": 5,
            "assists": 6,
            "clean_sheets": 0,
            "image_url": ""
        }
    ],
    "Tottenham Hotspur": [
        {
            "name": "Son Heung-min",
            "number": 7,
            "position": "LW",
            "nationality": "South Korea",
            "age": 33,
            "appearances": 30,
            "goals": 15,
            "assists": 8,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "James Maddison",
            "number": 10,
            "position": "AM",
            "nationality": "England",
            "age": 29,
            "appearances": 27,
            "goals": 7,
            "assists": 9,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "Cristian Romero",
            "number": 17,
            "position": "CB",
            "nationality": "Argentina",
            "age": 28,
            "appearances": 26,
            "goals": 2,
            "assists": 1,
            "clean_sheets": 9,
            "image_url": ""
        }
    ],
    "Manchester City": [
        {
            "name": "Erling Haaland",
            "number": 9,
            "position": "ST",
            "nationality": "Norway",
            "age": 25,
            "appearances": 29,
            "goals": 24,
            "assists": 4,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "Phil Foden",
            "number": 47,
            "position": "AM",
            "nationality": "England",
            "age": 26,
            "appearances": 30,
            "goals": 14,
            "assists": 7,
            "clean_sheets": 0,
            "image_url": ""
        },
        {
            "name": "Rodri",
            "number": 16,
            "position": "DM",
            "nationality": "Spain",
            "age": 29,
            "appearances": 28,
            "goals": 6,
            "assists": 5,
            "clean_sheets": 0,
            "image_url": ""
        }
    ]
}


if __name__ == "__main__":
    if players_collection.count_documents({}) > 0:
        print("이미 선수 데이터가 있습니다.")
    else:
        insert_list = []

        for club_name, players in players_data.items():
            club = clubs_collection.find_one({"name": club_name})

            if not club:
                print(f"{club_name} 구단을 찾을 수 없습니다.")
                continue

            club_id = str(club["_id"])

            for player in players:
                player["club_id"] = club_id
                insert_list.append(player)

        if insert_list:
            players_collection.insert_many(insert_list)
            print("선수 데이터 삽입 완료")
        else:
            print("삽입할 선수 데이터가 없습니다.")