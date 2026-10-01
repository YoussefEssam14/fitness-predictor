import { useEffect, useState } from "react";
import { getWorkouts } from "../api";

export default function LogPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getWorkouts()
      .then(setWorkouts)
      .catch(() => setError("Could not load workouts."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>;
  if (error) return <p style={{ padding: 16, color: "crimson" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1>Workout Log</h1>

      {workouts.length === 0 ? (
        <p>No workouts saved yet. Go to the Predict page and save one.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th>Date</th>
              <th>Duration</th>
              <th>Heart rate</th>
              <th>Weight</th>
              <th>Calories</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((w) => (
              <tr key={w.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{new Date(w.created_at + "Z").toLocaleDateString()}</td>
                <td>{w.Duration} min</td>
                <td>{w.Heart_Rate} bpm</td>
                <td>{w.Weight} kg</td>
                <td><strong>{w.Calories}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}