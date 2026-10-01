import { useState } from "react";
import { predictCalories, saveWorkout } from "../api";

const initialForm = {
  Age: 30,
  Height: 175,
  Weight: 70,
  Duration: 15,
  Heart_Rate: 95,
  Gender: "male",
};

export default function PredictPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "Gender" ? value : Number(value),
    });
    setSaved(false);
  };

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
      // FastAPI validation errors (422)
      return detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(" | ");
    }
    return detail || "Could not reach the server.";
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await predictCalories(form);
      setResult(data.calories);
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveWorkout(form);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Calorie Burn Predictor</h1>

      <form onSubmit={handlePredict}>
        <label>Gender</label>
        <select name="Gender" value={form.Gender} onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {[
  ["Age", "Age (years)", 20, 79, 1],
  ["Height", "Height (cm)", 123, 222, "any"],
  ["Weight", "Weight (kg)", 36, 132, "any"],
  ["Duration", "Duration (minutes)", 1, 30, "any"],
  ["Heart_Rate", "Average heart rate (bpm)", 67, 128, "any"],
].map(([name, label, min, max, step]) => (
  <div key={name} style={{ marginTop: 12 }}>
    <label>{label} <small style={{ color: "#888" }}>({min} to {max})</small></label>
    <input
      type="number"
      name={name}
      value={form[name]}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      required
      style={{ display: "block", width: "100%" }}
    />
  </div>
))}

        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result !== null && (
        <div style={{ marginTop: 24 }}>
          <h2>{result} calories burned</h2>
          <button onClick={handleSave} disabled={saved}>
            {saved ? "Saved ✓" : "Save to my log"}
          </button>
        </div>
      )}
    </div>
  );
}