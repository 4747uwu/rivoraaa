import express from "express";
import { generateAITasks } from "../controller/genAi.js";
import authMiddlewareHybrid from "../authmiddleware/authMiddleware.js";
import { generateAnalysis } from "../controller/genAiinsight.js";

const router = express.Router();

router.post('/generateAITasks', authMiddlewareHybrid, async(req, res) => {
    try {
        const { projectId, projectName, projectDescription, teamMembers, projectDeadline } = req.body;
        const createdBy = req.user._id; // Fix: Correct way to get user ID

        

        // Validation
        if (!projectId || !projectName || !projectDescription || !teamMembers || !projectDeadline) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields in request body",
                receivedData: { projectId, projectName, projectDescription, teamMembers, projectDeadline }
            });
        }

        const tasks = await generateAITasks(
            projectId, 
            projectName, 
            projectDescription, 
            teamMembers, 
            projectDeadline, 
            createdBy
        );

        if (!tasks) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate AI tasks"
            });
        }

        res.status(201).json({
            success: true,
            message: "AI tasks generated successfully",
            data: tasks
        });

    } catch (error) {
        console.error("AI Task Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});


router.post('/projects/:projectId/analysis', authMiddlewareHybrid, generateAnalysis);

export default router;