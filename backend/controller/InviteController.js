import express from "express";
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
        const { projectId, userId, role } = req.body;
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

        // Then check ownership
        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'You are not authorized to invite users to this project'
            });
        }

        // Rest of your existing code...
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const existingInvitation = await Invitation.findOne({ projectId, userId });
        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'User already invited to this project'
            });
        }

        const invitation = await Invitation.create({
            projectId,
            userId,
            inviterId: req.user._id,
            inviteeEmail: existingUser.email,
            role,
            status: 'pending'
        });

        await User.findByIdAndUpdate(userId, {
            $push: {
                invitations: {
                    invitationId: invitation._id,
                    inviterId: req.user._id,
                    projectId,
                    role,
                    status: 'pending',
                    sentAt: new Date()
                }
            }
        });

        res.status(201).json({ success: true, invitation });

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
    try {
        const { invitationId, action } = req.body;

        // Validate required fields
        if (!invitationId || !action) {
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

        // Find and populate the invitation
        const invitation = await Invitation.findById(invitationId)
            .populate('projectId', 'name description owner')
            .populate('inviterId', 'username email profilePicture');

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
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
        
        if (action === 'accept') {
            // Check if user is already a member
            const isAlreadyMember = await Project.findOne({
                _id: invitation.projectId._id,
                'members.userId': req.user._id
            });

            if (!isAlreadyMember) {
                await Project.findByIdAndUpdate(
                    invitation.projectId._id,
                    {
                        $push: {
                            members: {
                                userId: req.user._id,
                                role: invitation.role
                            }
                        }
                    }
                );
            }
        }

        await invitation.save();

        // Update user's invitations array
        await User.updateOne(
            { 
                _id: req.user._id,
                'invitations.invitationId': invitationId 
            },
            { 
                $set: { 
                    'invitations.$.status': invitation.status,
                    'invitations.$.respondedAt': new Date()
                } 
            }
        );

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
            // error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getMyInvitations = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'invitations.inviterId',
                select: 'username email profilePicture'
            })
            .populate({
                path: 'invitations.projectId',
                select: 'name description'
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Sort invitations by date, newest first
        const sortedInvitations = user.invitations.sort((a, b) =>
            b.sentAt - a.sentAt
        );

        res.json({
            success: true,
            invitations: sortedInvitations
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

