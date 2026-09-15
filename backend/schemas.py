from pydantic import BaseModel, EmailStr
from datetime import date, time
from typing import Optional



class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class WeekSettings(BaseModel):
    week_start_day: int



class WorkEntryUpdate(BaseModel):
    work_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

from datetime import date, time


class WorkEntryCreate(BaseModel):
    work_date: date
    start_time: time
    end_time: time