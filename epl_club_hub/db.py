from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"

client = MongoClient(MONGO_URL)
db = client["epl_club_hub"]

clubs_collection = db["clubs"]
players_collection = db["players"]

comments_collection = db["comments"]

users_collection =db["users"]
favorites_collection = db["favorites"]

comments_collection = db["comments"]
users_collection = db["users"]
favorites_collection = db["favorites"]
news_collection = db["news"]
community_posts_collection = db["community_posts"]
community_comments_collection = db["community_comments"]