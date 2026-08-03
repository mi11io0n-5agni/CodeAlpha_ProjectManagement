import Task from "../models/Task.js";
import Project from "../models/Project.js";

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