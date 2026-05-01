import os
import hashlib
import binascii
import shutil
import uuid

from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, Request, Form, HTTPException, UploadFile, File
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from datetime import datetime, timedelta

from db import (
    clubs_collection,
    players_collection,
    comments_collection,
    users_collection,
    favorites_collection,
    news_collection,
    community_posts_collection,
    community_comments_collection,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key="epl-club-hub-admin-secret-key",
    session_cookie="epl_admin_session",
    same_site="lax",
    https_only=False,
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
NEWS_UPLOAD_DIR = os.path.join("static", "uploads", "news")
os.makedirs(NEWS_UPLOAD_DIR, exist_ok=True)

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "1234"


# -------------------------
# Pydantic models
# -------------------------
class SignupPayload(BaseModel):
    username: str
    email: str
    password: str


class LoginPayload(BaseModel):
    email: str
    password: str


class FavoriteTeamPayload(BaseModel):
    club_id: str


class NewsSubmissionPayload(BaseModel):
    title: str
    summary: str
    category: str
    image_url: str = ""
    content: str
    source_name: str
    source_url: str


class NewsStatusPayload(BaseModel):
    status: str

class CommunityPostPayload(BaseModel):
    title: str
    content: str
    board_type: str = "general"
    club_id: str = ""


class CommunityPostEditPayload(BaseModel):
    title: str
    content: str


# -------------------------
# util functions
# -------------------------
def convert_object_id(document):
    document["_id"] = str(document["_id"])
    return document


def serialize_club(club):
    return {
        "id": str(club["_id"]),
        "name": club.get("name", ""),
        "short_name": club.get("short_name", ""),
        "stadium": club.get("stadium", ""),
        "manager": club.get("manager", ""),
        "founded_year": club.get("founded_year", ""),
        "description": club.get("description", ""),
        "history": club.get("history", ""),
        "logo_url": club.get("logo_url", ""),
        "home_kit_url": club.get("home_kit_url", ""),
        "away_kit_url": club.get("away_kit_url", ""),
        "third_kit_url": club.get("third_kit_url", ""),
    }


def serialize_player(player, club_name=""):
    return {
        "id": str(player["_id"]),
        "club_id": player.get("club_id", ""),
        "name": player.get("name", ""),
        "number": player.get("number", 0),
        "position": player.get("position", ""),
        "nationality": player.get("nationality", ""),
        "age": player.get("age", 0),
        "appearances": player.get("appearances", 0),
        "goals": player.get("goals", 0),
        "assists": player.get("assists", 0),
        "clean_sheets": player.get("clean_sheets", 0),
        "image_url": player.get("image_url", ""),
        "club_name": club_name,
    }


def serialize_comment(comment):
    return {
        "id": str(comment["_id"]),
        "news_id": comment.get("news_id", ""),
        "user_id": comment.get("user_id", ""),
        "username": comment.get("username", comment.get("nickname", "")),
        "content": comment.get("content", ""),
        "created_at": comment.get("created_at", ""),
    }


def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
    }


def serialize_news(news):
    return {
        "id": str(news["_id"]),
        "title": news.get("title", ""),
        "summary": news.get("summary", ""),
        "category": news.get("category", ""),
        "image_url": news.get("image_url", ""),
        "content": news.get("content", ""),
        "is_featured": news.get("is_featured", False),
        "created_at": news.get("created_at", ""),
        "status": news.get("status", "approved"),
        "source_name": news.get("source_name", ""),
        "source_url": news.get("source_url", ""),
        "author_user_id": news.get("author_user_id", ""),
        "author_username": news.get("author_username", ""),
        "submission_type": news.get("submission_type", "official"),
    }

def serialize_community_post(post):
    return {
        "id": str(post["_id"]),
        "title": post.get("title", ""),
        "content": post.get("content", ""),
        "board_type": post.get("board_type", "general"),
        "club_id": post.get("club_id", ""),
        "author_user_id": post.get("author_user_id", ""),
        "author_username": post.get("author_username", ""),
        "created_at": post.get("created_at", ""),
        "updated_at": post.get("updated_at", ""),
        "likes_count": post.get("likes_count", 0),
        "views": post.get("views", 0),
    }

def serialize_community_comment(comment):
    return {
        "id": str(comment["_id"]),
        "post_id": comment.get("post_id", ""),
        "author_user_id": comment.get("author_user_id", ""),
        "author_username": comment.get("author_username", ""),
        "content": comment.get("content", ""),
        "created_at": comment.get("created_at", ""),
    }

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000,
    )
    return f"{binascii.hexlify(salt).decode()}${binascii.hexlify(hashed).decode()}"


def verify_password(password: str, stored_password: str) -> bool:
    try:
        salt_hex, hashed_hex = stored_password.split("$")
        salt = binascii.unhexlify(salt_hex.encode())
        hashed = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100000,
        )
        return binascii.hexlify(hashed).decode() == hashed_hex
    except Exception:
        return False


def is_admin_logged_in(request: Request) -> bool:
    return request.session.get("is_admin", False) is True


def admin_guard(request: Request):
    if not is_admin_logged_in(request):
        return RedirectResponse(url="/admin/login", status_code=303)
    return None


def get_current_user(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return None

    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

    if not user:
        return None

    return serialize_user(user)

def save_news_image(image_file: UploadFile | None) -> str:
    if not image_file or not image_file.filename:
        return ""

    ext = os.path.splitext(image_file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(NEWS_UPLOAD_DIR, filename)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(image_file.file, buffer)

    return f"/static/uploads/news/{filename}"


# -------------------------
# mock data for portal home
# -------------------------
HOME_TABLE_MOCK = [
    {"rank": 1, "club": "Liverpool", "played": 33, "points": 79},
    {"rank": 2, "club": "Arsenal", "played": 33, "points": 71},
    {"rank": 3, "club": "Manchester City", "played": 33, "points": 64},
    {"rank": 4, "club": "Newcastle United", "played": 33, "points": 62},
    {"rank": 5, "club": "Chelsea", "played": 33, "points": 60},
    {"rank": 6, "club": "Nottingham Forest", "played": 33, "points": 60},
    {"rank": 7, "club": "Aston Villa", "played": 34, "points": 57},
    {"rank": 8, "club": "Fulham", "played": 33, "points": 51},
]

HOME_RECENT_MATCHES_MOCK = [
    {"home": "Arsenal", "away": "Chelsea", "score": "2 - 1", "status": "FT"},
    {"home": "Liverpool", "away": "Tottenham", "score": "3 - 1", "status": "FT"},
    {"home": "Manchester City", "away": "Brighton", "score": "2 - 2", "status": "FT"},
    {"home": "Newcastle United", "away": "Aston Villa", "score": "1 - 0", "status": "FT"},
]


# -------------------------
# HTML routes
# -------------------------

@app.get("/")
def home():
    return RedirectResponse(url="http://localhost:5173/", status_code=307)



@app.get("/clubs/{club_id}", response_class=HTMLResponse)
def club_detail(club_id: str, request: Request):
    try:
        club = clubs_collection.find_one({"_id": ObjectId(club_id)})
    except Exception:
        return HTMLResponse(content="Club not found", status_code=404)

    if not club:
        return HTMLResponse(content="Club not found", status_code=404)

    club = convert_object_id(club)

    players = list(players_collection.find({"club_id": club_id}))
    players = [convert_object_id(player) for player in players]

    return templates.TemplateResponse(
        request=request,
        name="club_detail.html",
        context={
            "club": club,
            "players": players,
            "is_admin": is_admin_logged_in(request),
        },
    )


@app.get("/players/{player_id}", response_class=HTMLResponse)
def player_detail(player_id: str, request: Request):
    try:
        object_id = ObjectId(player_id)
    except Exception:
        return HTMLResponse(content="Invalid player id", status_code=404)

    player = players_collection.find_one({"_id": object_id})

    if not player:
        return HTMLResponse(content="Player not found in DB", status_code=404)

    player = convert_object_id(player)

    club = None
    if player.get("club_id"):
        try:
            club = clubs_collection.find_one({"_id": ObjectId(player["club_id"])})
        except Exception:
            club = None

    if club:
        club = convert_object_id(club)

    return templates.TemplateResponse(
        request=request,
        name="player_detail.html",
        context={
            "player": player,
            "club": club,
            "is_admin": is_admin_logged_in(request),
        },
    )


# -------------------------
# 관리자 로그인 / 로그아웃
# -------------------------
@app.get("/admin/login", response_class=HTMLResponse)
def admin_login_page(request: Request, error: str = ""):
    if is_admin_logged_in(request):
        return RedirectResponse(url="/admin", status_code=303)

    return templates.TemplateResponse(
        request=request,
        name="admin_login.html",
        context={"error": error},
    )


@app.post("/admin/login")
def admin_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        request.session["is_admin"] = True
        request.session["admin_username"] = username
        return RedirectResponse(url="/admin", status_code=303)

    return RedirectResponse(
        url="/admin/login?error=아이디 또는 비밀번호가 틀렸습니다.",
        status_code=303,
    )


@app.get("/admin/logout")
def admin_logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="http://localhost:5173/", status_code=303)


# -------------------------
# 관리자 대시보드
# -------------------------
@app.get("/admin", response_class=HTMLResponse)
def admin_dashboard(request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    clubs_count = clubs_collection.count_documents({})
    players_count = players_collection.count_documents({})

    recent_players = list(players_collection.find().sort("_id", DESCENDING).limit(10))
    recent_players = [convert_object_id(player) for player in recent_players]

    club_map = {}
    clubs = list(clubs_collection.find())
    clubs = [convert_object_id(club) for club in clubs]
    for club in clubs:
        club_map[club["_id"]] = club["name"]

    for player in recent_players:
        player["club_name"] = club_map.get(player["club_id"], "Unknown Club")

    return templates.TemplateResponse(
        request=request,
        name="admin_dashboard.html",
        context={
            "clubs_count": clubs_count,
            "players_count": players_count,
            "recent_players": recent_players,
            "admin_username": request.session.get("admin_username", "admin"),
        },
    )


# -------------------------
# 관리자 뉴스 승인 / 구단 관리
# -------------------------
@app.get("/admin/news/pending", response_class=HTMLResponse)
def admin_news_pending_page(request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    pending_items = list(
        news_collection.find({"status": "pending"}).sort("_id", DESCENDING)
    )
    pending_items = [serialize_news(item) for item in pending_items]

    return templates.TemplateResponse(
        request=request,
        name="admin_news_pending.html",
        context={"pending_items": pending_items},
    )


@app.post("/admin/news/{news_id}/approve")
def admin_news_approve(news_id: str, request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(news_id)
    except Exception:
        return HTMLResponse(content="Invalid news id", status_code=404)

    news_collection.update_one(
        {"_id": object_id},
        {"$set": {"status": "approved"}},
    )

    return RedirectResponse(url="/admin/news/pending", status_code=303)


@app.post("/admin/news/{news_id}/reject")
def admin_news_reject(news_id: str, request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(news_id)
    except Exception:
        return HTMLResponse(content="Invalid news id", status_code=404)

    news_collection.update_one(
        {"_id": object_id},
        {"$set": {"status": "rejected"}},
    )

    return RedirectResponse(url="/admin/news/pending", status_code=303)


@app.get("/admin/clubs", response_class=HTMLResponse)
def admin_clubs_list(request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    clubs = list(clubs_collection.find().sort("name", ASCENDING))
    clubs = [convert_object_id(club) for club in clubs]

    return templates.TemplateResponse(
        request=request,
        name="admin_clubs_list.html",
        context={"clubs": clubs},
    )


@app.get("/admin/clubs/{club_id}/edit", response_class=HTMLResponse)
def admin_club_edit_form(club_id: str, request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        club = clubs_collection.find_one({"_id": ObjectId(club_id)})
    except Exception:
        return HTMLResponse(content="Club not found", status_code=404)

    if not club:
        return HTMLResponse(content="Club not found", status_code=404)

    club = convert_object_id(club)

    return templates.TemplateResponse(
        request=request,
        name="admin_club_form.html",
        context={"club": club},
    )


@app.post("/admin/clubs/{club_id}/edit")
def admin_club_update(
    club_id: str,
    request: Request,
    name: str = Form(...),
    short_name: str = Form(""),
    manager: str = Form(""),
    stadium: str = Form(""),
    founded_year: str = Form(""),
    description: str = Form(""),
    history: str = Form(""),
    logo_url: str = Form(""),
    home_kit_url: str = Form(""),
    away_kit_url: str = Form(""),
    third_kit_url: str = Form(""),
):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(club_id)
    except Exception:
        return HTMLResponse(content="Invalid club id", status_code=404)

    clubs_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "name": name,
                "short_name": short_name,
                "manager": manager,
                "stadium": stadium,
                "founded_year": founded_year,
                "description": description,
                "history": history,
                "logo_url": logo_url,
                "home_kit_url": home_kit_url,
                "away_kit_url": away_kit_url,
                "third_kit_url": third_kit_url,
            }
        },
    )

    return RedirectResponse(url="/admin/clubs", status_code=303)


# -------------------------
# 선수 추가 / 수정 / 삭제
# -------------------------
@app.get("/admin/players/new", response_class=HTMLResponse)
def new_player_form(request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    clubs = list(clubs_collection.find())
    clubs = [convert_object_id(club) for club in clubs]

    return templates.TemplateResponse(
        request=request,
        name="player_form.html",
        context={
            "clubs": clubs,
        },
    )


@app.post("/admin/players/new")
def create_player(
    request: Request,
    club_id: str = Form(...),
    name: str = Form(...),
    number: int = Form(...),
    position: str = Form(...),
    nationality: str = Form(...),
    age: int = Form(...),
    appearances: int = Form(0),
    goals: int = Form(0),
    assists: int = Form(0),
    clean_sheets: int = Form(0),
    image_url: str = Form(""),
):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    new_player = {
        "club_id": club_id,
        "name": name,
        "number": number,
        "position": position,
        "nationality": nationality,
        "age": age,
        "appearances": appearances,
        "goals": goals,
        "assists": assists,
        "clean_sheets": clean_sheets,
        "image_url": image_url,
    }

    players_collection.insert_one(new_player)

    return RedirectResponse(url=f"/clubs/{club_id}", status_code=303)


@app.get("/admin/players/{player_id}/edit", response_class=HTMLResponse)
def edit_player_form(player_id: str, request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        player = players_collection.find_one({"_id": ObjectId(player_id)})
    except Exception:
        return HTMLResponse(content="Player not found", status_code=404)

    if not player:
        return HTMLResponse(content="Player not found", status_code=404)

    player = convert_object_id(player)

    clubs = list(clubs_collection.find())
    clubs = [convert_object_id(club) for club in clubs]

    return templates.TemplateResponse(
        request=request,
        name="player_edit.html",
        context={
            "player": player,
            "clubs": clubs,
        },
    )


@app.post("/admin/players/{player_id}/edit")
def update_player(
    request: Request,
    player_id: str,
    club_id: str = Form(...),
    name: str = Form(...),
    number: int = Form(...),
    position: str = Form(...),
    nationality: str = Form(...),
    age: int = Form(...),
    appearances: int = Form(0),
    goals: int = Form(0),
    assists: int = Form(0),
    clean_sheets: int = Form(0),
    image_url: str = Form(""),
):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(player_id)
    except Exception:
        return HTMLResponse(content="Invalid player id", status_code=404)

    updated_data = {
        "club_id": club_id,
        "name": name,
        "number": number,
        "position": position,
        "nationality": nationality,
        "age": age,
        "appearances": appearances,
        "goals": goals,
        "assists": assists,
        "clean_sheets": clean_sheets,
        "image_url": image_url,
    }

    players_collection.update_one(
        {"_id": object_id},
        {"$set": updated_data},
    )

    return RedirectResponse(url=f"/players/{player_id}", status_code=303)


@app.post("/admin/players/{player_id}/delete")
def delete_player(request: Request, player_id: str):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(player_id)
    except Exception:
        return HTMLResponse(content="Invalid player id", status_code=404)

    player = players_collection.find_one({"_id": object_id})

    if not player:
        return HTMLResponse(content="Player not found", status_code=404)

    club_id = player["club_id"]
    players_collection.delete_one({"_id": object_id})

    return RedirectResponse(url=f"/clubs/{club_id}", status_code=303)


# -------------------------
# 관리자 뉴스 목록 / 등록 / 수정 / 삭제
# -------------------------
@app.get("/admin/news", response_class=HTMLResponse)
def admin_news_list(request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    news_items = list(news_collection.find().sort("_id", DESCENDING))
    news_items = [serialize_news(item) for item in news_items]

    return templates.TemplateResponse(
        request=request,
        name="admin_news_list.html",
        context={"news_items": news_items},
    )


@app.get("/admin/news/new", response_class=HTMLResponse)
def admin_news_new_form(request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    return templates.TemplateResponse(
        request=request,
        name="admin_news_form.html",
        context={
            "mode": "create",
            "news": None,
        },
    )


@app.post("/admin/news/new")
def admin_news_create(
    request: Request,
    title: str = Form(...),
    summary: str = Form(...),
    category: str = Form(...),
    content: str = Form(...),
    source_name: str = Form(...),
    source_url: str = Form(...),
    image_file: UploadFile | None = File(None),
    is_featured: str | None = Form(None),
):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    image_url = save_news_image(image_file)

    if is_featured == "on":
        news_collection.update_many({}, {"$set": {"is_featured": False}})

    new_news = {
        "title": title,
        "summary": summary,
        "category": category,
        "image_url": image_url,
        "content": content,
        "is_featured": is_featured == "on",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "status": "approved",
        "source_name": source_name,
        "source_url": source_url,
        "author_user_id": "",
        "author_username": "admin",
        "submission_type": "official",
    }

    news_collection.insert_one(new_news)
    return RedirectResponse(url="/admin/news", status_code=303)


@app.get("/admin/news/{news_id}/edit", response_class=HTMLResponse)
def admin_news_edit_form(news_id: str, request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        news = news_collection.find_one({"_id": ObjectId(news_id)})
    except Exception:
        return HTMLResponse(content="News not found", status_code=404)

    if not news:
        return HTMLResponse(content="News not found", status_code=404)

    news = serialize_news(news)

    return templates.TemplateResponse(
        request=request,
        name="admin_news_form.html",
        context={
            "mode": "edit",
            "news": news,
        },
    )


@app.post("/admin/news/{news_id}/edit")
def admin_news_update(
    news_id: str,
    request: Request,
    title: str = Form(...),
    summary: str = Form(...),
    category: str = Form(...),
    content: str = Form(...),
    source_name: str = Form(...),
    source_url: str = Form(...),
    image_file: UploadFile | None = File(None),
    is_featured: str | None = Form(None),
):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(news_id)
    except Exception:
        return HTMLResponse(content="Invalid news id", status_code=404)

    if is_featured == "on":
        news_collection.update_many({}, {"$set": {"is_featured": False}})

    update_data = {
        "title": title,
        "summary": summary,
        "category": category,
        "content": content,
        "source_name": source_name,
        "source_url": source_url,
        "is_featured": is_featured == "on",
    }

    if image_file and image_file.filename:
        update_data["image_url"] = save_news_image(image_file)

    news_collection.update_one(
        {"_id": object_id},
        {"$set": update_data},
    )

    return RedirectResponse(url="/admin/news", status_code=303)

@app.post("/admin/news/{news_id}/delete")
def admin_news_delete(news_id: str, request: Request):
    blocked = admin_guard(request)
    if blocked:
        return blocked

    try:
        object_id = ObjectId(news_id)
    except Exception:
        return HTMLResponse(content="Invalid news id", status_code=404)

    news_collection.delete_one({"_id": object_id})
    return RedirectResponse(url="/admin/news", status_code=303)


# -------------------------
# API routes
# -------------------------
@app.get("/api/clubs")
def api_clubs():
    clubs = list(clubs_collection.find())
    clubs = [serialize_club(club) for club in clubs]
    return {"items": clubs}


@app.get("/api/clubs/{club_id}")
def api_club_detail(club_id: str):
    try:
        club = clubs_collection.find_one({"_id": ObjectId(club_id)})
    except Exception:
        return {"error": "Club not found"}

    if not club:
        return {"error": "Club not found"}

    players = list(players_collection.find({"club_id": club_id}))
    players = [serialize_player(player) for player in players]

    return {
        "club": serialize_club(club),
        "players": players,
    }


@app.get("/api/players")
def api_players(
    search: str = "",
    club: str = "all",
    position: str = "all",
    sort: str = "name",
):
    clubs = list(clubs_collection.find())
    clubs = [convert_object_id(club_item) for club_item in clubs]

    club_map = {club_item["_id"]: club_item["name"] for club_item in clubs}
    name_to_id = {club_item["name"]: club_item["_id"] for club_item in clubs}

    query = {}

    if search.strip():
        query["name"] = {"$regex": search.strip(), "$options": "i"}

    if club != "all" and club in name_to_id:
        query["club_id"] = name_to_id[club]

    if position != "all":
        query["position"] = position

    sort_options = {
        "name": ("name", ASCENDING),
        "number": ("number", ASCENDING),
        "goals": ("goals", DESCENDING),
        "assists": ("assists", DESCENDING),
    }

    sort_field, sort_direction = sort_options.get(sort, ("name", ASCENDING))

    players_cursor = players_collection.find(query).sort(sort_field, sort_direction)
    players = list(players_cursor)

    items = []
    for player in players:
        player = convert_object_id(player)
        club_name = club_map.get(player["club_id"], "Unknown Club")
        items.append(serialize_player(player, club_name))

    return {"items": items}


@app.get("/api/players/{player_id}")
def api_player_detail(player_id: str):
    try:
        player = players_collection.find_one({"_id": ObjectId(player_id)})
    except Exception:
        return {"error": "Player not found"}

    if not player:
        return {"error": "Player not found"}

    player = convert_object_id(player)

    club_name = ""
    if player.get("club_id"):
        club = clubs_collection.find_one({"_id": ObjectId(player["club_id"])})
        if club:
            club_name = club.get("name", "")

    return {"player": serialize_player(player, club_name)}


@app.get("/api/stats/top-scorers")
def api_top_scorers(limit: int = 10):
    clubs = list(clubs_collection.find())
    clubs = [convert_object_id(club) for club in clubs]
    club_map = {club["_id"]: club["name"] for club in clubs}

    players = list(
        players_collection.find().sort("goals", DESCENDING).limit(limit)
    )

    items = []
    for player in players:
        player = convert_object_id(player)
        club_name = club_map.get(player["club_id"], "Unknown Club")
        items.append(serialize_player(player, club_name))

    return {"items": items}


@app.get("/api/stats/top-assists")
def api_top_assists(limit: int = 10):
    clubs = list(clubs_collection.find())
    clubs = [convert_object_id(club) for club in clubs]
    club_map = {club["_id"]: club["name"] for club in clubs}

    players = list(
        players_collection.find().sort("assists", DESCENDING).limit(limit)
    )

    items = []
    for player in players:
        player = convert_object_id(player)
        club_name = club_map.get(player["club_id"], "Unknown Club")
        items.append(serialize_player(player, club_name))

    return {"items": items}


@app.get("/api/home/table")
def api_home_table():
    return {"items": HOME_TABLE_MOCK}


@app.get("/api/home/featured-news")
def api_home_featured_news():
    featured_news = news_collection.find_one(
        {"is_featured": True, "status": "approved"}
    )

    if not featured_news:
        featured_news = news_collection.find_one({"status": "approved"})

    if not featured_news:
        return {"item": None}

    return {"item": serialize_news(featured_news)}


@app.get("/api/home/recent-matches")
def api_home_recent_matches():
    return {"items": HOME_RECENT_MATCHES_MOCK}


@app.get("/api/news")
def api_news():
    news_items = list(
        news_collection.find({"status": "approved"}).sort("_id", DESCENDING)
    )
    news_items = [serialize_news(item) for item in news_items]
    return {"items": news_items}


@app.get("/api/news/{news_id}")
def api_news_detail(news_id: str):
    try:
        news = news_collection.find_one(
            {"_id": ObjectId(news_id), "status": "approved"}
        )
    except Exception:
        return {"error": "News not found"}

    if not news:
        return {"error": "News not found"}

    return {"item": serialize_news(news)}


@app.get("/api/comments/{news_id}")
def api_comments(news_id: str):
    comments = list(
        comments_collection.find({"news_id": news_id}).sort("_id", DESCENDING)
    )
    comments = [serialize_comment(comment) for comment in comments]
    return {"items": comments}


@app.post("/api/comments/{news_id}")
def api_create_comment(
    request: Request,
    news_id: str,
    content: str = Form(...),
):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    new_comment = {
        "news_id": news_id,
        "user_id": user["id"],
        "username": user["username"],
        "content": content,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }

    comments_collection.insert_one(new_comment)
    return {"message": "comment created"}


# -------------------------
# 일반 사용자 인증 / 응원팀
# -------------------------
@app.post("/api/auth/signup")
def api_signup(payload: SignupPayload):
    email = payload.email.strip().lower()

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일이야.")

    new_user = {
        "username": payload.username.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
    }

    users_collection.insert_one(new_user)
    return {"message": "signup success"}


@app.post("/api/auth/login")
def api_login(request: Request, payload: LoginPayload):
    email = payload.email.strip().lower()
    user = users_collection.find_one({"email": email})

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸어.")

    request.session["user_id"] = str(user["_id"])
    request.session["username"] = user["username"]

    return {
        "message": "login success",
        "user": serialize_user(user),
    }


@app.post("/api/auth/logout")
def api_logout(request: Request):
    request.session.pop("user_id", None)
    request.session.pop("username", None)
    return {"message": "logout success"}


@app.get("/api/auth/me")
def api_auth_me(request: Request):
    return {"user": get_current_user(request)}


@app.get("/api/favorites/team")
def api_get_favorite_team(request: Request):
    user = get_current_user(request)
    if not user:
        return {"item": None}

    favorite = favorites_collection.find_one({"user_id": user["id"]})
    if not favorite:
        return {"item": None}

    club_name = ""
    club_id = favorite.get("club_id", "")

    if club_id:
        try:
            club = clubs_collection.find_one({"_id": ObjectId(club_id)})
            if club:
                club_name = club.get("name", "")
        except Exception:
            club_name = ""

    return {
        "item": {
            "club_id": club_id,
            "club_name": club_name,
        }
    }


@app.post("/api/favorites/team")
def api_set_favorite_team(request: Request, payload: FavoriteTeamPayload):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    favorites_collection.update_one(
        {"user_id": user["id"]},
        {"$set": {"club_id": payload.club_id}},
        upsert=True,
    )

    return {"message": "favorite saved"}


@app.post("/api/news/submit")
def api_news_submit(
    request: Request,
    title: str = Form(...),
    summary: str = Form(...),
    category: str = Form(...),
    content: str = Form(...),
    source_name: str = Form(...),
    source_url: str = Form(...),
    image_file: UploadFile | None = File(None),
):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    image_url = save_news_image(image_file)

    new_news = {
        "title": title.strip(),
        "summary": summary.strip(),
        "category": category.strip(),
        "image_url": image_url,
        "content": content.strip(),
        "is_featured": False,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "status": "approved",
        "source_name": source_name.strip(),
        "source_url": source_url.strip(),
        "author_user_id": user["id"],
        "author_username": user["username"],
        "submission_type": "user_submission",
    }

    news_collection.insert_one(new_news)
    return {"message": "news submitted"}

@app.get("/api/admin/news/pending")
def api_admin_pending_news(request: Request):
    if not is_admin_logged_in(request):
        raise HTTPException(status_code=401, detail="관리자 로그인 필요")

    news_items = list(
        news_collection.find({"status": "pending"}).sort("_id", DESCENDING)
    )
    news_items = [serialize_news(item) for item in news_items]
    return {"items": news_items}


@app.post("/api/admin/news/{news_id}/status")
def api_admin_update_news_status(
    news_id: str,
    payload: NewsStatusPayload,
    request: Request,
):
    if not is_admin_logged_in(request):
        raise HTTPException(status_code=401, detail="관리자 로그인 필요")

    if payload.status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="잘못된 status 값이야.")

    try:
        object_id = ObjectId(news_id)
    except Exception:
        raise HTTPException(status_code=404, detail="뉴스 ID가 잘못됐어.")

    news_collection.update_one(
        {"_id": object_id},
        {"$set": {"status": payload.status}},
    )

    return {"message": "news status updated"}

@app.post("/api/news/{news_id}/edit")
def api_news_edit(
    news_id: str,
    request: Request,
    title: str = Form(...),
    summary: str = Form(...),
    category: str = Form(...),
    content: str = Form(...),
    source_name: str = Form(...),
    source_url: str = Form(...),
    image_file: UploadFile | None = File(None),
):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    try:
        object_id = ObjectId(news_id)
    except Exception:
        raise HTTPException(status_code=404, detail="뉴스 ID가 잘못됐어.")

    news = news_collection.find_one({"_id": object_id})
    if not news:
        raise HTTPException(status_code=404, detail="뉴스를 찾을 수 없어.")

    if news.get("author_user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="자기 글만 수정할 수 있어.")

    update_data = {
        "title": title.strip(),
        "summary": summary.strip(),
        "category": category.strip(),
        "content": content.strip(),
        "source_name": source_name.strip(),
        "source_url": source_url.strip(),
    }

    if image_file and image_file.filename:
        update_data["image_url"] = save_news_image(image_file)

    news_collection.update_one(
        {"_id": object_id},
        {"$set": update_data},
    )

    return {"message": "news updated"}

@app.get("/api/community/posts")
def api_community_posts(board_type: str = "general", club_id: str = ""):
    query = {"board_type": board_type}

    if board_type == "club" and club_id:
        query["club_id"] = club_id

    posts = list(
        community_posts_collection.find(query).sort("_id", DESCENDING)
    )
    posts = [serialize_community_post(post) for post in posts]
    return {"items": posts}


@app.get("/api/community/posts/{post_id}")
def api_community_post_detail(post_id: str, request: Request):
    try:
        object_id = ObjectId(post_id)
    except Exception:
        return {"error": "Post not found"}

    post = community_posts_collection.find_one({"_id": object_id})
    if not post:
        return {"error": "Post not found"}

    community_posts_collection.update_one(
        {"_id": object_id},
        {"$inc": {"views": 1}},
    )

    post = community_posts_collection.find_one({"_id": object_id})

    current_user = get_current_user(request)
    liked_by_current_user = False

    if current_user:
        liked_by_current_user = current_user["id"] in post.get("liked_user_ids", [])

    item = serialize_community_post(post)
    item["liked_by_current_user"] = liked_by_current_user

    return {"item": item}


@app.post("/api/community/posts")
def api_create_community_post(payload: CommunityPostPayload, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    new_post = {
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "board_type": payload.board_type.strip(),
        "club_id": payload.club_id.strip(),
        "author_user_id": user["id"],
        "author_username": user["username"],
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "updated_at": "",
        "likes_count": 0,
        "views": 0,
        "liked_user_ids": [],
    }

    community_posts_collection.insert_one(new_post)
    return {"message": "community post created"}


@app.post("/api/community/posts/{post_id}/edit")
def api_edit_community_post(
    post_id: str,
    payload: CommunityPostEditPayload,
    request: Request,
):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    post = community_posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    if post.get("author_user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="자기 글만 수정할 수 있어.")

    community_posts_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "title": payload.title.strip(),
                "content": payload.content.strip(),
                "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            }
        },
    )

    return {"message": "community post updated"}


@app.post("/api/community/posts/{post_id}/delete")
def api_delete_community_post(post_id: str, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    post = community_posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    if post.get("author_user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="자기 글만 삭제할 수 있어.")

    community_posts_collection.delete_one({"_id": object_id})
    return {"message": "community post deleted"}


@app.post("/api/community/posts/{post_id}/like-toggle")
def api_toggle_community_like(post_id: str, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    post = community_posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    liked_user_ids = post.get("liked_user_ids", [])

    if user["id"] in liked_user_ids:
        community_posts_collection.update_one(
            {"_id": object_id},
            {
                "$pull": {"liked_user_ids": user["id"]},
                "$inc": {"likes_count": -1},
            },
        )
        liked = False
    else:
        community_posts_collection.update_one(
            {"_id": object_id},
            {
                "$addToSet": {"liked_user_ids": user["id"]},
                "$inc": {"likes_count": 1},
            },
        )
        liked = True

    updated_post = community_posts_collection.find_one({"_id": object_id})
    item = serialize_community_post(updated_post)
    item["liked_by_current_user"] = liked

    return {"message": "like updated", "item": item}


@app.get("/api/community/popular")
def api_community_popular(
    board_type: str = "general",
    club_id: str = "",
    limit: int = 5,
    days: int = 7,
):
    since = datetime.utcnow() - timedelta(days=days)

    query = {
        "board_type": board_type,
        "_id": {"$gte": ObjectId.from_datetime(since)},
    }

    if board_type == "club" and club_id:
        query["club_id"] = club_id

    posts = list(
        community_posts_collection.find(query).sort(
            [("likes_count", DESCENDING), ("views", DESCENDING), ("_id", DESCENDING)]
        ).limit(limit)
    )

    posts = [serialize_community_post(post) for post in posts]
    return {"items": posts}

@app.get("/api/community/posts/{post_id}/comments")
def api_community_comments(post_id: str):
    comments = list(
        community_comments_collection.find({"post_id": post_id}).sort("_id", DESCENDING)
    )
    comments = [serialize_community_comment(comment) for comment in comments]
    return {"items": comments}


@app.post("/api/community/posts/{post_id}/comments")
def api_create_community_comment(
    post_id: str,
    request: Request,
    content: str = Form(...),
):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    try:
        object_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    post = community_posts_collection.find_one({"_id": object_id})
    if not post:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없어.")

    new_comment = {
        "post_id": post_id,
        "author_user_id": user["id"],
        "author_username": user["username"],
        "content": content.strip(),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }

    community_comments_collection.insert_one(new_comment)
    return {"message": "community comment created"}


@app.post("/api/community/comments/{comment_id}/delete")
def api_delete_community_comment(comment_id: str, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="로그인이 필요해.")

    try:
        object_id = ObjectId(comment_id)
    except Exception:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없어.")

    comment = community_comments_collection.find_one({"_id": object_id})
    if not comment:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없어.")

    if comment.get("author_user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="자기 댓글만 삭제할 수 있어.")

    community_comments_collection.delete_one({"_id": object_id})
    return {"message": "community comment deleted"}