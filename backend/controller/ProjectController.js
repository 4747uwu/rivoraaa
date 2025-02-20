import express from 'express';
import Project from '../models/Project.js';
import redisClient from '../config/redis.js';
import User from '../models/User.js';

export const createProject = async (req, res) => {
    try {
        // First verify user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { name, description, deadline, priority } = req.body;

        // Validate required fields
        if (!name || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Name and deadline are required'
            });
        }

        const newProject = await Project.create({
            name,
            description,
            deadline,
            priority,
            owner: req.user._id,
            members: [{userId: req.user._id, role: 'admin'}]
        });

        // Clear cache after successful creation
        try {
            await redisClient.del("projects:" + req.user._id);
        } catch (redisError) {
            console.log(`Redis Error: ${redisError.message}`);
        }

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: newProject
        });

d    } catch (error) {
        console.error(`Error creating project: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create project'
        });
    }
};


// Improved getProjects function
export const getProjects = async (req, res) => {
    try {
        const { search, status, priority, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query object
        const query = {
            members: { $elemMatch: { userId: req.user._id } },
            currentStatus: { $ne: 'archived' } // Don't show archived projects by default
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Get total count for pagination
        const total = await Project.countDocuments(query);
        
        const projects = await Project.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            projects,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error(`Error fetching projects: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
};

//
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'members.userId',
        select: 'username email profilePicture'
      })
      .populate('owner', 'username email profilePicture')
      .lean(); // Add lean() for better performance

    console.log('Backend project members:', project.members);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({ 
      success: true, 
      project 
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching project',
      error: error.message 
    });
  }
};


export const updateProject = async (req, res) => {
    try {
          const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        if(project.owner.toString() !== req.user.id)
        {
            return res.status(401).json({ success: false, message: 'You are not authorized to update this project' });
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        try{
            await redisClient.del("projects"+ req.user.id);
        }catch (error) {
            console.log(`Redis Deleting Error: ${error.message}`);
        }

        res.json({ success: true, project: updatedProject });


    } catch (error) {
        console.log(`Error: ${error.message}`);
        
    }

}

//delete project

export const deleteProject = async (req, res) => {
    try {
        // Debug logs
        console.log('User in request:', req.user);
        console.log('Project ID:', req.params.id);

        // First verify user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }

        // Debug log
        console.log('Project owner:', project.owner);
        console.log('Current user:', req.user._id);
        console.log('Comparison:', project.owner.toString() === req.user._id.toString());

        // Compare IDs using toString()
        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ 
                success: false, 
                message: 'You are not authorized to delete this project' 
            });
        }

        const archivedProject = await Project.findByIdAndUpdate(
            req.params.id,
            {
                currentStatus: 'archived',
                lastUpdated: Date.now()
            },
            { new: true, runValidators: true }
        );

        // Clear the cache
        try {
            await redisClient.del(`projects:${req.user._id}`);
            await redisClient.del(`project:${req.params.id}`);
        } catch (error) {
            console.log(`Redis Deleting Error: ${error.message}`);
        }

        return res.json({ 
            success: true, 
            message: 'Project archived successfully',
            project: archivedProject 
        });

    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to archive project',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};