import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { User, Mail, Calendar, HardDrive, Settings, Save, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import type { UserProfile } from '../services/interfaces';


const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    surname: '',
    patronymic: '',
    phoneNumber: '',
    login: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const resp = await api.get<UserProfile>("/users/me");
        const user = resp.data;

        const mappedProfile: UserProfile = {
          ...user,
          joinDate: 'Unknown',
          storageUsed: 15.7,
          storageLimit: 100
        };

        setProfile(mappedProfile);

        setEditForm({
          name: user.name || '',
          surname: user.surname || '',
          patronymic: user.patronymic || '',
          phoneNumber: user.phoneNumber || '',
          login: user.login || ''
        });

      } catch (error: any) {
        console.error(error);
        toast.error("Failed to load profile");
      }
    };

    loadUser();
  }, []);


  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  const handleSave = async () => {
    if (!profile) return;

    try {
      const resp = await api.put(`/users/${profile.id}`, {
        name: editForm.name,
        surname: editForm.surname,
        patronymic: editForm.patronymic || null,
        phoneNumber: editForm.phoneNumber || null,
        roles: undefined // обычный пользователь не меняет роли
      });

      const updated = resp.data;

      setProfile(prev => ({
        ...prev!,
        ...updated
      }));

      setIsEditing(false);
      toast.success("Profile updated successfully");

    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 403) {
        toast.error("You are not allowed to edit this profile");
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Server is unavailable");
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const storagePercentage = (profile.storageUsed / profile.storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <User size={24} className="text-[#3A3A3C]" />
              <h1 className="text-2xl font-semibold text-[#3A3A3C]">Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#3A3A3C]">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-[#4B67F5] hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Settings size={16} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: profile.name,
                            surname: profile.surname,
                            patronymic: profile.patronymic || '',
                            phoneNumber: profile.phoneNumber || '',
                            login: profile.login
                          });
                        }}
                        className="px-4 py-2 text-[#3A3A3C] hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#4B67F5] text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Login (email) */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Email (login)</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.login}
                        onChange={(e) => setEditForm(prev => ({ ...prev, login: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
                      />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Mail size={20} className="text-gray-400" />
                        <span>{profile.login}</span>
                      </div>
                    )}
                  </div>

                  {/* Surname */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Surname</label>
                    {isEditing ? (
                      <input
                        value={editForm.surname}
                        onChange={(e) => setEditForm(prev => ({ ...prev, surname: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
                      />
                    ) : (
                      <span>{profile.surname}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Name</label>
                    {isEditing ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
                      />
                    ) : (
                      <span>{profile.name}</span>
                    )}
                  </div>

                  {/* Patronymic */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Patronymic</label>
                    {isEditing ? (
                      <input
                        value={editForm.patronymic}
                        onChange={(e) => setEditForm(prev => ({ ...prev, patronymic: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
                      />
                    ) : (
                      <span>{profile.patronymic ?? '—'}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
                      />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Phone size={20} className="text-gray-400" />
                        <span>{profile.phoneNumber ?? '—'}</span>
                      </div>
                    )}
                  </div>

                  {/* Roles */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.roles.map(r => (
                        <span key={r} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-sm">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Storage Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-[#3A3A3C] mb-6">Storage Usage</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HardDrive size={20} className="text-[#4B67F5]" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#3A3A3C]">Used Storage</span>
                        <span className="text-sm font-medium text-[#3A3A3C]">
                          {profile.storageUsed} GB of {profile.storageLimit} GB
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#4B67F5] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${storagePercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full px-4 py-2 bg-[#4B67F5] text-white rounded-xl hover:bg-blue-600 transition-colors">
                      Upgrade Storage
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Question Generator */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#3A3A3C] mb-4">AI Question Generator</h2>
              <p className="text-gray-600 mb-4">
                Generate questions based on your uploaded files using AI. Configure your preferences below.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3A3A3C] mb-2">
                    Number of Questions
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent">
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                    <option value="20">20 Questions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3A3A3C] mb-2">
                    AI Provider
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent">
                    <option value="openai">OpenAI GPT-4</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="px-4 py-2 bg-[#4B67F5] text-white rounded-xl hover:bg-blue-600 transition-colors">
                  Save AI Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;