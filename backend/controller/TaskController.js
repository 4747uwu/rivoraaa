import { Task } from "../models/TaskModel.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

// Create a new task
export const createTask = async (req, res) => {
    try {
        // Ensure required fields are set from the authenticated user if not provided
        const data = { ...req.body };
        if (!data.createdBy) {
            if (req.user && req.user._id) {
                data.createdBy = req.user._id;
            } else {
                return res.status(400).json({ message: "createdBy is required" });
            }
        }
        if (!data.assignedBy) {
            if (req.user && req.user._id) {
                data.assignedBy = req.user._id;
            } else {
                return res.status(400).json({ message: "assignedBy is required" });
            }
        }

        const task = new Task(data);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Get all tasks
export const getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;

        // If projectId is provided, filter tasks by project
        const query = projectId ? { projectId } : {};

        const tasks = await Task.find(query)
            .populate({
                path: 'assignedTo',
                select: 'username email profilePicture'
            })
            .populate({
                path: 'createdBy',
                select: 'username email profilePicture'
            })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a task by ID
export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a task
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Remove task ID from assigned users
        await User.updateMany(
            { tasks: req.params.id },
            { $pull: { tasks: req.params.id } }
        );

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign users to a task
export const assignUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedTo: { $each: userIds } } },
            { new: true }
        ).populate('assignedTo');
        console.log(task);

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unassign a user from a task
export const unassignUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { $pull: { assignedTo: userId } },
            { new: true }
        ).populate('assignedTo');

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a subtask
export const addSubtask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, {
            $push: { subtasks: req.body.subtaskId },
        }, { new: true });

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update progress of a task
export const updateProgress = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, {
            progress: req.body.progress,
        }, { new: true });

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
