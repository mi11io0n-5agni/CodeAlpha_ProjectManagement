import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { connectSocket } from "../../services/socket";

import {
  getNotifications as fetchNotifications,
  markNotificationAsRead,
  clearNotifications as clearNotificationsApi,
} from "../../services/notificationService";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    let socket;

    // ------------------------------------------
    // Load saved notifications from database
    // ------------------------------------------

    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();

        setNotifications(data.notifications || []);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      }
    };

    loadNotifications();

    // ------------------------------------------
    // Connect to Socket.io
    // ------------------------------------------

    socket = connectSocket();

    if (!socket) {
      console.warn(
        "Notification socket was not connected."
      );

      return;
    }

    // ------------------------------------------
    // New persistent notification
    // ------------------------------------------

    const handleNewNotification = (notification) => {
      console.log(
        "🔔 New notification received:",
        notification
      );

      const newNotification = {
        id:
          notification.id ||
          notification._id,

        _id:
          notification.id ||
          notification._id,

        type: notification.type,

        message: notification.message,

        time: notification.createdAt
          ? new Date(notification.createdAt)
          : new Date(),

        taskId: notification.task,

        projectId: notification.project,

        read: notification.read || false,

        actor: notification.actor,
      };

      setNotifications((previous) => [
        newNotification,
        ...previous,
      ]);
    };

    // ------------------------------------------
    // Socket connection
    // ------------------------------------------

    const handleConnect = () => {
      console.log(
        "🟢 Notification socket connected:",
        socket.id
      );
    };

    const handleConnectError = (error) => {
      console.error(
        "🔴 Notification socket error:",
        error.message
      );
    };

    // ------------------------------------------
    // Socket listeners
    // ------------------------------------------

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "newNotification",
      handleNewNotification
    );

    // ------------------------------------------
    // Cleanup
    // ------------------------------------------

    return () => {
      if (!socket) {
        return;
      }

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "newNotification",
        handleNewNotification
      );
    };
  }, []);

  // ------------------------------------------
  // Open notification
  // ------------------------------------------

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      // Mark notification as read
      if (
        notification._id &&
        !notification.read
      ) {
        await markNotificationAsRead(
          notification._id
        );

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  read: true,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }

    setShowNotifications(false);

    // Open the exact task
    if (
      notification.projectId &&
      notification.taskId
    ) {
      navigate(
        `/projects/${notification.projectId}?task=${notification.taskId}`
      );
    }
  };

  // ------------------------------------------
  // Clear all notifications
  // ------------------------------------------

  const clearNotifications = async () => {
    try {
      await clearNotificationsApi();

      setNotifications([]);
    } catch (error) {
      console.error(
        "Failed to clear notifications:",
        error
      );
    } finally {
      setShowNotifications(false);
    }
  };

  // ------------------------------------------
  // Notification icon
  // ------------------------------------------

  const getNotificationIcon = (type) => {
    switch (type) {
      case "comment":
        return "💬";

      case "task":
        return "📋";

      case "update":
        return "🔄";

      default:
        return "🔔";
    }
  };

  return (
    <header className="navbar">
      {/* ------------------------------------ */}
      {/* Left */}
      {/* ------------------------------------ */}

      <div className="navbar-left">
        <h2>Dashboard</h2>
      </div>

      {/* ------------------------------------ */}
      {/* Right */}
      {/* ------------------------------------ */}

      <div className="navbar-right">
        {/* ---------------------------------- */}
        {/* Notifications */}
        {/* ---------------------------------- */}

        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-btn"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
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
              {/* Header */}

              <div className="notification-header">
                <h3>Notifications</h3>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={
                      clearNotifications
                    }
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Empty state */}

              {notifications.length === 0 ? (
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
                          notification.id ||
                          notification._id
                        }
                        className={`notification-item ${
                          notification.read
                            ? "read"
                            : "unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >
                        {/* Icon */}

                        <div className="notification-icon">
                          {getNotificationIcon(
                            notification.type
                          )}
                        </div>

                        {/* Content */}

                        <div className="notification-content">
                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <span>
                            {notification.time
                              ? new Date(
                                  notification.time
                                ).toLocaleString()
                              : notification.createdAt
                              ? new Date(
                                  notification.createdAt
                                ).toLocaleString()
                              : "Just now"}
                          </span>
                        </div>

                        {/* Arrow */}

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

        {/* ---------------------------------- */}
        {/* User */}
        {/* ---------------------------------- */}

        <div className="user-info">
          <div className="avatar">
            {user.name
              ?.charAt(0)
              .toUpperCase() || "U"}
          </div>

          <div>
            <h4>
              {user.name || "User"}
            </h4>

            <span>Welcome Back</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;