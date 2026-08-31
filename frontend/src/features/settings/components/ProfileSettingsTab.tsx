import { Button } from '@/components/ui/button';
import {
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconShieldLock,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import type { PasswordChangeData } from '../types/settings.types';

interface ProfileSettingsTabProps {
  initialName: string;
  initialEmail: string;
  onSaveProfile: (name: string, email: string) => void | Promise<void>;
  profileFeedback: string | null;
  onChangePassword: (data: PasswordChangeData) => boolean | Promise<boolean>;
  passwordFeedback: { success?: boolean; message?: string } | null;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  initialName,
  initialEmail,
  onSaveProfile,
  profileFeedback,
  onChangePassword,
  passwordFeedback,
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isProfileDirty = name.trim() !== initialName || email.trim() !== initialEmail;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await onSaveProfile(name, email);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onChangePassword({ currentPassword, newPassword, confirmPassword });
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Profile Information Section */}
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">Personal Identity</h3>
            <div className="card-title-sub">Manage your display name and sign-in email</div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="divide-y divide-[var(--border)]">
            {/* Row: Avatar & Display Name */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--oak)] text-white font-serif font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Display Persona</div>
                  <p className="text-[11px] text-[var(--muted)]">Initials displayed across apartment ledgers</p>
                </div>
              </div>
              <div className="md:col-span-7">
                <label htmlFor="user-name" className="text-xs font-bold text-[var(--text)] block mb-1">
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                  required
                />
              </div>
            </div>

            {/* Row: Email */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 space-y-1">
                <label htmlFor="user-email" className="text-xs font-bold text-[var(--text)] block">
                  Email Address
                </label>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Used for notifications, debt nudges, and account sign-in.
                </p>
              </div>
              <div className="md:col-span-7">
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Profile Submit Action Footer */}
          <div className="p-4 sm:p-5 bg-[var(--canvas)]/50 border-t border-[var(--border)] flex items-center justify-between">
            <div>
              {profileFeedback && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--positive-text)]">
                  <IconCheck size={14} /> {profileFeedback}
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={!isProfileDirty}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${isProfileDirty
                ? 'btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white shadow-xs'
                : 'bg-[var(--canvas)] text-[var(--muted)] border border-[var(--border)] opacity-60 cursor-not-allowed'
                }`}
            >
              Save Profile Details
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Password & Security Credentials Section */}
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">Password & Security</h3>
            <div className="card-title-sub">Update authentication credentials and active protections</div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className="divide-y divide-[var(--border)]">
            {/* Row: Change Password */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-bold text-[var(--text)] block">Change Password</label>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Ensure your account uses a secure password with at least 8 characters.
                </p>
              </div>
              <div className="md:col-span-7 space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl pl-3.5 pr-10 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                    placeholder="Current Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                  >
                    {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                  placeholder="New Password (min. 8 characters)"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                  placeholder="Confirm New Password"
                />

                {passwordFeedback && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold pt-1 ${passwordFeedback.success ? 'text-[var(--positive-text)]' : 'text-[var(--negative-text)]'
                      }`}
                  >
                    {passwordFeedback.success ? <IconCheck size={14} /> : <IconAlertCircle size={14} />}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-[var(--canvas)]/50 border-t border-[var(--border)] flex items-center justify-between">
            <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
              <IconShieldLock size={15} className="text-[var(--oak)]" />
              <span>Two-factor security active</span>
            </div>
            <Button
              type="submit"
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
