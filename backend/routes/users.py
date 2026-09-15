from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_current_user
import models
import schemas

from database import get_db
from security import hash_password


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )

    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email
    }


@router.put("/week-settings")
def update_week_settings(
    settings: schemas.WeekSettings,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if settings.week_start_day < 0 or settings.week_start_day > 6:
        raise HTTPException(
            status_code=400,
            detail="week_start_day debe estar entre 0 y 6"
        )

    current_user.week_start_day = settings.week_start_day

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Configuración semanal actualizada",
        "week_start_day": current_user.week_start_day
    }