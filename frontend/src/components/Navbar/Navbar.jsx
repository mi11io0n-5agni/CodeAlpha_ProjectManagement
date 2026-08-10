import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const unreadCount = notifications.length;

  useEffect(() => {
   const handleNewComment = (comment) => {
  const notification = {
    id: `comment-${Date.now()}`,
    type: "comment",
    message: `${comment.user?.name || "Someone"} commented on a task`,
    time: new Date(),

    taskId: comment.taskId,
    projectId: comment.projectId,
  };

  setNotifications((prev) => [
    notification,
    ...prev,
  ]);
};
    const handleTaskCreated = (task) => {
      const notification = {
        id: `created-${Date.now()}`,
        type: "task",
        message: `New task created: ${task.title}`,
        time: new Date(),
      };

      setNotifications((prev) => [
        notification,
        ...prev,
      ]);
    };

    const handleTaskUpdated = (task) => {
      const notification = {
        id: `updated-${Date.now()}`,
        type: "update",
        message: `Task updated: ${task.title}`,
        time: new Date(),
      };

      setNotifications((prev) => [
        notification,
        ...prev,
      ]);
    };

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
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
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

                <h3>Notifications</h3>

                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="clear-btn"
                  >
                    Clear
                  </button>
                )}

              </div>

              {notifications.length === 0 ? (
                <div className="empty-notifications">
                  <span>🔔</span>
                  <p>No new notifications</p>
                </div>
              ) : (
                <div className="notification-list">

                  {notifications.map(
                    (notification) => (
                      <div
          key={notification.id}
          className="notification-item"
          onClick={() => {
          if (
            notification.projectId &&
            notification.taskId
          ) {
            setShowNotifications(false);

            navigate(
              `/projects/${notification.projectId}?task=${notification.taskId}`
            );
          }
        }}
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
                            {notification.message}
                          </p>

                          <span>
                            Just now
                          </span>

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
            <h4>{user.name}</h4>
            <span>Welcome Back</span>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;