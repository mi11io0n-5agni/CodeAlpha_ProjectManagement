import { useEffect, useState } from "react";

import BoardColumn from "../BoardColumn/BoardColumn";
import { getProjectTasks } from "../../services/taskService";

import "./Board.css";

function Board({ projectId }) {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    try {
      const data = await getProjectTasks(projectId);
      setTasks(data.tasks);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

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
    <div className="board">
      <BoardColumn
        title="Todo"
        tasks={todo}
      />

      <BoardColumn
        title="In Progress"
        tasks={progress}
      />

      <BoardColumn
        title="Review"
        tasks={review}
      />

      <BoardColumn
        title="Done"
        tasks={done}
      />
    </div>
  );
}

export default Board;