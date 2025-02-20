import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:function(){
        return this.authProvider === "email";
    }},
    profilePicture:{type:String, default:""},
    role:{type:String, enum:["admin","member","viewer"], default:"member"},
    authProvider:{type:String, enum:["email","google"], default:"email"},
    googleId:{type:String, default:""},
    bio: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }, // Email verified status
    status: { type: String, enum: ["active", "suspended", "deleted"], default: "active" }, // Account status
    emailVerificationToken: { type: String, default: null }, // Email verification token
    emailVerificationExpiry: { type: Date, default: null }, // Token expiration
    emailVerifiedAt: { type: Date, default: null }, // When the email was verified
    passwordResetToken: { type: String, default: null }, // Password reset token
    passwordResetExpiry: { type: Date, default: null }, // Token expiration

    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Date },

     googleCalendar: {
        enabled: { type: Boolean, default: false },
        syncEnabled: { type: Boolean, default: false },
        primaryCalendarId: { type: String },
        syncedCalendars: [{
            calendarId: { type: String },
            name: { type: String },
            backgroundColor: { type: String },
            selected: { type: Boolean, default: true }
        }],
        lastSync: { type: Date },
        defaultReminders: [{
            method: { type: String, enum: ['email', 'popup'] },
            minutes: { type: Number }
        }]
    },

      aiInsights: {
      productivityScore: { type: Number, default: 0 }, // AI-based performance analysis
      preferredWorkHours: { type: String, default: "09:00-17:00" }, // AI-suggested best work hours
      workloadBalance: { type: String, default: "moderate" }, // AI workload analysis
    },

    preferences: {
        darkMode: { type: Boolean, default: false },
        notificationSettings: {
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
        },
        dashboardSettings: {
            defaultView: { type: String, enum: ["list", "grid", "kanban"], default: "kanban" },
            showCompletedTasks: { type: Boolean, default: true },
            showDeadlines: { type: Boolean, default: true },
        },
        calendarSettings: {
            enabled: { type: Boolean, default: false },
            syncEnabled: { type: Boolean, default: false },
            primaryCalendarId: { type: String },
            defaultReminders: [{
                method: { type: String, enum: ['email', 'popup'] },
                minutes: { type: Number }
            }],
            workingHours: {
                start: { type: String, default: "09:00" },
                end: { type: String, default: "17:00" },
                workDays: [{ type: Number }] // 0-6 for Sunday-Saturday
            }
        }
    },

  


    projects: [{
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        name: { type: String, required: true },
        deadline: { type: Date, required: true },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        role: { type: String, enum: ["owner", "admin", "editor", "viewer"] },
        joinedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        lastActiveAt: { type: Date, default: Date.now },
        permissions: { type: [String], default: [] },
        starred: { type: Boolean, default: false },
        calendarId: { type: String }, // Associated Google Calendar ID for this project
        calendarSyncEnabled: { type: Boolean, default: false }
    }],


  invitations: [
  {
    invitationId: { type: mongoose.Schema.Types.ObjectId, ref: "Invitation" }, 
    inviterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who sent the invite
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Project for which the invitation was sent
    role: { type: String, enum: ["admin", "editor", "viewer"] }, // Role assigned in the project if accepted
    sentAt: { type: Date, default: Date.now }, // When the invitation was sent
    respondedAt: { type: Date }, // When the invite was accepted/declined
    message: { type: String, default: "" }, // Custom message with the invite
  },
],

    notifications: [
  {
    message: { type: String, required: true }, // Notification text
    type: { type: String, enum: ["task", "mention", "deadline", "general", "invitation", "update"] }, // More categories
    isRead: { type: Boolean, default: false }, // Whether the notification has been seen
    createdAt: { type: Date, default: Date.now }, // Timestamp when the notification was created
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Related project (if applicable)
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who triggered this notification
    actionUrl: { type: String, default: "" }, // URL to direct the user (e.g., task, discussion, project page)
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" }, // Importance level
    expiresAt: { type: Date }, // Expiration date for temporary notifications
  },
],

// tasks: [{
//     taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }, // Task reference
//     projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Project reference
//     title: { type: String, required: true }, // Task title
//     description: { type: String, default: "" }, // Task description
//     status: { type: String, enum: ["todo", "in-progress", "review", "completed"], default: "todo" },
//     priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
//     dueDate: { type: Date }, // Task deadline
//     assignedAt: { type: Date, default: Date.now },
//     lastUpdated: { type: Date, default: Date.now },
//     assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who assigned the task

// }],

tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],



   

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }


);

export default mongoose.models.User || mongoose.model("User", userSchema);