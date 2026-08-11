import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import {
  getNotifications as fetchNotifications,
  markNotificationAsRead,
  clearNotifications as clearNotificationsApi,
} from "../../services/notificationService";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length || notifications.length;

  useEffect(() => {
    // load persisted notifications
    (async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    })();

    // ============================
    // New Comment
    // ============================

    const handleNewComment = (comment) => {
      const notification = {
        id: comment.id || `comment-${Date.now()}`,
        _id: comment.id,
        type: "comment",
        message: `${comment.user?.name || "Someone"} commented on a task`,
        time: new Date(),
        taskId: comment.taskId,
        projectId: comment.projectId,
      };

      setNotifications((prev) => [notification, ...prev]);
    };

    // ============================
    // New Task
    // ============================

    const handleTaskCreated = (task) => {
      const notification = {
        id: task._id ? `task-${task._id}` : `created-${Date.now()}`,
        _id: task._id,
        type: "task",
        message: `New task created: ${task.title}`,
        time: new Date(),
        taskId: task._id,
        projectId: task.project,
      };

      setNotifications((prev) => [notification, ...prev]);
    };

    // ============================
    // Task Updated
    // ============================

    const handleTaskUpdated = (task) => {
      const notification = {
        id: task._id ? `update-${task._id}` : `updated-${Date.now()}`,
        _id: task._id,
        type: "update",
        message: `Task updated: ${task.title}`,
        time: new Date(),
        taskId: task._id,
        projectId: task.project,
      };

      setNotifications((prev) => [notification, ...prev]);
    };

    // listen for persisted notification events (sent when server creates them)
    const handleNewPersisted = (n) => {
      const notification = {
        id: n.id || n._id,
        _id: n.id || n._id,
        type: n.type,
        message: n.message,
        time: n.createdAt ? new Date(n.createdAt) : new Date(),
        taskId: n.task,
        projectId: n.project,
      };

      setNotifications((prev) => [notification, ...prev]);
    };

    // ============================
    // Socket listeners
    // ============================

    socket.on(
      "newComment",
      handleNewComment
    );

    socket.on(
      "taskCreated",
      handleTaskCreated
    );

    socket.on(
      "taskUpdated",
      handleTaskUpdated
    );

    socket.on("newNotification", handleNewPersisted);

    // ============================
    // Cleanup
    // ============================

    return () => {
      socket.off(
        "newComment",
        handleNewComment
      );

      socket.off(
        "taskCreated",
        handleTaskCreated
      );

      socket.off(
        "taskUpdated",
        handleTaskUpdated
      );

      socket.off("newNotification", handleNewPersisted);
    };
  }, []);

  // ============================
  // Open notification
  // ============================

  const handleNotificationClick = (
    notification
  ) => {
    if (
      notification.projectId &&
      notification.taskId
    ) {
      (async () => {
        try {
          if (notification._id) {
            await markNotificationAsRead(notification._id);
          }
        } catch (err) {
          console.error("Failed to mark notification read", err);
        }

        setShowNotifications(false);

        navigate(
          `/projects/${notification.projectId}?task=${notification.taskId}`
        );
      })();
    }
  };

  // ============================
  // Clear notifications
  // ============================

  const clearNotifications = () => {
    (async () => {
      try {
        await clearNotificationsApi();
        setNotifications([]);
      } catch (err) {
        console.error("Failed to clear notifications", err);
      } finally {
        setShowNotifications(false);
      }
    })();
  };

  return (
    <header className="navbar">

      <div className="navbar-left">
        <h2>Dashboard</h2>
      </div>

      <div className="navbar-right">

        {/* Notification */}
        <div className="notification-wrapper">

          <button
            className="notification-btn"
            onClick={() =>
              setShowNotifications(
                (prev) => !prev
              )
            }
          >
            🔔

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">

              <div className="notification-header">

                <h3>
                  Notifications
                </h3>

                {notifications.length > 0 && (
                  <button
                    onClick={
                      clearNotifications
                    }
                    className="clear-btn"
                  >
                    Clear
                  </button>
                )}

              </div>

              {notifications.length ===
              0 ? (
                <div className="empty-notifications">

                  <span>🔔</span>

                  <p>
                    No new notifications
                  </p>

                </div>
              ) : (
                <div className="notification-list">

                  {notifications.map(
                    (notification) => (
                      <div
                        key={
                          notification.id
                        }
                        className="notification-item"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >

                        <div className="notification-icon">
                          {notification.type ===
                          "comment"
                            ? "💬"
                            : notification.type ===
                              "task"
                            ? "📋"
                            : "🔄"}
                        </div>

                        <div className="notification-content">

                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <span>
                            {notification.time
                              ? new Date(notification.time).toLocaleString()
                              : notification.createdAt
                              ? new Date(notification.createdAt).toLocaleString()
                              : "Just now"}
                          </span>

                        </div>

                        <div className="notification-arrow">
                          →
                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* User */}
        <div className="user-info">

          <div className="avatar">
            {user.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>

            <h4>
              {user.name}
            </h4>

            <span>
              Welcome Back
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;