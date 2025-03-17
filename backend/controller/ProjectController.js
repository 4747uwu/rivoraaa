import express from 'express';
import Project from '../models/Project.js';
import redisClient from '../config/redis.js';
import User from '../models/User.js';
import { Task } from '../models/TaskModel.js';
import Group from '../models/Group.js';
import mongoose from 'mongoose';
import notificationService from '../Service/notificationService.js'; // Import notification service

// Update createProject to include Redis cache setup
export const createProject = async (req, res) => {
    try {
        // First verify user is authenticated
        // console.log('User in request:', req.user);
        console.log('Project data:', req.body);
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        console.log(req.body);  

        const { name, description, deadline, priority, visibility, category, endDate } = req.body;

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
            deadline: deadline, // Use the determined deadline
            priority: priority || "medium", // Provide a default if not specified
            visibility: visibility || "private", // Fixed typo in variable name
            category: category || "other", 
            owner: req.user._id,
            members: [{userId: req.user._id, role: 'admin'}]
        });

        // Clear user's project list cache
        try {
            // Create pattern to match all project list caches for this user
            const pattern = `projects:${req.user._id}:*`;
            
            // Get all keys matching the pattern
            const keys = await redisClient.keys(pattern);
            
            // Delete all matching keys
            if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(`Cleared ${keys.length} project cache keys`);
            }
        } catch (redisError) {
            console.log(`Redis Error: ${redisError.message}`);
        }

        // Send notification to yourself (system notification about project creation)
        await notificationService.createNotification({
            recipientId: req.user._id,
            type: 'system',
            title: 'Project Created Successfully',
            content: `You have created a new project: "${name}"`,
            entityType: 'project',
            entityId: newProject._id,
            actionUrl: `/project/${newProject._id}`,
            metaData: {
                projectName: name,
                deadline: deadline,
                priority: priority || 'medium'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project: newProject
        });

    } catch (error) {
        console.error(`Error creating project: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create project'
        });
    }
};

// Update getProjects function to use Redis cache

export const getProjects = async (req, res) => {
    try {
        const { search, status, priority, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const userId = req.user._id.toString();
        
        // Generate a cache key based on query parameters
        const cacheKey = `projects:${userId}:${search || ''}:${status || ''}:${priority || ''}:${page}:${limit}`;
        
        // Try to get data from Redis first
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log('Cache hit for projects');
                return res.json(JSON.parse(cachedData));
            }
            console.log('Cache miss for projects, fetching from database');
        } catch (redisError) {
            console.log(`Redis Error: ${redisError.message}`);
            // Continue with database query if Redis fails
        }

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

        // Construct response
        const responseData = {
            success: true,
            projects,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        };
        
        // Store in Redis with expiration (30 minutes)
        try {
            await redisClient.setEx(
                cacheKey,
                1800, // 30 minutes in seconds
                JSON.stringify(responseData)
            );
        } catch (redisError) {
            console.log(`Redis Error: ${redisError.message}`);
        }

        return res.json(responseData);
    } catch (error) {
        console.error(`Error fetching projects: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
};

// Update getProjectById to use Redis cache
export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const cacheKey = `project:${projectId}`;
    
    // Try to get from Redis first
    try {
      const cachedProject = await redisClient.get(cacheKey);
      if (cachedProject) {
        console.log('Cache hit for project details');
        return res.json(JSON.parse(cachedProject));
      }
      console.log('Cache miss for project details, fetching from database');
    } catch (redisError) {
      console.log(`Redis Error: ${redisError.message}`);
    }
    
    // Fetch from database if not in cache
    const project = await Project.findById(projectId)
      .populate({
        path: 'members.userId',
        select: 'username email profilePicture'
      })
      .populate('owner', 'username email profilePicture')
      .lean();

    console.log('Backend project members:', project.members);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    const responseData = { 
      success: true, 
      project 
    };
    
    // Store in Redis with expiration (15 minutes)
    try {
      await redisClient.setEx(
        cacheKey,
        900, // 15 minutes in seconds
        JSON.stringify(responseData)
      );
    } catch (redisError) {
      console.log(`Redis Error: ${redisError.message}`);
    }

    res.json(responseData);
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
        
        if(project.owner.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'You are not authorized to update this project' });
        }

        const updateData = { ...req.body };
        
        if (req.body.status === 'active') {
            updateData.currentStatus = project.currentStatus === 'available' ? 
                'available' : 'in_progress';
        } else if (req.body.status) {
            if (['completed', 'archived'].includes(req.body.status)) {
                updateData.currentStatus = req.body.status;
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            {new: true, runValidators: true}
        );

        try {
            await redisClient.del("projects:" + req.user.id);
        } catch (error) {
            console.log(`Redis Deleting Error: ${error.message}`);
        }

        // Determine what was updated to create appropriate notification
        const changedFields = [];
        if (req.body.name && req.body.name !== project.name) changedFields.push('name');
        if (req.body.description && req.body.description !== project.description) changedFields.push('description');
        if (req.body.deadline && req.body.deadline !== project.deadline) changedFields.push('deadline');
        if (req.body.priority && req.body.priority !== project.priority) changedFields.push('priority');
        if (req.body.status && req.body.status !== project.status) changedFields.push('status');
        
        // Generate notification content based on what changed
        let notificationTitle = 'Project Updated';
        let notificationContent = `Project "${project.name}" has been updated`;
        
        if (changedFields.length === 1) {
            notificationContent = `Project "${project.name}" has had its ${changedFields[0]} updated`;
            
            if (changedFields[0] === 'status') {
                if (req.body.status === 'completed') {
                    notificationTitle = 'Project Marked as Completed';
                    notificationContent = `Project "${project.name}" has been marked as completed`;
                } else if (req.body.status === 'archived') {
                    notificationTitle = 'Project Archived';
                    notificationContent = `Project "${project.name}" has been archived`;
                }
            }
        }

        // Only send notifications for significant changes or to members other than the owner
        if (changedFields.length > 0) {
            // Get all project members except the user making the change
            const memberIds = project.members
                .filter(member => {
                    const memberId = member.userId ? member.userId.toString() : member._id.toString();
                    return memberId !== req.user.id;
                })
                .map(member => member.userId || member._id);

            // Send notifications to all members
            if (memberIds.length > 0) {
                const notificationPromises = memberIds.map(memberId => 
                    notificationService.createNotification({
                        recipientId: memberId,
                        type: 'project_update',
                        title: notificationTitle,
                        content: notificationContent,
                        senderId: req.user.id,
                        entityType: 'project',
                        entityId: project._id,
                        actionUrl: `/project/${project._id}`,
                        metaData: {
                            projectName: project.name,
                            updatedFields: changedFields,
                            updatedAt: new Date()
                        }
                    })
                );
                
                await Promise.all(notificationPromises);
            }
        }

        res.json({ success: true, project: updatedProject });
    } catch (error) {
        console.log(`Error: ${error.message}`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update project',
            error: error.message
        });
    }
};

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

        // Notify all project members about the archival
        const memberIds = project.members
            .filter(member => {
                const memberId = member.userId ? member.userId.toString() : member._id.toString();
                return memberId !== req.user._id.toString();
            })
            .map(member => member.userId || member._id);

        if (memberIds.length > 0) {
            const notificationPromises = memberIds.map(memberId => 
                notificationService.createNotification({
                    recipientId: memberId,
                    type: 'project_update',
                    title: 'Project Archived',
                    content: `Project "${project.name}" has been archived by the owner`,
                    senderId: req.user._id,
                    entityType: 'project',
                    entityId: project._id,
                    priority: 'high', // Important notification
                    metaData: {
                        projectName: project.name,
                        archivedAt: new Date(),
                        previousStatus: project.currentStatus
                    }
                })
            );
            
            await Promise.all(notificationPromises);
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

export const updateMemberRole = async (req, res) => {
    console.log('Update member role request:', req.body);
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;
        
        // Validate role
        const validRoles = ['admin', 'member', 'viewer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be admin, member, or viewer.' });
        }
        
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Check if current user is admin in this project
        const currentUserMember = project.members.find(
            m => m.userId.toString() === req.user.id || m._id.toString() === req.user.id
        );
        
        if (!currentUserMember || currentUserMember.role !== 'admin') {
            return res.status(403).json({ message: 'Only project admins can update member roles' });
        }
        
        // Find the member and update role
        const memberIndex = project.members.findIndex(
            m => m.userId.toString() === userId || m._id.toString() === userId
        );
        
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in this project' });
        }
        
        // Get previous role for notification
        const previousRole = project.members[memberIndex].role;
        
        // Update the role
        project.members[memberIndex].role = role;
        await project.save();
        
        // Send notification to the affected member
        const userToNotify = await User.findById(userId).select('name');
        const currentUser = await User.findById(req.user.id).select('name');
        
        await notificationService.createNotification({
            recipientId: userId,
            type: 'team_role_change',
            title: 'Project Role Updated',
            content: `Your role in project "${project.name}" has been changed from ${previousRole} to ${role} by ${currentUser.name}`,
            senderId: req.user.id,
            entityType: 'project',
            entityId: projectId,
            actionUrl: `/projects/${projectId}`,
            priority: role === 'admin' ? 'high' : 'medium',
            metaData: {
                projectName: project.name,
                previousRole: previousRole,
                newRole: role,
                updatedAt: new Date()
            }
        });
        
        return res.status(200).json({
            message: 'Member role updated successfully',
            member: project.members[memberIndex]
        });
    } catch (error) {
        console.error('Error updating member role:', error);
        return res.status(500).json({ message: 'Failed to update member role', error: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Check if current user is admin in this project
        const currentUserMember = project.members.find(
            m => (m.userId && m.userId.toString() === req.user.id) || 
                (m._id && m._id.toString() === req.user.id)
        );
        
        if (!currentUserMember || currentUserMember.role !== 'admin') {
            return res.status(403).json({ message: 'Only project admins can remove members' });
        }
        
        // Find the member to remove
        const memberIndex = project.members.findIndex(
            m => (m.userId && m.userId.toString() === userId) || 
                (m._id && m._id.toString() === userId)
        );
        
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in this project' });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Store the member information before removal
            const memberToRemove = project.members[memberIndex];
            // Get the actual user ID (could be either userId or _id)
            const actualUserId = memberToRemove.userId || memberToRemove._id;
            
            console.log(`Removing member with ID: ${actualUserId}`);
            
            // 1. Remove the member from the project
            project.members.splice(memberIndex, 1);
            await project.save({ session });
            
            // 2. Unassign all tasks assigned to this user in this project
            // Since assignedTo is an array, we use $pull to remove the user from it
            const updatedTasks = await Task.updateMany(
                { 
                    projectId: projectId,
                    assignedTo: { $in: [actualUserId] }
                },
                { 
                    $pull: { assignedTo: actualUserId },
                    $push: { 
                        history: {
                            action: 'unassigned',
                            by: req.user.id,
                            timestamp: new Date(),
                            details: 'Member removed from project'
                        }
                    }
                },
                { session }
            );
            
            console.log(`Updated ${updatedTasks.modifiedCount} tasks for removed user`);
            
            // 3. Remove the member from all group chats in this project
            const updatedGroups = await Group.updateMany(
                { 
                    projectId: projectId,
                    members: { $in: [actualUserId] }
                },
                { 
                    $pull: { members: actualUserId }
                },
                { session }
            );
            
            console.log(`Updated ${updatedGroups.modifiedCount} group chats for removed user`);
            
            // 4. Clear relevant Redis cache
            try {
                await redisClient.del(`projects:${req.user.id}`);
                await redisClient.del(`project:${projectId}`);
                await redisClient.del(`tasks:project:${projectId}`);
                await redisClient.del(`groups:project:${projectId}`);
            } catch (redisError) {
                console.log(`Redis Error: ${redisError.message}`);
            }
            
            // Send notification to removed member
            const currentUser = await User.findById(req.user.id).select('name');
            
            await notificationService.createNotification({
                recipientId: actualUserId,
                type: 'project_update',
                title: 'Removed from Project',
                content: `You have been removed from project "${project.name}" by ${currentUser.name}`,
                senderId: req.user.id,
                entityType: 'project',
                entityId: projectId,
                priority: 'high',
                metaData: {
                    projectName: project.name,
                    removedAt: new Date(),
                    previousRole: memberToRemove.role
                }
            });
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            return res.status(200).json({
                message: 'Member removed successfully from project, tasks, and groups',
                projectId: project._id,
                tasksUpdated: updatedTasks.modifiedCount,
                groupsUpdated: updatedGroups.modifiedCount
            });
        } catch (error) {
            // If an error occurred, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Error removing member:', error);
        return res.status(500).json({ message: 'Failed to remove member', error: error.message });
    }
};

export const leaveProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Find the current user in the project members
        const memberIndex = project.members.findIndex(
            m => (m.userId && m.userId.toString() === userId) || 
                (m._id && m._id.toString() === userId)
        );
        
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'You are not a member of this project' });
        }
        
        // Check if user is leaving as the last admin
        if (project.members[memberIndex].role === 'admin') {
            const adminCount = project.members.filter(m => 
                m.role === 'admin' && 
                ((m.userId && m.userId.toString() !== userId) || 
                (m._id && m._id.toString() !== userId))
            ).length;
            
            if (adminCount === 0) {
                return res.status(400).json({ 
                    message: 'You are the only admin of this project. Promote another member to admin before leaving.'
                });
            }
        }
        
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Store the member information before removal
            const memberToRemove = project.members[memberIndex];
            // Get the actual user ID (could be either userId or _id)
            const actualUserId = memberToRemove.userId || memberToRemove._id;
            const memberRole = memberToRemove.role;
            
            console.log(`User ${userId} leaving project, identified as ${actualUserId}`);
            
            // 1. Remove the member from the project
            project.members.splice(memberIndex, 1);
            await project.save({ session });
            
            // 2. Unassign all tasks assigned to this user in this project
            const updatedTasks = await Task.updateMany(
                { 
                    projectId: projectId,
                    assignedTo: { $in: [actualUserId] }
                },
                { 
                    $pull: { assignedTo: actualUserId },
                    $push: { 
                        history: {
                            action: 'unassigned',
                            by: userId,
                            timestamp: new Date(),
                            details: 'User left project'
                        }
                    }
                },
                { session }
            );
            
            // 3. Remove the member from all group chats in this project
            const updatedGroups = await Group.updateMany(
                { 
                    projectId: projectId,
                    members: { $in: [actualUserId] }
                },
                { 
                    $pull: { members: actualUserId }
                },
                { session }
            );
            
            // 4. Clear relevant Redis cache
            try {
                await redisClient.del(`projects:${userId}`);
                await redisClient.del(`project:${projectId}`);
                await redisClient.del(`tasks:project:${projectId}`);
                await redisClient.del(`groups:project:${projectId}`);
            } catch (redisError) {
                console.log(`Redis Error: ${redisError.message}`);
            }
            
            // 5. Notify project owner that a member has left
            const currentUser = await User.findById(userId).select('name');
            
            // Only notify if user is not the owner
            if (project.owner.toString() !== userId) {
                await notificationService.createNotification({
                    recipientId: project.owner,
                    type: 'project_update',
                    title: 'Member Left Project',
                    content: `${currentUser.name} has left your project "${project.name}"`,
                    senderId: userId,
                    entityType: 'project',
                    entityId: projectId,
                    actionUrl: `/projects/${projectId}/members`,
                    metaData: {
                        projectName: project.name,
                        leftAt: new Date(),
                        memberRole: memberRole
                    }
                });
            }
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            return res.status(200).json({
                message: 'You have left the project successfully',
                projectId: project._id,
                tasksUpdated: updatedTasks.modifiedCount,
                groupsUpdated: updatedGroups.modifiedCount
            });
        } catch (error) {
            // If an error occurred, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Error leaving project:', error);
        return res.status(500).json({ message: 'Failed to leave project', error: error.message });
    }
};

// New function: Notify project members about deadline approaching
export const checkProjectDeadlines = async () => {
    try {
        const today = new Date();
        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);
        
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        // Find projects with deadlines within the next week
        const projects = await Project.find({
            deadline: {
                $gte: today,
                $lte: oneWeekFromNow
            },
            currentStatus: { $nin: ['completed', 'archived'] }
        });
        
        console.log(`Found ${projects.length} projects with approaching deadlines`);
        
        for (const project of projects) {
            const daysRemaining = Math.ceil((new Date(project.deadline) - today) / (1000 * 60 * 60 * 24));
            
            // Determine priority based on how close the deadline is
            let priority = 'medium';
            let notificationTitle = `Project Deadline Approaching`;
            let notificationMessage = `Project "${project.name}" deadline is in ${daysRemaining} days`;
            
            if (daysRemaining <= 3) {
                priority = 'high';
                notificationTitle = `Urgent: Project Deadline in ${daysRemaining} Days`;
                notificationMessage = `Project "${project.name}" is due in ${daysRemaining} days! Please ensure all tasks are completed.`;
            }
            
            // Get all project members
            const memberIds = project.members.map(member => member.userId || member._id);
            
            // Send notifications to all members
            for (const memberId of memberIds) {
                await notificationService.createNotification({
                    recipientId: memberId,
                    type: 'task_deadline',
                    title: notificationTitle,
                    content: notificationMessage,
                    entityType: 'project',
                    entityId: project._id,
                    actionUrl: `/projects/${project._id}`,
                    priority: priority,
                    metaData: {
                        projectName: project.name,
                        deadline: project.deadline,
                        daysRemaining: daysRemaining
                    }
                });
            }
        }
        
        return {
            success: true,
            projectsProcessed: projects.length
        };
    } catch (error) {
        console.error('Error checking project deadlines:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// New function: Track project progression
export const trackProjectProgress = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }
        
        // Get all tasks for this project
        const tasks = await Task.find({ projectId });
        
        // Calculate completion statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Create milestone notifications at certain thresholds
        const milestoneThresholds = [25, 50, 75, 100];
        
        // Update project with progress data
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { 
                progressPercentage,
                lastUpdated: new Date()
            },
            { new: true }
        );
        
        // Check if we've hit a milestone
        const previousPercentage = project.progressPercentage || 0;
        
        for (const threshold of milestoneThresholds) {
            if (progressPercentage >= threshold && previousPercentage < threshold) {
                // We just crossed this threshold
                
                // Create notification for project owner
                await notificationService.createNotification({
                    recipientId: project.owner,
                    type: 'project_update',
                    title: `Project Milestone: ${threshold}% Complete`,
                    content: `Your project "${project.name}" is now ${threshold}% complete!`,
                    entityType: 'project',
                    entityId: projectId,
                    actionUrl: `/projects/${projectId}`,
                    priority: threshold === 100 ? 'high' : 'medium',
                    metaData: {
                        projectName: project.name,
                        milestone: threshold,
                        completedTasks,
                        totalTasks
                    }
                });
                
                break; // Only notify about the highest threshold crossed
            }
        }
        
        return res.status(200).json({
            success: true,
            progress: {
                totalTasks,
                completedTasks,
                progressPercentage,
                project: updatedProject
            }
        });
        
    } catch (error) {
        console.error('Error tracking project progress:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to track project progress',
            error: error.message
        });
    }
};