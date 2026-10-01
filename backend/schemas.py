from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    Age: int = Field(..., ge=20, le=79)
    Height: float = Field(..., ge=123, le=222)
    Weight: float = Field(..., ge=36, le=132)
    Duration: float = Field(..., ge=1, le=30)
    Heart_Rate: float = Field(..., ge=67, le=128)
    Gender: Literal["male", "female"]


class PredictionResponse(BaseModel):
    calories: float


class WorkoutResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    Age: int
    Height: float
    Weight: float
    Duration: float
    Heart_Rate: float
    Gender: str
    Calories: float
    created_at: datetime