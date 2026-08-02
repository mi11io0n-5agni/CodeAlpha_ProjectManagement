import "./BoardTask.css";

function BoardTask({ task }) {
  return (
    <div className="board-task">
      <h4>{task.title}</h4>

      <p>{task.description}</p>

      <span className="priority">
        {task.priority}
      </span>
    </div>
  );
}

export default BoardTask;