import json
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, PolynomialFeatures, StandardScaler

NUMERIC = ["Age", "Height", "Weight", "Duration", "Heart_Rate"]
CATEGORICAL = ["Gender"]
TARGET = "Calories"
DEGREE = 3

df = pd.read_csv("data/calories.csv").drop(columns=["User_ID", "Body_Temp"])

X = df[NUMERIC + CATEGORICAL]
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

preprocessor = ColumnTransformer([
    ("num", Pipeline([
        ("scale", StandardScaler()),
        ("poly", PolynomialFeatures(degree=DEGREE, include_bias=False)),
    ]), NUMERIC),
    ("cat", OneHotEncoder(drop="first"), CATEGORICAL),
])
pipe = Pipeline([("prep", preprocessor), ("model", LinearRegression())])
pipe.fit(X_train, y_train)

pred = pipe.predict(X_test)
metrics = {
    "MAE": float(mean_absolute_error(y_test, pred)),
    "RMSE": float(np.sqrt(mean_squared_error(y_test, pred))),
    "R2": float(r2_score(y_test, pred)),
}
print("Test metrics:", metrics)

joblib.dump(pipe, "model.joblib")

# Metadata for the API and the React "Model" page
ranges = {c: [float(X[c].min()), float(X[c].max())] for c in NUMERIC}
metadata = {
    "trained_at": datetime.now().isoformat(timespec="seconds"),
    "degree": DEGREE,
    "features": NUMERIC + CATEGORICAL,
    "metrics": metrics,
    "training_ranges": ranges,
    "n_train": int(len(X_train)),
}
with open("model_info.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("Saved model.joblib and model_info.json")