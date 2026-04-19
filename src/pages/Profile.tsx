import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { User, Mail, Calendar, HardDrive, Settings, Save, Phone } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { toast } from 'react-toastify';
import api from '../services/api';
import type { UserProfile } from '../services/interfaces';


const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const [editForm, setEditForm] = useState({
    name: '',
    surname: '',
    patronymic: '',
    phoneNumber: '',
    login: ''
  });

const defaultErrors = {
  name: "",
  surname: "",
  patronymic: "",
  phoneNumber: "",
};

const [errors, setErrors] = useState(defaultErrors);

const validateField = (field: string, value: string) => {
  switch (field) {
    case "name":
    case "surname":
      if (!value.trim()) return "This field is required";
      if (!/^[A-Za-zА-Яа-яЁё-]+$/.test(value)) return "Only letters and '-' allowed";
      return "";

    case "patronymic":
      if (value && !/^[A-Za-zА-Яа-яЁё-]+$/.test(value))
        return "Only letters and '-' allowed";
      return "";

    case "phoneNumber":
      if (value && !/^[0-9+\-() ]+$/.test(value))
        return "Phone contains invalid characters";
      return "";

    default:
      return "";
  }
};

const validateAll = () => {
  const newErrors: any = {};

  Object.entries(editForm).forEach(([field, value]) => {
    if (field === "login") return; // login не валидируем
    newErrors[field] = validateField(field, value);
  });

  setErrors(newErrors);

  return Object.values(newErrors).every((e) => e === "");
};

const isChanged = () => {
  if (!profile) return false;

  return (
    editForm.name !== profile.name ||
    editForm.surname !== profile.surname ||
    editForm.patronymic !== (profile.patronymic || '') ||
    editForm.phoneNumber !== (profile.phoneNumber || '') ||
    editForm.login !== profile.login
  );
};

const handleChange = (field: string, value: string) => {
  if (["name", "surname", "patronymic"].includes(field)) {
    value = value.replace(/[^A-Za-zА-Яа-яЁё-]/g, "");
  }

  if (field === "phoneNumber") {
    value = value.replace(/[^0-9+\-() ]/g, "");
  }

  setEditForm((prev) => ({ ...prev, [field]: value }));

  setErrors((prev) => ({
    ...prev,
    [field]: validateField(field, value),
  }));
};

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

    if (!validateAll()) {
      toast.error("Please fix the errors");
      return;
    }

    if (!isChanged()) {
      toast.info("No changes to save");
      return;
    }

    try {
      const resp = await api.put<UserProfile>(`/users/${profile.id}`, {
        name: editForm.name,
        surname: editForm.surname,
        patronymic: editForm.patronymic || null,
        phoneNumber: editForm.phoneNumber || null,
        roles: undefined // обычный пользователь не меняет роли
      });

      const updated: UserProfile = resp.data;

      setProfile(prev =>
        prev
          ? { ...prev, ...updated }
          : updated
      );

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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            lg:hidden
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Sidebar />
        </div>
        
        <main className="flex-1 min-h-0 overflow-y-auto p-6">
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

                          setErrors(defaultErrors);
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
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
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
                      <>
                        <input
                          value={editForm.surname}
                          onChange={(e) => handleChange("surname", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                            errors.surname ? "border-red-500" : "border-gray-300 focus:ring-2 focus:ring-[#4B67F5]"
                          }`}
                        />
                        {errors.surname && (
                          <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                        )}
                      </>
                    ) : (
                      <span>{profile.surname}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Name</label>
                    {isEditing ? (
                      <>
                        <input
                          value={editForm.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                            errors.name ? "border-red-500" : "border-gray-300 focus:ring-2 focus:ring-[#4B67F5]"
                          }`}
                        />
                        {errors.name && (<p className="text-red-500 text-sm mt-1">{errors.name}</p>)}
                      </>
                    ) : (
                      <span>{profile.name}</span>
                    )}
                  </div>

                  {/* Patronymic */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Patronymic</label>
                    {isEditing ? (
                      <>
                        <input
                          value={editForm.patronymic}
                          onChange={(e) => handleChange("patronymic", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                            errors.patronymic ? "border-red-500" : "border-gray-300 focus:ring-2 focus:ring-[#4B67F5]"
                          }`}
                        />
                        {errors.patronymic && (<p className="text-red-500 text-sm mt-1">{errors.patronymic}</p>)}
                      </>
                    ) : (
                      <span>{profile.patronymic ?? '—'}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3A3C] mb-2">Phone Number</label>
                    {isEditing ? (
                      <>
                        <IMaskInput
                          mask="+7 (000) 000-00-00"
                          value={editForm.phoneNumber}
                          unmask={false} // Возвращает "чистое" значение без маски
                          onAccept={(value: string) => handleChange("phoneNumber", value)}
                          className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                            errors.phoneNumber ? "border-red-500" : "border-gray-300 focus:ring-2 focus:ring-[#4B67F5]"
                          }`}
                        />
                        {errors.phoneNumber && (<p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>)}
                      </>
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

            
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;