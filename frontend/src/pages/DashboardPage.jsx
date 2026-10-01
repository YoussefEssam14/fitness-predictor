import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { getStats, getWeeklyStats } from "../api";

function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ color: "#666", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getStats(), getWeeklyStats()])
      .then(([s, w]) => {
        setStats(s);
        setWeekly(w);
      })
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  if (error) return <p style={{ padding: 16, color: "crimson" }}>{error}</p>;
  if (!stats) return <p style={{ padding: 16 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total workouts" value={stats.total_workouts} />
        <StatCard label="Total calories" value={stats.total_calories} />
        <StatCard label="Average per workout" value={stats.average_calories} />
      </div>

      <h2>Calories per week</h2>
      {weekly.length === 0 ? (
        <p>Save some workouts to see your weekly trend.</p>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}