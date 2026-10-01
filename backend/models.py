from sqlalchemy import Column, Integer, Float, String
from database import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True)

    Age = Column(Integer)
    Height = Column(Float)
    Weight = Column(Float)

    Duration = Column(Float)
    Heart_Rate = Column(Float)

    Gender = Column(String)

    Calories = Column(Float)