import "./StatCard.css";

function StatCard({
  title,
  value,
  color = "#2563eb",
}) {
  return (
    <div className="stat-card">
      <div
        className="stat-card-line"
        style={{ backgroundColor: color }}
      ></div>

      <div className="stat-card-content">
        <h2>{value}</h2>

        <p>{title}</p>
      </div>
    </div>
  );
}

export default StatCard;