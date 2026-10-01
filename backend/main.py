from fastapi import FastAPI,Depends,HTTPException
from fastapi.middleware.cors import CORSMiddleware

import joblib
from schemas import PredictionRequest , WorkoutResponse , PredictionResponse
import pandas as pd
import json
from database import engine , SessionLocal
from models import Base , Workout
from sqlalchemy.orm import Session
from typing import List






app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

with open("model_info.json") as f:
    model_info = json.load(f)


model = joblib.load("model.joblib")


@app.get("/")
def root():
    return {"message": "Fitness Calorie Predictor API"}

@app.get("/health")
def health():
    return {"status": "running"}

# a service function that can be used by other endpoints to run the prediction
def run_prediction(data: PredictionRequest):
    input_df = pd.DataFrame([{
        "Age": data.Age,
        "Height": data.Height,
        "Weight": data.Weight,
        "Duration": data.Duration,
        "Heart_Rate": data.Heart_Rate,
        "Gender": data.Gender
    }])
    calories = float(model.predict(input_df)[0])
    return calories
@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    calories = run_prediction(data)

    if(not calories):
        raise HTTPException(
            status_code=400,
            detail="Prediction failed"
        )
    return {
        "calories" : round(calories,2)
    }


@app.get("/model-info")
def get_model_info():
    return model_info


# gives every endpoint acess to the db
def get_db():
    db =SessionLocal()
    try:
       yield db
    finally:
        db.close() 


# save workout to the db
@app.post("/workouts")
def save_workout(
    data: PredictionRequest,
    db : Session = Depends(get_db)
):
    calories = run_prediction(data)
    workout = Workout(
        Age = data.Age,
        Height = data.Height,
        Weight = data.Weight,
        Duration = data.Duration,
        Heart_Rate = data.Heart_Rate,
        Gender = data.Gender,
        Calories = round(calories,2)
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    return {
        "id" : workout.id,
        "calories" : calories
    }


# get all saved workouts
@app.get("/workouts" , response_model = List[WorkoutResponse])
def get_workouts(db : Session = Depends(get_db)):
    return (
        db.query(Workout)
        .order_by(Workout.id.desc())
        .all()
    )


# get a summary of statistics about the saved workouts
@app.get("/stats")
def get_stats(db : Session = Depends(get_db)):
    workouts = db.query(Workout).all()
    if not workouts:
        return {
        "total_workouts": 0,
        "total_calories": 0,
        "average_calories": 0
    }


    total_workouts = len(workouts)
    total_calories = sum(
        workout.Calories or 0 
        for workout in workouts
    )

    avg_calories = (
        total_calories / total_workouts
        if total_workouts > 0
        else 0
    )

    return {
        "total_workouts" : total_workouts,
        "total_calories" : round(total_calories,2),
        "average_calories" : round(avg_calories,2)
    }




@app.get(
    "/workouts/{workout_id}",
    response_model=WorkoutResponse
)
def get_workout(
    workout_id : int,
    db : Session = Depends(get_db)
):
    workout = (
        db.query(Workout)
        .filter(Workout.id == workout_id)
        .first()
    )
    if not workout:
        raise HTTPException(
            status_code = 404,
            detail = "Workout not found"
        )
    return workout