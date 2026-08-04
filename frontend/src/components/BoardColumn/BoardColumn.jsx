import { Droppable } from "@hello-pangea/dnd";

import BoardTask from "../BoardTask/BoardTask";

import "./BoardColumn.css";

function BoardColumn({
  title,
  status,
  tasks,
  reloadTasks,
}) {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          className="board-column"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className="column-header">
            <h3>{title}</h3>

            <span>{tasks.length}</span>
          </div>

          {tasks.map((task, index) => (
            <BoardTask
              key={task._id}
              task={task}
              index={index}
              onDeleted={reloadTasks}
            />
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default BoardColumn;