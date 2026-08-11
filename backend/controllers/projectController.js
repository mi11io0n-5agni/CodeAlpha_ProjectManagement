import Project from "../models/Project.js";
import User from "../models/User.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Get My Projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Get Single Project
export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      members: req.user._id,
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Add Member to Project
export const addProjectMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;

    // Check email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only project owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can add members",
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No registered user found with this email",
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (memberId) =>
        memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    // Add user to project
    project.members.push(user._id);

    await project.save();

    // Populate members before returning
    await project.populate("owner", "name email");
    await project.populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can update this project",
      });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    await project.populate("owner", "name email");
    await project.populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can delete this project",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Remove member from project
export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can remove members",
      });
    }

    if (memberId === project.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: "Project owner cannot be removed",
      });
    }

    const memberIndex = project.members.findIndex(
      (member) => member.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found in project",
      });
    }

    project.members.splice(memberIndex, 1);

    await project.save();

    await project.populate("owner", "name email");
    await project.populate("members", "name email");

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};