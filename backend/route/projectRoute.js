import express from "express";
import authMiddlewareHybrid from "../authmiddleware/authMiddleware.js";
import { getProjects, createProject, getProjectById, updateProject, deleteProject } from "../controller/ProjectController.js";

const router = express.Router();

//Basic crud operations for projects

router.get("/projects", authMiddlewareHybrid, getProjects); //get all projects
router.post("/projects", authMiddlewareHybrid, createProject); //create a project
router.get("/projects/:id", authMiddlewareHybrid, getProjectById); //get a project by id
router.put("/projects/:id", authMiddlewareHybrid, updateProject); //update a project
router.delete("/projects/:id", authMiddlewareHybrid, deleteProject);  //delete a project

export default router;