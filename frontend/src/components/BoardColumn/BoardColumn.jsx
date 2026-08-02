import BoardTask from "../BoardTask/BoardTask";
import "./BoardColumn.css";

function BoardColumn({ title, tasks }) {
  return (
    <div className="board-column">

      <div className="column-header">

        <h3>{title}</h3>

        <span>{tasks.length}</span>

      </div>

      {tasks.map((task) => (
        <BoardTask
          key={task.id}
          task={task}
        />
      ))}

    </div>
  );
}

export default BoardColumn;