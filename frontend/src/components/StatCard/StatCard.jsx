import "./StatCard.css";

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card">
      <div
        className="stat-line"
        style={{ backgroundColor: color }}
      ></div>

      <div className="stat-content">
        <h3>{title}</h3>
        <h1>{value}</h1>
      </div>
    </div>
  );
}

export default StatCard;