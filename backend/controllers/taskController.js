import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { createNotificationsForProject } from "./notificationController.js";

// Create Task
export const createTask = async (req,res)=>{
  try{
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate
    } = req.body;

    if (!title) {
  return res.status(400).json({
    success: false,
    message: "Task title is required",
  });
}

if (!projectId) {
  return res.status(400).json({
    success: false,
    message: "Project ID is required",
  });
}

    const project = await Project.findById(projectId);


    if(!project){

      return res.status(404).json({
        success:false,
        message:"Project not found"
      });

    }


    const task = await Task.create({

      title,
      description,
      project:projectId,
      assignedTo,
      createdBy:req.user._id,
      priority,
      dueDate

    });

    const io = req.app.get("io");

    io.to(projectId).emit("taskCreated", task);

    // Persist notifications for project members
    await createNotificationsForProject({
      actorId: req.user._id,
      projectId,
      taskId: task._id,
      type: "task",
      message: `${req.user.name || "Someone"} created a new task: ${task.title}`,
      app: req.app,
    });
    res.status(201).json({

      success:true,
      message:"Task created successfully",
      task

    });


  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server Error"
    });

  }

};


// Get Tasks of Project
export const getProjectTasks = async(req,res)=>{

 try{

   const tasks = await Task.find({
      project:req.params.projectId
   })
   .populate("assignedTo","name email")
   .populate("createdBy","name email");


   res.status(200).json({
      success:true,
      tasks
   });


 }catch(error){

   console.error(error);

   res.status(500).json({
      success:false,
      message:"Server Error"
   });

 }

};

// Get single task by id
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Task Status
export const updateTaskStatus = async(req,res)=>{

 try{

   const task = await Task.findById(req.params.id);


   if(!task){

    return res.status(404).json({
      success:false,
      message:"Task not found"
    });

   }


   const allowedStatus = [
  "todo",
  "in-progress",
  "review",
  "done",
];

if (!allowedStatus.includes(req.body.status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid task status",
  });
}

task.status = req.body.status;


  await task.save();

  await task.populate(
      "assignedTo",
      "name email"
    );

    await task.populate(
      "createdBy",
      "name email"
    );

   // Send real-time update
    const io = req.app.get("io");
    io.to(task.project.toString()).emit("taskUpdated", task);

   res.status(200).json({
     success:true,
     message:"Task updated",
     task
   });


 }catch(error){

   console.error(error);

   res.status(500).json({
     success:false,
     message:"Server Error"
   });

 }

};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
    } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;
    task.dueDate = dueDate ?? task.dueDate;
    task.assignedTo = assignedTo ?? task.assignedTo;

    await task.save();

    const io = req.app.get("io");

    io.to(task.project.toString()).emit("taskUpdated", task);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    const io = req.app.get("io");

    io.to(task.project.toString()).emit(
      "taskDeleted",
      task._id
    );

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};