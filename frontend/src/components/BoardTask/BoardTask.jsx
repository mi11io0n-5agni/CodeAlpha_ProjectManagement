import {
  deleteTask
} from "../../services/taskService";
import "./BoardTask.css";

function BoardTask({
  task,
  onDeleted,
}) {

  const handleDelete = async () => {

    const ok = window.confirm(
      "Delete this task?"
    );

    if (!ok) return;

    try {

      await deleteTask(task._id);

      onDeleted();

    } catch (error) {

      console.error(error);

      alert("Delete failed.");

    }

  };

  const priorityClass =
    task.priority || "medium";

  return (
    <div className="board-task">

      <div
        className={`priority-badge ${priorityClass}`}
      >
        {task.priority}
      </div>

      <h4>{task.title}</h4>

      <p>{task.description}</p>

      <div className="task-info">

        <span>
          👤{" "}
          {task.assignedTo?.name ||
            "Unassigned"}
        </span>

        <span>
          📅{" "}
          {task.dueDate
            ? new Date(
                task.dueDate
              ).toLocaleDateString()
            : "No deadline"}
        </span>

      </div>

      <div className="task-actions">

        <button
          className="delete-btn"
          onClick={handleDelete}
        >
          Delete
        </button>

      </div>

    </div>
  );
}

export default BoardTask;