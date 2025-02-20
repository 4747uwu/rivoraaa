import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, UserCheck, UserX } from 'lucide-react';
import API from '../../api/api';
import { toast } from 'react-toastify';

const Team = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/invites/requests');
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      setLoading(true);
      const response = await API.post('/api/invites/respond', {
        invitationId,
        action, // 'accept' or 'reject'
        message: '' // optional message
      });

      if (response.data.success) {
        // Refresh invitations list
        fetchInvitations();
        toast.success(`Invitation ${action}ed successfully`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="h-6 bg-gray-200 w-1/4 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Invitations</h1>
      
      <div className="space-y-4">
        <AnimatePresence>
          {invitations.length > 0 ? (
            invitations.map((invitation) => (
              <motion.div
                key={invitation.invitationId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm 
                         hover:border-blue-100 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {invitation.projectId.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {invitation.projectId.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <img
                            src={invitation.inviterId.profilePicture}
                            alt={invitation.inviterId.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          Invited by {invitation.inviterId.username}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        Role: {invitation.role}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {new Date(invitation.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {invitation.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleInvitationResponse(invitation.invitationId, 'accept')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg 
                                   transition-colors flex items-center gap-2"
                        >
                          <UserCheck size={18} />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleInvitationResponse(invitation.invitationId, 'reject')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg 
                                   transition-colors flex items-center gap-2"
                        >
                          <UserX size={18} />
                          <span>Decline</span>
                        </button>
                      </>
                    ) : (
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        invitation.status === 'accepted' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {invitation.status === 'accepted' ? (
                          <><Check size={14} /> Accepted</>
                        ) : (
                          <><X size={14} /> Declined</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No pending invitations
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Team;