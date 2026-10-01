import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { getModelInfo, predictCalories } from "../api";

const BASE = {
  Age: 30, Height: 175, Weight: 70,
  Duration: 15, Heart_Rate: 95, Gender: "male",
};

function MetricCard({ label, value, hint }) {
  return (
    <div style={{ flex: 1, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ color: "#666", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
      <div style={{ color: "#888", fontSize: 12 }}>{hint}</div>
    </div>
  );
}

export default function ModelPage() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [feature, setFeature] = useState("Duration");
  const [curve, setCurve] = useState([]);

  useEffect(() => {
    getModelInfo()
      .then(setInfo)
      .catch(() => setError("Could not load model info."));
  }, []);

  // Build the "what-if" curve whenever the chosen feature changes
  useEffect(() => {
    if (!info) return;
    const [min, max] = info.training_ranges[feature];
    const steps = 20;
    const values = Array.from(
      { length: steps + 1 },
      (_, i) => min + ((max - min) * i) / steps
    );

    Promise.all(
      values.map((v) =>
        predictCalories({
          ...BASE,
          [feature]: feature === "Age" ? Math.round(v) : Number(v.toFixed(1)),
        })
      )
    )
      .then((results) =>
        setCurve(
          results.map((r, i) => ({
            x: Number(values[i].toFixed(1)),
            calories: r.calories,
          }))
        )
      )
      .catch(() => setError("Could not build the curve."));
  }, [info, feature]);

  if (error) return <p style={{ padding: 16, color: "crimson" }}>{error}</p>;
  if (!info) return <p style={{ padding: 16 }}>Loading...</p>;

  const { MAE, RMSE, R2 } = info.metrics;
  const numericFeatures = Object.keys(info.training_ranges);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1>About the Model</h1>
      <p>
        Polynomial linear regression (degree {info.degree}) trained on{" "}
        {info.n_train} workouts. Last trained:{" "}
        {new Date(info.trained_at).toLocaleDateString()}.
      </p>

      <h2 style={{ marginTop: 32 }}>Accuracy on unseen data</h2>
      <div style={{ display: "flex", gap: 16 }}>
        <MetricCard label="MAE" value={MAE.toFixed(2)} hint="average error in calories" />
        <MetricCard label="RMSE" value={RMSE.toFixed(2)} hint="penalizes big errors" />
        <MetricCard label="R²" value={R2.toFixed(3)} hint="1.0 is a perfect fit" />
      </div>

      <h2 style={{ marginTop: 32 }}>How each input affects the prediction</h2>
      <p>
        Pick a feature. All others stay fixed at: age 30, 175 cm, 70 kg,
        15 min, 95 bpm, male.
      </p>
      <select
        value={feature}
        onChange={(e) => setFeature(e.target.value)}
        style={{ margin: "12px 0" }}
      >
        {numericFeatures.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={curve}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="calories" stroke="#4f46e5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ marginTop: 32 }}>Limits</h2>
      <p>
        The model is only reliable inside the ranges it was trained on:{" "}
        {numericFeatures
          .map((f) => `${f} ${info.training_ranges[f][0]} to ${info.training_ranges[f][1]}`)
          .join(", ")}
        .
      </p>
    </div>
  );
}