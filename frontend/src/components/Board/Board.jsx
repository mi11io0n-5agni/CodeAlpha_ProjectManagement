import { useEffect, useState } from "react";

import { DragDropContext } from "@hello-pangea/dnd";

import BoardColumn from "../BoardColumn/BoardColumn";

import {
  getProjectTasks,
  updateTaskStatus,
} from "../../services/taskService";

import socket from "../../services/socket";

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

  // Load tasks when project changes
  // or when the parent asks for a refresh
  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId, refresh]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!projectId) {
      return;
    }

    // Join this project's Socket.io room
    socket.emit("joinProject", projectId);

    console.log("Joined project room:", projectId);

    // New task created
    const handleTaskCreated = (task) => {
      console.log("Real-time task created:", task);

      if (task.project?.toString() === projectId) {
        setTasks((prevTasks) => {
          const exists = prevTasks.some(
            (existingTask) => existingTask._id === task._id
          );

          if (exists) {
            return prevTasks;
          }

          return [...prevTasks, task];
        });
      }
    };

    // Task updated
    const handleTaskUpdated = (updatedTask) => {
      console.log("Real-time task updated:", updatedTask);

      if (updatedTask.project?.toString() === projectId) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === updatedTask._id
              ? updatedTask
              : task
          )
        );
      }
    };

    // Task deleted
    const handleTaskDeleted = (taskId) => {
      console.log("Real-time task deleted:", taskId);

      setTasks((prevTasks) =>
        prevTasks.filter(
          (task) => task._id !== taskId
        )
      );
    };

    socket.on(
      "taskCreated",
      handleTaskCreated
    );

    socket.on(
      "taskUpdated",
      handleTaskUpdated
    );

    socket.on(
      "taskDeleted",
      handleTaskDeleted
    );

    // Cleanup listeners when project changes
    return () => {
      socket.off(
        "taskCreated",
        handleTaskCreated
      );

      socket.off(
        "taskUpdated",
        handleTaskUpdated
      );

      socket.off(
        "taskDeleted",
        handleTaskDeleted
      );
    };
  }, [projectId]);

  const handleDragEnd = async (result) => {
    const {
      destination,
      source,
      draggableId,
    } = result;

    if (!destination) {
      return;
    }

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