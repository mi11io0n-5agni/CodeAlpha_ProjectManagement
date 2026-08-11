import { useEffect, useState } from "react";

import { Draggable } from "@hello-pangea/dnd";

import EditTaskModal from "../EditTaskModal/EditTaskModal";

import { deleteTask } from "../../services/taskService";
import { toast } from "react-toastify";
import TaskComments from "../TaskComments/TaskComments";

import "./BoardTask.css";

function BoardTask({
  task,
  index,
  onDeleted,
  selectedTaskId,
}) {
  const [openEdit, setOpenEdit] = useState(false);

  // ============================
  // Automatically focus task
  // when opened from notification
  // ============================

  useEffect(() => {
    if (
      selectedTaskId &&
      task._id === selectedTaskId
    ) {
      const timer = setTimeout(() => {
        const taskElement =
          document.getElementById(
            `task-${task._id}`
          );

        if (taskElement) {
          taskElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [selectedTaskId, task._id]);

  // ============================
  // Delete Task
  // ============================

  const handleDelete = async () => {
    const confirmDelete = toast.info(
      "Are you sure you want to delete this task?",
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );

    if (!confirmDelete) return;

    try {
      await deleteTask(task._id);

      onDeleted();

      toast.success(
        "Task deleted successfully."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to delete task."
      );
    }
  };

  // ============================
  // Format Date
  // ============================

  const formatDate = (date) => {
    if (!date) {
      return "No deadline";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  // ============================
  // Selected Task
  // ============================

  const isSelected =
    selectedTaskId === task._id;

  // ============================
  // Render
  // ============================

  return (
    <>
      <Draggable
        draggableId={task._id}
        index={index}
      >
        {(provided) => (
          <div
            id={`task-${task._id}`}
            className={`board-task ${
              isSelected
                ? "selected-task"
                : ""
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div
              className={`priority-badge ${task.priority}`}
            >
              {task.priority?.toUpperCase()}
            </div>

            <h4>{task.title}</h4>

            <p>
              {task.description ||
                "No description"}
            </p>

            <div className="task-info">
              <div>
                👤{" "}
                {task.assignedTo?.name ||
                  "Unassigned"}
              </div>

              <div>
                📅{" "}
                {formatDate(
                  task.dueDate
                )}
              </div>
            </div>

            <div className="task-actions">
              <button
                className="edit-btn"
                onClick={() =>
                  setOpenEdit(true)
                }
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

            <TaskComments
              taskId={task._id}
            />
          </div>
        )}
      </Draggable>

      <EditTaskModal
        open={openEdit}
        onClose={() =>
          setOpenEdit(false)
        }
        task={task}
        onUpdated={onDeleted}
      />
    </>
  );
}

export default BoardTask;