import "./Board.css";

import BoardColumn from "../BoardColumn/BoardColumn";

function Board() {

  const todo = [
    {
      id:1,
      title:"Design Login",
      description:"Create login page",
      priority:"High"
    }
  ];

  const progress = [
    {
      id:2,
      title:"API Integration",
      description:"Connect frontend",
      priority:"Medium"
    }
  ];

  const review = [];

  const done = [
    {
      id:3,
      title:"Authentication",
      description:"Backend completed",
      priority:"Done"
    }
  ];

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