import express from "express";
import mongoose from "mongoose";
import { Invitation } from "../models/Invitation.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const searchUser = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Query is required' });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('_id username name email role profilePicture');

        if (!users) {
            return res.status(404).json({ success: false, message: 'No users found' });
        }

        res.json({ success: true, users });

    } catch (error) {

    }

}

export const inviteUser = async (req, res) => {
    try {
        const { projectId, userId, role, message } = req.body;
        if (!projectId || !userId || !role) {
            return res.status(400).json({
                success: false,
                message: 'Project ID, User ID and Role are required'
            });
        }

        // First fetch the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check ownership
        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'You are not authorized to invite users to this project'
            });
        }

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if there's already a pending invitation
        const existingInvitation = await Invitation.findOne({ 
            projectId, 
            inviteeEmail: existingUser.email,
            status: 'pending'
        });
        
        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'User already has a pending invitation to this project'
            });
        }

        // Create new standalone invitation
        const invitation = await Invitation.create({
            projectId,
            userId,
            inviterId: req.user._id,
            inviteeEmail: existingUser.email,
            role,
            status: 'pending',
            message: message || ''
        });

        // We no longer need to update the User model with embedded invitations

        res.status(201).json({ 
            success: true, 
            message: 'Invitation sent successfully',
            invitation 
        });

    } catch (error) {
        console.error('Invite user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send invitation',
            error: error.message
        });
    }
};

export const respondToInvitation = async (req, res) => {
    console.log('Respond to invitation:', req.body);
    try {
        const { invitationId, action } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!invitationId) {
            return res.status(400).json({
                success: false,
                message: 'Invitation ID and action are required'
            });
        }

        // Validate action value
        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be either "accept" or "reject"'
            });
        }

        // Ensure we have a valid ObjectId
        let objectId;
        try {
            objectId = new mongoose.Types.ObjectId(invitationId);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invitation ID format'
            });
        }

        // Find the standalone invitation
        const invitation = await Invitation.findById(objectId)
            .populate('projectId', 'name description owner')
            .populate('inviterId', 'username email profilePicture');

        console.log('Found invitation:', invitation ? 'yes' : 'no');

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Ensure this user is the intended recipient
        if (invitation.inviteeEmail !== req.user.email && 
            invitation.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to respond to this invitation'
            });
        }

        // Check if invitation is still pending
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Invitation has already been ${invitation.status}`
            });
        }

        // Update invitation status
        invitation.status = action === 'accept' ? 'accepted' : 'rejected';
        invitation.respondedAt = new Date();
        invitation.respondedBy = userId;
        
        // If accepting, add user to project
        if (action === 'accept') {
            // Check if user is already a member
            const project = await Project.findById(invitation.projectId._id);
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            const isAlreadyMember = project.members.some(
                member => member.userId.toString() === userId.toString()
            );

            if (!isAlreadyMember) {
                await Project.findByIdAndUpdate(
                    invitation.projectId._id,
                    {
                        $push: {
                            members: {
                                userId,
                                role: invitation.role,
                                joinedAt: new Date()
                            }
                        }
                    }
                );
            }
        }

        // Save the updated invitation
        await invitation.save();
        
        // Update the user's respondedInvitations list to track their responses
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    respondedInvitations: {
                        invitationId: invitation._id,
                        status: invitation.status,
                        respondedAt: invitation.respondedAt
                    }
                }
            }
        );

        // Return success response
        res.json({
            success: true,
            message: `Invitation ${action}ed successfully`,
            invitation
        });

    } catch (error) {
        console.error('Respond to invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to respond to invitation',
            error: error.message
        });
    }
};

export const getMyInvitations = async (req, res) => {
    try {
        const userId = req.user._id;
        const userEmail = req.user.email;
        
        // Get all invitations for this user's email or userId
        const invitations = await Invitation.find({
            $or: [
                { inviteeEmail: userEmail },
                { userId: userId }
            ]
        })
        .populate('projectId', 'name description')
        .populate('inviterId', 'username email profilePicture')
        .sort({ createdAt: -1 });
        
        console.log(`Found ${invitations.length} invitations for user ${userId}`);
        
        // Format invitations for frontend consistency
        const formattedInvitations = invitations.map(inv => ({
            invitationId: inv._id,
            inviterId: inv.inviterId,
            projectId: inv.projectId,
            role: inv.role,
            status: inv.status,
            message: inv.message || '',
            sentAt: inv.createdAt,
            respondedAt: inv.respondedAt,
            teamDeployment: inv.teamDeployment || false
        }));

        res.json({
            success: true,
            invitations: formattedInvitations
        });

    } catch (error) {
        console.error('Fetch invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invitations',
            error: error.message
        });
    }
};
