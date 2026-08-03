import BoardTask from "../BoardTask/BoardTask";
import "./BoardColumn.css";

function BoardColumn({ title, tasks }) {
  return (
    <div className="board-column">
      <div className="column-header">
        <h3>{title}</h3>

        <span>{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="empty-column">
          No tasks
        </p>
      ) : (
        tasks.map((task) => (
          <BoardTask
            key={task._id}
            task={task}
          />
        ))
      )}
    </div>
  );
}

export default BoardColumn;