import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getDashboardStats = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    });

    const projectIds = projects.map((project) => project._id);

    const tasks = await Task.find({
      project: {
        $in: projectIds,
      },
    });

    const completedTasks = tasks.filter(
      (task) => task.status === "done"
    );

    const members = new Set();

    projects.forEach((project) => {
      project.members.forEach((member) => {
        members.add(member.toString());
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        projects: projects.length,
        tasks: tasks.length,
        completed: completedTasks.length,
        members: members.size,
      },
      recentProjects: projects
        .sort(
          (a, b) =>
            b.createdAt - a.createdAt
        )
        .slice(0, 5),
      recentTasks: tasks
        .sort(
          (a, b) =>
            b.createdAt - a.createdAt
        )
        .slice(0, 5),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};