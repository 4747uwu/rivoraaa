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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  return (
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
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
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgotpassword" element={<PasswordReset />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/calender" element={<CalendarManagement />} />
                <Route path="/project/:projectId" element={<ProjectDashboard />} />
                <Route path="/project/:projectId" element={<ProjectDashboard />} />
                <Route path="/team" element={<Team />} />
      </Routes>
    </Router>
    </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;