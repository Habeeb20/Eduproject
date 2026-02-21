// src/pages/admin/SchoolWideGroupAdmin.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Loader2, UserX, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolWideGroupAdmin() {
  const [group, setGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchSchoolGroup();
  }, []);

  const fetchSchoolGroup = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/groups/school-wide`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGroup(res.data.group);
      setParticipants(res.data.group?.participants || []);
    } catch (err) {
      if (err.response?.status === 404) {
        // No group yet → allow creation
        setShowCreate(true);
      } else {
        toast.error('Failed to load school-wide group');
      }
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Group name required');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/groups/school-wide`,
        { name, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGroup(res.data.group);
      setShowCreate(false);
      toast.success('School-wide group created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    }
  };

  const toggleBlock = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/block`,
        { isBlocked: !group.isBlocked },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setGroup(res.data.group);
      toast.success(`Group ${group.isBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (err) {
      toast.error('Failed to update block status');
    }
  };

  const removeParticipant = async (userId) => {
    if (!window.confirm('Remove this participant?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/groups/${group._id}/participant/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setParticipants(prev => prev.filter(p => p._id !== userId));
      toast.success('Participant removed');
    } catch (err) {
      toast.error('Failed to remove participant');
    }
  };

  if (loading) {
    return <Loader2 className="animate-spin mx-auto mt-20" size={40} />;
  }

  if (showCreate) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create School-Wide Group</h1>
        <form onSubmit={createGroup} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Group Name (e.g. Lagos International School Community)"
            className="w-full p-3 border rounded"
            required
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 border rounded"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded">
            Create Group
          </button>
        </form>
      </div>
    );
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-600">No school-wide group exists yet.</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <div className="flex gap-4">
          <button
            onClick={toggleBlock}
            className={`px-6 py-2 rounded ${group.isBlocked ? 'bg-red-600' : 'bg-green-600'} text-white`}
          >
            {group.isBlocked ? <Unlock size={20} /> : <Lock size={20} />} {group.isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-8">{group.description}</p>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Participants ({participants.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map(p => (
            <div key={p._id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.role}</p>
              </div>
              <button
                onClick={() => removeParticipant(p._id)}
                className="text-red-600 hover:text-red-800"
              >
                <UserX size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}