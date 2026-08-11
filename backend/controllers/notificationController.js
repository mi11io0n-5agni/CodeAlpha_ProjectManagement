import Notification from "../models/Notification.js";
import Project from "../models/Project.js";

// Create notifications for all project members except the actor
export const createNotificationsForProject = async ({
  actorId,
  projectId,
  taskId,
  type,
  message,
  app,
}) => {
  try {
    const project = await Project.findById(projectId).populate(
      "members",
      "_id"
    );

    if (!project) return [];

    const notifications = [];

    for (const member of project.members) {
      if (member._id.toString() === actorId?.toString()) continue;

      const n = await Notification.create({
        user: member._id,
        actor: actorId,
        type,
        message,
        project: projectId,
        task: taskId,
      });

      notifications.push(n);

      // emit to socket room for user-specific updates if io is available
      const io = app.get("io");
      if (io) {
        io.to(projectId.toString()).emit("newNotification", {
          id: n._id,
          user: n.user,
          actor: n.actor,
          type: n.type,
          message: n.message,
          project: n.project,
          task: n.task,
          read: n.read,
          createdAt: n.createdAt,
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error("Failed to create notifications:", error);
    return [];
  }
};

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("actor", "name email");

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Clear all notifications for user
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.status(200).json({ success: true, message: "Notifications cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
