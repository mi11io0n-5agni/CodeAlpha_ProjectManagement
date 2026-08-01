import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in-progress",
        "completed"
      ],
      default: "todo",
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high"
      ],
      default: "medium",
    },

    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


const Task = mongoose.model("Task", taskSchema);

export default Task;