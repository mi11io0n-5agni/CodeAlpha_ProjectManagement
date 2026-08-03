import { useState } from "react";
import { useParams } from "react-router-dom";

import Board from "../../components/Board/Board";
import CreateTaskModal from "../../components/CreateTaskModal/CreateTaskModal";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();

  const [openModal, setOpenModal] = useState(false);

  const [refresh, setRefresh] = useState(false);

  const handleTaskCreated = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="project-details">

      <div className="project-header">

        <div>
          <h1>Project Board</h1>
          <p>Manage your project tasks.</p>
        </div>

        <button
          className="add-task-btn"
          onClick={() => setOpenModal(true)}
        >
          + New Task
        </button>

      </div>

      <Board
        projectId={id}
        refresh={refresh}
      />

      <CreateTaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        projectId={id}
        onTaskCreated={handleTaskCreated}
      />

    </div>
  );
}

export default ProjectDetails;