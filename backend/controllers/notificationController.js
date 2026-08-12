import Notification from "../models/Notification.js";
import Project from "../models/Project.js";

/*
|--------------------------------------------------------------------------
| Create One Personal Notification
|--------------------------------------------------------------------------
|
| Creates a notification for ONE specific user.
| The actor will never receive their own notification.
|
*/

export const createNotification = async ({
  recipientId,
  actorId,
  projectId,
  taskId,
  type,
  message,
  app,
}) => {
  try {
    // ------------------------------------------
    // Validate recipient
    // ------------------------------------------

    if (!recipientId) {
      console.warn(
        "⚠️ Notification skipped: recipientId is missing."
      );

      return null;
    }

    // ------------------------------------------
    // Never notify the actor
    // ------------------------------------------

    if (
      actorId &&
      recipientId.toString() === actorId.toString()
    ) {
      console.log(
        "ℹ️ Notification skipped: actor and recipient are the same user."
      );

      return null;
    }

    // ------------------------------------------
    // Create notification in MongoDB
    // ------------------------------------------

    const notification = await Notification.create({
      user: recipientId,
      actor: actorId,
      type,
      message,
      project: projectId,
      task: taskId,
    });

    console.log("🔔 Notification created:");
    console.log("   Recipient:", recipientId.toString());
    console.log("   Actor:", actorId?.toString());
    console.log("   Type:", type);
    console.log("   Message:", message);

    // ------------------------------------------
    // Get Socket.io instance
    // ------------------------------------------

    const io = app?.get("io");

    if (!io) {
      console.warn(
        "⚠️ Socket.io instance is not available."
      );

      return notification;
    }

    // ------------------------------------------
    // Personal user room
    // ------------------------------------------

    const roomName =
      `user:${recipientId.toString()}`;

    console.log(
      `📡 Sending notification to room: ${roomName}`
    );

    // ------------------------------------------
    // Send real-time notification
    // ------------------------------------------

    io.to(roomName).emit(
      "newNotification",
      {
        id: notification._id,
        _id: notification._id,

        user: notification.user,
        actor: notification.actor,

        type: notification.type,
        message: notification.message,

        project: notification.project,
        task: notification.task,

        read: notification.read,
        createdAt: notification.createdAt,
      }
    );

    console.log(
      `✅ Notification sent to ${roomName}`
    );

    return notification;
  } catch (error) {
    console.error(
      "❌ Failed to create notification:",
      error
    );

    return null;
  }
};

/*
|--------------------------------------------------------------------------
| Create Notifications For Project Members
|--------------------------------------------------------------------------
|
| Sends the same notification to every project member
| except the person who performed the action.
|
*/

export const createNotificationsForProject = async ({
  actorId,
  projectId,
  taskId,
  type,
  message,
  app,
}) => {
  try {
    // ------------------------------------------
    // Find project
    // ------------------------------------------

    const project = await Project.findById(
      projectId
    ).populate("members", "_id");

    if (!project) {
      console.warn(
        "⚠️ Project notification skipped: project not found."
      );

      return [];
    }

    const notifications = [];

    // ------------------------------------------
    // Notify project members
    // ------------------------------------------

    for (const member of project.members) {
      if (
        member._id.toString() ===
        actorId?.toString()
      ) {
        continue;
      }

      const notification =
        await createNotification({
          recipientId: member._id,
          actorId,
          projectId,
          taskId,
          type,
          message,
          app,
        });

      if (notification) {
        notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error(
      "❌ Failed to create project notifications:",
      error
    );

    return [];
  }
};

/*
|--------------------------------------------------------------------------
| Get Current User Notifications
|--------------------------------------------------------------------------
*/

export const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate(
          "actor",
          "name email"
        );

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "❌ Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Mark Notification As Read
|--------------------------------------------------------------------------
*/

export const markAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findById(
        req.params.id
      );

    // ----------------------------------------
    // Make sure notification belongs to user
    // ----------------------------------------

    if (
      !notification ||
      notification.user.toString() !==
        req.user._id.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // ----------------------------------------
    // Mark as read
    // ----------------------------------------

    notification.read = true;

    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "❌ Mark notification as read error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Clear Current User Notifications
|--------------------------------------------------------------------------
*/

export const clearNotifications = async (
  req,
  res
) => {
  try {
    await Notification.deleteMany({
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Notifications cleared",
    });
  } catch (error) {
    console.error(
      "❌ Clear notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};