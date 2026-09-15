from fastapi import FastAPI, Depends
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routes import users
from routes import auth
from routes import work
from auth import get_current_user

app = FastAPI(
    title="WorkHours API",
    description="API para registrar y calcular horas trabajadas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectar las rutas de usuarios a FastAPI
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(work.router)
# Crear las tablas que no existan
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "WorkHours API funcionando"}


@app.get("/test-db")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT current_database(), current_user")
        )
        row = result.fetchone()

    return {
        "database": row[0],
        "user": row[1],
        "status": "Conexion exitosa"
    }
@app.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "week_start_day": current_user.week_start_day
    }