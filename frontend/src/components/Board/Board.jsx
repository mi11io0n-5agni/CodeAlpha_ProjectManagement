import { useEffect, useState } from "react";

import { DragDropContext } from "@hello-pangea/dnd";

import BoardColumn from "../BoardColumn/BoardColumn";

import {
  getProjectTasks,
  updateTaskStatus,
} from "../../services/taskService";

import socket from "../../services/socket";

import "./Board.css";

function Board({
  projectId,
  refresh,
  selectedTaskId,
}) {
  const [tasks, setTasks] = useState([]);

  // ============================
  // Load Tasks
  // ============================

  const loadTasks = async () => {
    try {
      const data =
        await getProjectTasks(projectId);

      setTasks(data.tasks || []);
    } catch (error) {
      console.error(
        "Failed to load tasks:",
        error
      );
    }
  };

  // ============================
  // Load when project / refresh changes
  // ============================

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId, refresh]);

  // ============================
  // Socket.io
  // ============================

  useEffect(() => {
    if (!projectId) {
      return;
    }

    // Join project room
    socket.emit(
      "joinProject",
      projectId
    );

    console.log(
      "Joined project room:",
      projectId
    );

    // ============================
    // Task Created
    // ============================

    const handleTaskCreated = (
      task
    ) => {
      console.log(
        "Real-time task created:",
        task
      );

      if (
        task.project?.toString() ===
        projectId
      ) {
        setTasks((prevTasks) => {

          const exists =
            prevTasks.some(
              (existingTask) =>
                existingTask._id ===
                task._id
            );

          if (exists) {
            return prevTasks;
          }

          return [
            ...prevTasks,
            task,
          ];
        });
      }
    };

    // ============================
    // Task Updated
    // ============================

    const handleTaskUpdated = (
      updatedTask
    ) => {
      console.log(
        "Real-time task updated:",
        updatedTask
      );

      if (
        updatedTask.project?.toString() ===
        projectId
      ) {
        setTasks((prevTasks) =>
          prevTasks.map(
            (task) =>
              task._id ===
              updatedTask._id
                ? updatedTask
                : task
          )
        );
      }
    };

    // ============================
    // Task Deleted
    // ============================

    const handleTaskDeleted = (
      taskId
    ) => {
      console.log(
        "Real-time task deleted:",
        taskId
      );

      setTasks((prevTasks) =>
        prevTasks.filter(
          (task) =>
            task._id !== taskId
        )
      );
    };

    // ============================
    // Socket listeners
    // ============================

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

    // ============================
    // Cleanup
    // ============================

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

  // ============================
  // Drag & Drop
  // ============================

  const handleDragEnd = async (
    result
  ) => {
    const {
      destination,
      source,
      draggableId,
    } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId ===
        source.droppableId &&
      destination.index ===
        source.index
    ) {
      return;
    }

    const newStatus =
      destination.droppableId;

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

  // ============================
  // Filter Tasks
  // ============================

  const todo = tasks.filter(
    (task) =>
      task.status === "todo"
  );

  const progress = tasks.filter(
    (task) =>
      task.status === "in-progress"
  );

  const review = tasks.filter(
    (task) =>
      task.status === "review"
  );

  const done = tasks.filter(
    (task) =>
      task.status === "done"
  );

  // ============================
  // Render
  // ============================

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
          selectedTaskId={
            selectedTaskId
          }
        />

        <BoardColumn
          title="In Progress"
          status="in-progress"
          tasks={progress}
          reloadTasks={loadTasks}
          selectedTaskId={
            selectedTaskId
          }
        />

        <BoardColumn
          title="Review"
          status="review"
          tasks={review}
          reloadTasks={loadTasks}
          selectedTaskId={
            selectedTaskId
          }
        />

        <BoardColumn
          title="Done"
          status="done"
          tasks={done}
          reloadTasks={loadTasks}
          selectedTaskId={
            selectedTaskId
          }
        />

      </div>

    </DragDropContext>
  );
}

export default Board;