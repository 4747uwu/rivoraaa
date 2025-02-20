import Subtask from "../models/SubTask.js";
import {Task} from "../models/TaskModel.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

export const addSubtask = async (req, res) => {
    try {
        const { title, description } = req.body; // Fixed typo in req.bodyu
        const { taskId } = req.params;

        // Validate input
        if (!title || !taskId) {
            return res.status(400).json({
                success: false,
                message: 'Title and taskId are required'
            });
        }

        // Check if parent task exists
        const parentTask = await Task.findById(taskId);
        if (!parentTask) {
            return res.status(404).json({
                success: false,
                message: 'Parent task not found'
            });
        }

        const subtask = new Subtask({
            title,
            description,
            parentTask: taskId,
            status: 'pending',
            createdAt: new Date()
        });

        await subtask.save();

        // Update parent task with new subtask
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $push: { subtasks: subtask._id },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        ).populate('subtasks');

        res.status(201).json({
            success: true,
            data: subtask,
            task: updatedTask
        });

    } catch (error) {
        console.error('Add subtask error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add subtask',
            error: error.message
        });
    }
};

export const removeSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;

        // Check if subtask exists
        const subtask = await Subtask.findById(subtaskId);
        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found'
            });
        }

        // Remove subtask and update parent task atomically
        const [deletedSubtask, updatedTask] = await Promise.all([
            Subtask.findByIdAndDelete(subtaskId),
            Task.findOneAndUpdate(
                { subtasks: subtaskId },
                {
                    $pull: { subtasks: subtaskId },
                    $set: { updatedAt: new Date() }
                },
                { new: true }
            ).populate('subtasks')
        ]);

        res.status(200).json({
            success: true,
            message: 'Subtask removed successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Remove subtask error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove subtask',
            error: error.message
        });
    }
};

export const getSubtasks = async (req, res) => {
    try {
        const { id: taskId } = req.params;

        // Validate taskId
        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: 'Task ID is required'
            });
        }

        // Check if task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const subtasks = await Subtask.find({ parentTask: taskId })
            .select('-__v')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subtasks.length,
            data: subtasks
        });

    } catch (error) {
        console.error('Get subtasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subtasks',
            error: error.message
        });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { progress } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { progress },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedTask
        });

    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task progress',
            error: error.message
        });
    }
};

export const updateSubtaskStatus = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { completed } = req.body;

        // Find and update the subtask with the correct status
        const subtask = await Subtask.findByIdAndUpdate(
            subtaskId,
            { 
                status: completed ? 'completed' : 'pending',
                updatedAt: new Date()
            },
            { new: true }
        ).populate('parentTask');

        if (!subtask) {
            return res.status(404).json({
                success: false,
                message: 'Subtask not found'
            });
        }

        // Get all subtasks for the parent task
        const allSubtasks = await Subtask.find({ parentTask: subtask.parentTask });
        const completedCount = allSubtasks.filter(st => st.status === 'completed').length;
        const progress = Math.round((completedCount / allSubtasks.length) * 100);

        // Update parent task progress
        const updatedTask = await Task.findByIdAndUpdate(
            subtask.parentTask,
            { 
                progress,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: subtask,
            progress,
            task: updatedTask
        });

    } catch (error) {
        console.error('Update subtask status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subtask status',
            error: error.message
        });
    }
};
