import Project from "../models/Project.js";


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
      success:false,
      message:"Server Error",
    });

  }
};



// Get My Projects
export const getProjects = async (req,res)=>{

  try{

    const projects = await Project.find({
      members:req.user._id
    })
    .populate("owner","name email")
    .populate("members","name email");


    res.status(200).json({
      success:true,
      projects
    });


  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server Error"
    });

  }

};