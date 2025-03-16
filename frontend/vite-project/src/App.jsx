import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../src/component/Login";
import Dashboard from "./Dashboard";
import PasswordReset from './component/ForgotPassword';
import VerifyEmail from './component/VerifyEmail';
import Profile from "./Pages/Profile";
import CalendarManagement from "./component/Calender";
import ProjectDashboard from './component/ProjectPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./context/authContext";
import Team from "../src/component/Invite/InvitationHandler"
import WorkSpace from "./Pages/WorkSpace";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedProjectRoutes from "./Pages/ProtectedRoute";
import { Navigate } from "react-router-dom";
import LinkUps from "./Pages/LinkUps";
import UserProfilePage from "./component/Connection/ProfilePage";
import TeamPage from "./component/Team/TeamPage";
import TeamManagerPage from "./Pages/TeamManagerPage";
import Invitations from "./Pages/Invitations";
import Loginpage from "./Services/Loginpage";
import NotificationsPage from "./component/Notification/notificationCenter";




function App() {
  return (
    <AuthProvider>

    <Router>
      <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

      <Routes>
                 <Route path="/" element={<Loginpage />} />
        
                <Route path="/forgotpassword" element={<PasswordReset />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                <Route element={<ProtectedProjectRoutes />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/calender" element={<CalendarManagement />} />
                    {/* <Route path="/project/:projectId" element={<ProjectDashboard />} /> */}
                    <Route path="/team" element={<Invitations />} />
                    <Route path="/notification" element={<NotificationsPage />} />
                    <Route path="/linkups" element={<LinkUps/>} />
                    <Route path="/profile/:userId" element={<UserProfilePage />} />
                    <Route path="/teamBuilder" element={<TeamManagerPage />} />
                    <Route path="/teams/:teamId" element={<TeamPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
                
               <Route path="/linkups" element={<LinkUps/>} />
              

                <Route path="/project/:projectId/*" element={<WorkSpace />} />


      </Routes>
    </Router>
    </AuthProvider>

  );
}

export default App;