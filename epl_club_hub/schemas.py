from pydantic import BaseModel
from typing import Optional


class ClubCreate(BaseModel):
    name: str
    short_name: str
    stadium: str
    manager: str
    founded_year: int
    description: str
    logo_url: Optional[str] = None


class PlayerCreate(BaseModel):
    club_id: str
    name: str
    number: int
    position: str
    nationality: str
    age: int
    appearances: int = 0
    goals: int = 0
    assists: int = 0
    clean_sheets: int = 0
    image_url: Optional[str] = None