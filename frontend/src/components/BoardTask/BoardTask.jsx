import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";

import EditTaskModal from "../EditTaskModal/EditTaskModal";

import { deleteTask } from "../../services/taskService";

import "./BoardTask.css";

function BoardTask({
  task,
  index,
  onDeleted,
}) {
  const [openEdit, setOpenEdit] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTask(task._id);

      onDeleted();

    } catch (error) {

      console.error(error);

      alert("Failed to delete task.");

    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <Draggable
        draggableId={task._id}
        index={index}
      >
        {(provided) => (
          <div
            className="board-task"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={`priority-badge ${task.priority}`}>
              {task.priority?.toUpperCase()}
            </div>

            <h4>{task.title}</h4>

            <p>{task.description || "No description"}</p>

            <div className="task-info">

              <div>
                👤 {task.assignedTo?.name || "Unassigned"}
              </div>

              <div>
                📅 {formatDate(task.dueDate)}
              </div>

            </div>

            <div className="task-actions">

              <button
                className="edit-btn"
                onClick={() => setOpenEdit(true)}
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>

            </div>

          </div>
        )}
      </Draggable>

      <EditTaskModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        task={task}
        onUpdated={onDeleted}
      />
    </>
  );
}

export default BoardTask;