from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    Age: int = Field(..., ge=10, le=100)
    Height: float = Field(..., ge=100, le=250)
    Weight: float = Field(..., ge=30, le=300)
    Duration: float = Field(..., ge=1, le=300)
    Heart_Rate: float = Field(..., ge=40, le=220)
    Gender: str



class WorkoutResponse(BaseModel):
    id : int
    Age : int
    Height : float
    Weight : float
    Duration : float
    Heart_Rate : float
    Gender : str
    Calories : float

    class Config:
        from_attributes = True
class PredictionResponse(BaseModel):
    calories: float