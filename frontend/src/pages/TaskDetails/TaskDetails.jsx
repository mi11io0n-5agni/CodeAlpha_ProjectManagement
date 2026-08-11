import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getTask } from "../../services/taskService";
import TaskComments from "../../components/TaskComments/TaskComments";
import EditTaskModal from "../../components/EditTaskModal/EditTaskModal";
import "./TaskDetails.css";

function TaskDetails() {
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTask(taskId);
        setTask(data.task);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load task details.");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) load();
  }, [taskId]);

  if (loading) return <div>Loading task...</div>;

  if (!task) return <div>Task not found.</div>;

  return (
    <div className="task-details-page">
      <div className="task-header">
        <h2>{task.title}</h2>

        <div className="task-actions">
          <button onClick={() => setOpenEdit(true)}>Edit</button>
        </div>
      </div>

      <p>{task.description || "No description."}</p>

      <div className="task-meta">
        <div>Priority: {task.priority}</div>
        <div>Status: {task.status}</div>
        <div>Assigned: {task.assignedTo?.name || "Unassigned"}</div>
      </div>

      <TaskComments taskId={task._id} />

      <EditTaskModal open={openEdit} onClose={() => setOpenEdit(false)} task={task} onUpdated={() => window.location.reload()} />
    </div>
  );
}

export default TaskDetails;
