import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const predictCalories = (data) =>
  api.post("/predict", data).then((r) => r.data);

export const saveWorkout = (data) =>
  api.post("/workouts", data).then((r) => r.data);

export const getWorkouts = () => api.get("/workouts").then((r) => r.data);

export const getStats = () => api.get("/stats").then((r) => r.data);

export const getModelInfo = () => api.get("/model-info").then((r) => r.data);

export const getWeeklyStats = () =>
  api.get("/stats/weekly").then((r) => r.data);

const handleChange = (e) => {
  const { name, value } = e.target;
  setForm({ ...form, [name]: value });
  setResult(null);
  setSaved(false);
};

const toPayload = (f) => ({
  ...f,
  Age: Number(f.Age),
  Height: Number(f.Height),
  Weight: Number(f.Weight),
  Duration: Number(f.Duration),
  Heart_Rate: Number(f.Heart_Rate),
});

const getErrorMessage = (err) => {
  if (!err.response) return "Could not reach the server.";
  const detail = err.response.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(" | ");
  }
  return detail || `Server error (${err.response.status}).`;
};