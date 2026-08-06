import "./StatCard.css";

function StatCard({
  title,
  value,
  icon,
  color = "#2563eb",
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div
          className="stat-icon"
          style={{
            background: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>

        <div
          className="stat-indicator"
          style={{
            background: color,
          }}
        ></div>

      </div>

      <div className="stat-content">

        <h2>{value}</h2>

        <p>{title}</p>

      </div>

    </div>
  );
}

export default StatCard;