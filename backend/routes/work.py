from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas
import models
import schemas
from auth import get_current_user
from database import get_db


router = APIRouter(
    prefix="/work",
    tags=["Work"]
)


@router.post("/check-in")
def check_in(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    now = datetime.now()

    existing_entry = db.query(models.WorkEntry).filter(
        models.WorkEntry.user_id == current_user.id,
        models.WorkEntry.work_date == now.date(),
        models.WorkEntry.end_time.is_(None)
    ).first()

    if existing_entry:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una entrada abierta"
        )

    new_entry = models.WorkEntry(
        user_id=current_user.id,
        work_date=now.date(),
        start_time=now.time().replace(microsecond=0)
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {
        "id": new_entry.id,
        "work_date": new_entry.work_date,
        "start_time": new_entry.start_time,
        "message": "Entrada registrada"
    }

@router.post("/check-out")
def check_out(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    now = datetime.now()

    entry = db.query(models.WorkEntry).filter(
        models.WorkEntry.user_id == current_user.id,
        models.WorkEntry.work_date == now.date(),
        models.WorkEntry.end_time.is_(None)
    ).first()

    if not entry:
        raise HTTPException(
            status_code=400,
            detail="No tienes una entrada abierta"
        )

    entry.end_time = now.time().replace(microsecond=0)

    start_datetime = datetime.combine(
        entry.work_date,
        entry.start_time
    )

    end_datetime = datetime.combine(
        entry.work_date,
        entry.end_time
    )

    worked_time = end_datetime - start_datetime

    entry.total_minutes = int(
        worked_time.total_seconds() // 60
    )

    db.commit()
    db.refresh(entry)

    hours = entry.total_minutes // 60
    minutes = entry.total_minutes % 60

    return {
        "id": entry.id,
        "work_date": entry.work_date,
        "start_time": entry.start_time,
        "end_time": entry.end_time,
        "total_minutes": entry.total_minutes,
        "total": f"{hours} h {minutes} min",
        "message": "Salida registrada"
    }

@router.get("/week")
def get_week(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = datetime.now().date()

    week_start_day = current_user.week_start_day

    days_since_start = (
        today.weekday() - week_start_day
    ) % 7

    start_week = today - timedelta(days=days_since_start)
    end_week = start_week + timedelta(days=6)

    entries = db.query(models.WorkEntry).filter(
        models.WorkEntry.user_id == current_user.id,
        models.WorkEntry.work_date >= start_week,
        models.WorkEntry.work_date <= end_week
    ).order_by(
        models.WorkEntry.work_date
    ).all()

    total_minutes = sum(
        entry.total_minutes or 0
        for entry in entries
    )

    total_hours = total_minutes // 60
    remaining_minutes = total_minutes % 60

    return {
        "week_start": start_week,
        "week_end": end_week,
        "week_start_day": week_start_day,
        "total_minutes": total_minutes,
        "total": f"{total_hours} h {remaining_minutes} min",
        "entries": [
            {
                "id": entry.id,
                "date": entry.work_date,
                "start_time": entry.start_time,
                "end_time": entry.end_time,
                "total_minutes": entry.total_minutes
            }
            for entry in entries
        ]
    }

@router.patch("/{entry_id}")
def update_work_entry(
    entry_id: int,
    data: schemas.WorkEntryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    entry = db.query(models.WorkEntry).filter(
        models.WorkEntry.id == entry_id,
        models.WorkEntry.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )

    if data.work_date is not None:
        entry.work_date = data.work_date

    if data.start_time is not None:
        entry.start_time = data.start_time

    if data.end_time is not None:
        entry.end_time = data.end_time

    if entry.start_time and entry.end_time:
        start_datetime = datetime.combine(
            entry.work_date,
            entry.start_time
        )

        end_datetime = datetime.combine(
            entry.work_date,
            entry.end_time
        )

        if end_datetime < start_datetime:
            raise HTTPException(
                status_code=400,
                detail="La hora de salida no puede ser anterior a la entrada"
            )

        worked_time = end_datetime - start_datetime

        entry.total_minutes = int(
            worked_time.total_seconds() // 60
        )
    else:
        entry.total_minutes = None

    db.commit()
    db.refresh(entry)

    return {
        "id": entry.id,
        "work_date": entry.work_date,
        "start_time": entry.start_time,
        "end_time": entry.end_time,
        "total_minutes": entry.total_minutes
    }

@router.get("/today")
def get_today_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = datetime.now().date()

    entries = db.query(models.WorkEntry).filter(
        models.WorkEntry.user_id == current_user.id,
        models.WorkEntry.work_date == today
    ).order_by(
        models.WorkEntry.start_time
    ).all()

    total_minutes = sum(
        entry.total_minutes or 0
        for entry in entries
    )

    hours = total_minutes // 60
    minutes = total_minutes % 60

    return {
        "date": today,
        "total_minutes": total_minutes,
        "total": f"{hours} h {minutes} min",
        "entries": [
            {
                "id": entry.id,
                "start_time": entry.start_time,
                "end_time": entry.end_time,
                "total_minutes": entry.total_minutes,
                "status": (
                    "open"
                    if entry.end_time is None
                    else "closed"
                )
            }
            for entry in entries
        ]
    }

@router.get("/{entry_id}")
def get_work_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    entry = db.query(models.WorkEntry).filter(
        models.WorkEntry.id == entry_id,
        models.WorkEntry.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )

    return {
        "id": entry.id,
        "work_date": entry.work_date,
        "start_time": entry.start_time,
        "end_time": entry.end_time,
        "total_minutes": entry.total_minutes
    }

@router.get("/history/all")
def get_work_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    entries = db.query(models.WorkEntry).filter(
        models.WorkEntry.user_id == current_user.id
    ).order_by(
        models.WorkEntry.work_date.desc(),
        models.WorkEntry.start_time.desc()
    ).all()

    return [
        {
            "id": entry.id,
            "work_date": entry.work_date,
            "start_time": entry.start_time,
            "end_time": entry.end_time,
            "total_minutes": entry.total_minutes,
            "total": (
                f"{entry.total_minutes // 60} h "
                f"{entry.total_minutes % 60} min"
                if entry.total_minutes is not None
                else "En progreso"
            )
        }
        for entry in entries
    ]

@router.post("/manual")
def create_manual_entry(
    data: schemas.WorkEntryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    start_datetime = datetime.combine(
        data.work_date,
        data.start_time
    )

    end_datetime = datetime.combine(
        data.work_date,
        data.end_time
    )

    if end_datetime <= start_datetime:
        raise HTTPException(
            status_code=400,
            detail="La hora de salida debe ser posterior a la hora de entrada"
        )

    worked_time = end_datetime - start_datetime
    total_minutes = int(worked_time.total_seconds() // 60)

    new_entry = models.WorkEntry(
        user_id=current_user.id,
        work_date=data.work_date,
        start_time=data.start_time,
        end_time=data.end_time,
        total_minutes=total_minutes
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    hours = new_entry.total_minutes // 60
    minutes = new_entry.total_minutes % 60

    return {
        "id": new_entry.id,
        "work_date": new_entry.work_date,
        "start_time": new_entry.start_time,
        "end_time": new_entry.end_time,
        "total_minutes": new_entry.total_minutes,
        "total": f"{hours} h {minutes} min"
    }

@router.delete("/{entry_id}")
def delete_work_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    entry = db.query(models.WorkEntry).filter(
        models.WorkEntry.id == entry_id,
        models.WorkEntry.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Registro eliminado correctamente",
        "id": entry_id
    }

@router.get("/today")
def get_today_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = datetime.now().date()

    entries = db.query(models.WorkEntry).filter(
        models.WorkEntry.user_id == current_user.id,
        models.WorkEntry.work_date == today
    ).order_by(
        models.WorkEntry.start_time
    ).all()

    total_minutes = sum(
        entry.total_minutes or 0
        for entry in entries
    )

    hours = total_minutes // 60
    minutes = total_minutes % 60

    return {
        "date": today,
        "total_minutes": total_minutes,
        "total": f"{hours} h {minutes} min",
        "entries": [
            {
                "id": entry.id,
                "start_time": entry.start_time,
                "end_time": entry.end_time,
                "total_minutes": entry.total_minutes,
                "status": (
                    "open"
                    if entry.end_time is None
                    else "closed"
                )
            }
            for entry in entries
        ]
    }

@router.get("/history/all")
def get_work_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    entries = (
        db.query(models.WorkEntry)
        .filter(
            models.WorkEntry.user_id == current_user.id
        )
        .order_by(
            models.WorkEntry.work_date.desc(),
            models.WorkEntry.start_time.desc()
        )
        .all()
    )

    return {
        "entries": [
            {
                "id": entry.id,
                "work_date": entry.work_date,
                "start_time": entry.start_time,
                "end_time": entry.end_time,
                "total_minutes": entry.total_minutes,
                "status": (
                    "open"
                    if entry.end_time is None
                    else "closed"
                )
            }
            for entry in entries
        ]
    }