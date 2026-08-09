import { useEffect, useState } from "react";

import { DragDropContext } from "@hello-pangea/dnd";

import BoardColumn from "../BoardColumn/BoardColumn";

import {
  getProjectTasks,
  updateTaskStatus,
} from "../../services/taskService";

import "./Board.css";

function Board({ projectId, refresh }) {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    try {
      const data = await getProjectTasks(projectId);

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId, refresh]);

  const handleDragEnd = async (result) => {
    const {
      destination,
      source,
      draggableId,
    } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    try {
      await updateTaskStatus(
        draggableId,
        newStatus
      );

      await loadTasks();
    } catch (error) {
      console.error(
        "Failed to update task status:",
        error
      );
    }
  };

  const todo = tasks.filter(
    (task) => task.status === "todo"
  );

  const progress = tasks.filter(
    (task) => task.status === "in-progress"
  );

  const review = tasks.filter(
    (task) => task.status === "review"
  );

  const done = tasks.filter(
    (task) => task.status === "done"
  );

  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
    >
      <div className="board">

        <BoardColumn
          title="Todo"
          status="todo"
          tasks={todo}
          reloadTasks={loadTasks}
        />

        <BoardColumn
          title="In Progress"
          status="in-progress"
          tasks={progress}
          reloadTasks={loadTasks}
        />

        <BoardColumn
          title="Review"
          status="review"
          tasks={review}
          reloadTasks={loadTasks}
        />

        <BoardColumn
          title="Done"
          status="done"
          tasks={done}
          reloadTasks={loadTasks}
        />

      </div>
    </DragDropContext>
  );
}

export default Board;