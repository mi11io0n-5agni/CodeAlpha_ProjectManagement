import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/authService";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data.user);
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to load profile."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await updateProfile({
        name: profile.name,
        email: profile.email,
      });

      setProfile(data.user);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword:
          passwordForm.currentPassword,
        newPassword:
          passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h1>My Profile</h1>
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-grid">
        <div className="profile-card">
          <h2>Account Details</h2>

          <form onSubmit={submitProfile}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
            />

            <label>Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
            />

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="profile-card">
          <h2>Change Password</h2>

          <form onSubmit={submitPassword}>
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />

            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
