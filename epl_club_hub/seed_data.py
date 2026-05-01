from db import clubs_collection

clubs_data = [
    {
        "name": "Arsenal",
        "short_name": "ARS",
        "stadium": "Emirates Stadium",
        "manager": "Mikel Arteta",
        "founded_year": 1886,
        "description": "북런던을 연고로 하는 프리미어리그 구단.",
        "logo_url": ""
    },
    {
        "name": "Aston Villa",
        "short_name": "AVL",
        "stadium": "Villa Park",
        "manager": "Unai Emery",
        "founded_year": 1874,
        "description": "버밍엄을 연고로 하는 전통 있는 구단.",
        "logo_url": ""
    },
    {
        "name": "Bournemouth",
        "short_name": "BOU",
        "stadium": "Vitality Stadium",
        "manager": "Andoni Iraola",
        "founded_year": 1899,
        "description": "공격적인 플레이 스타일로 주목받는 구단.",
        "logo_url": ""
    },
    {
        "name": "Brentford",
        "short_name": "BRE",
        "stadium": "Gtech Community Stadium",
        "manager": "Thomas Frank",
        "founded_year": 1889,
        "description": "데이터 기반 운영으로 유명한 런던 구단.",
        "logo_url": ""
    },
    {
        "name": "Brighton & Hove Albion",
        "short_name": "BHA",
        "stadium": "Amex Stadium",
        "manager": "Fabian Hurzeler",
        "founded_year": 1901,
        "description": "전술적인 축구와 유망주 발굴로 유명한 구단.",
        "logo_url": ""
    },
    {
        "name": "Burnley",
        "short_name": "BUR",
        "stadium": "Turf Moor",
        "manager": "Scott Parker",
        "founded_year": 1882,
        "description": "오랜 역사를 가진 잉글랜드 전통 구단.",
        "logo_url": ""
    },
    {
        "name": "Chelsea",
        "short_name": "CHE",
        "stadium": "Stamford Bridge",
        "manager": "Enzo Maresca",
        "founded_year": 1905,
        "description": "런던을 대표하는 빅클럽 중 하나.",
        "logo_url": ""
    },
    {
        "name": "Crystal Palace",
        "short_name": "CRY",
        "stadium": "Selhurst Park",
        "manager": "Oliver Glasner",
        "founded_year": 1905,
        "description": "강한 조직력과 홈 분위기로 유명한 구단.",
        "logo_url": ""
    },
    {
        "name": "Everton",
        "short_name": "EVE",
        "stadium": "Goodison Park",
        "manager": "David Moyes",
        "founded_year": 1878,
        "description": "리버풀을 연고로 하는 전통적인 구단.",
        "logo_url": ""
    },
    {
        "name": "Fulham",
        "short_name": "FUL",
        "stadium": "Craven Cottage",
        "manager": "Marco Silva",
        "founded_year": 1879,
        "description": "템스강 근처의 아름다운 홈구장으로 유명한 구단.",
        "logo_url": ""
    },
    {
        "name": "Leeds United",
        "short_name": "LEE",
        "stadium": "Elland Road",
        "manager": "Daniel Farke",
        "founded_year": 1919,
        "description": "열정적인 팬층을 가진 요크셔 지역의 명문 구단.",
        "logo_url": ""
    },
    {
        "name": "Liverpool",
        "short_name": "LIV",
        "stadium": "Anfield",
        "manager": "Arne Slot",
        "founded_year": 1892,
        "description": "세계적으로 인기 많은 명문 구단.",
        "logo_url": ""
    },
    {
        "name": "Manchester City",
        "short_name": "MCI",
        "stadium": "Etihad Stadium",
        "manager": "Pep Guardiola",
        "founded_year": 1880,
        "description": "현대 축구 전술의 대표적인 강팀.",
        "logo_url": ""
    },
    {
        "name": "Manchester United",
        "short_name": "MUN",
        "stadium": "Old Trafford",
        "manager": "Ruben Amorim",
        "founded_year": 1878,
        "description": "잉글랜드를 대표하는 세계적인 명문 구단.",
        "logo_url": ""
    },
    {
        "name": "Newcastle United",
        "short_name": "NEW",
        "stadium": "St James' Park",
        "manager": "Eddie Howe",
        "founded_year": 1892,
        "description": "강한 팬 문화와 열정으로 유명한 구단.",
        "logo_url": ""
    },
    {
        "name": "Nottingham Forest",
        "short_name": "NFO",
        "stadium": "City Ground",
        "manager": "Nuno Espirito Santo",
        "founded_year": 1865,
        "description": "유럽 무대 전통을 가진 역사적인 구단.",
        "logo_url": ""
    },
    {
        "name": "Sunderland",
        "short_name": "SUN",
        "stadium": "Stadium of Light",
        "manager": "Regis Le Bris",
        "founded_year": 1879,
        "description": "북동부 지역의 상징적인 구단 중 하나.",
        "logo_url": ""
    },
    {
        "name": "Tottenham Hotspur",
        "short_name": "TOT",
        "stadium": "Tottenham Hotspur Stadium",
        "manager": "Thomas Frank",
        "founded_year": 1882,
        "description": "북런던을 연고로 하는 인기 구단.",
        "logo_url": ""
    },
    {
        "name": "West Ham United",
        "short_name": "WHU",
        "stadium": "London Stadium",
        "manager": "Graham Potter",
        "founded_year": 1895,
        "description": "런던 동부를 대표하는 전통 구단.",
        "logo_url": ""
    },
    {
        "name": "Wolverhampton Wanderers",
        "short_name": "WOL",
        "stadium": "Molineux Stadium",
        "manager": "Vitor Pereira",
        "founded_year": 1877,
        "description": "울버햄프턴을 연고로 하는 전통 구단.",
        "logo_url": ""
    }
]

if __name__ == "__main__":
    if clubs_collection.count_documents({}) == 0:
        clubs_collection.insert_many(clubs_data)
        print("EPL 20개 구단 데이터 삽입 완료")
    else:
        print("이미 데이터가 있습니다.")