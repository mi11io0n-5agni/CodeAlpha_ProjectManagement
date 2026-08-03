import { useParams } from "react-router-dom";
import Board from "../../components/Board/Board";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();

  return (
    <div>
      <h1>TaskFlow Board</h1>

      <Board projectId={id} />
    </div>
  );
}

export default ProjectDetails;