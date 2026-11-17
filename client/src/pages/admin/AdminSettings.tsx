import React, { useState, useEffect } from 'react';
import { Settings, Save, Mail, KeyRound, Shield, CheckCircle, AlertCircle, Send, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    community_name: '',
    community_full_title: '',
    contact_email: '',
    contact_phone: '',
    member_id_prefix: 'VLPN-2026-',
    card_validity_years: '3',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: 'false',
    smtp_from: 'VLPN Community <membership@vlpn.community>'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Email state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res.settings) setSettings(prev => ({ ...prev, ...res.settings }));
      })
      .catch(err => console.error('Failed to load settings:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await api.updateSettings(settings);
      setStatusMessage({ type: 'success', text: 'System settings updated successfully.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setIsTestingEmail(true);
    setTestEmailResult(null);

    try {
      const res = await api.testEmail(testEmailAddress);
      setTestEmailResult({
        success: res.success,
        text: res.success ? `Test email successfully sent (Status: ${res.status})` : `Failed: ${res.error}`
      });
    } catch (err: any) {
      setTestEmailResult({ success: false, text: err.message || 'Error executing test send.' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);

    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Admin password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-charcoal-600">
        <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
          System Settings & Integrations
        </h1>
        <p className="text-xs text-charcoal-600 mt-0.5">
          Configure membership parameters, unique ID prefixes, and SMTP email delivery credentials
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 shadow-sm ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Card 1: Membership Identity & Credentials */}
        <div className="bg-white rounded-3xl border border-cream-300 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-cream-200">
            <Shield className="w-4 h-4 text-gold-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-950">
              Membership Identity & Card Formatting
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                Member ID Prefix
              </label>
              <input
                type="text"
                name="member_id_prefix"
                value={settings.member_id_prefix || ''}
                onChange={handleInputChange}
                placeholder="e.g. VLPN-2026-"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold outline-none focus:border-gold-500"
              />
              <p className="text-[10px] text-charcoal-600 mt-1">
                Generated IDs will appear as {settings.member_id_prefix || 'VLPN-2026-'}0001
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                Card Validity Duration (Years)
              </label>
              <input
                type="number"
                name="card_validity_years"
                value={settings.card_validity_years || '3'}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-gold-500"
              />
              <p className="text-[10px] text-charcoal-600 mt-1">
                Automatically calculates valid thru date upon approval
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                Community Short Name
              </label>
              <input
                type="text"
                name="community_name"
                value={settings.community_name || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                Full Registered Title
              </label>
              <input
                type="text"
                name="community_full_title"
                value={settings.community_full_title || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Automated Email (SMTP) Configuration */}
        <div className="bg-white rounded-3xl border border-cream-300 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-600" />
              <h3 className="font-serif font-bold text-base text-charcoal-950">
                Automated Email Service (SMTP)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-lg border border-gold-200">
              Live Delivery / Simulation Ready
            </span>
          </div>

          <p className="text-xs text-charcoal-600 leading-relaxed">
            Configure your SMTP credentials (such as Gmail SMTP, SendGrid, Amazon SES, or Brevo). If left blank, emails operate in safe <strong>Simulation Mode</strong> (logged with full HTML audit preview in the Email Logs module).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                SMTP Host
              </label>
              <input
                type="text"
                name="smtp_host"
                placeholder="smtp.gmail.com or smtp.sendgrid.net"
                value={settings.smtp_host || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                SMTP Port
              </label>
              <input
                type="number"
                name="smtp_port"
                placeholder="587 or 465"
                value={settings.smtp_port || '587'}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                SMTP Username
              </label>
              <input
                type="text"
                name="smtp_user"
                placeholder="your-smtp-username@example.com"
                value={settings.smtp_user || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                SMTP Password / App Password
              </label>
              <input
                type="password"
                name="smtp_pass"
                placeholder="••••••••"
                value={settings.smtp_pass || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-gold-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1 font-mono">
                Sender Header (From Address)
              </label>
              <input
                type="text"
                name="smtp_from"
                placeholder="VLPN Community <membership@vlpn.community>"
                value={settings.smtp_from || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </div>

      </form>

      {/* SMTP Test Sending Widget */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm p-6 sm:p-8 space-y-4">
        <h4 className="font-serif font-bold text-base text-charcoal-950">
          Verify SMTP Email Configuration
        </h4>
        <p className="text-xs text-charcoal-600">
          Send an immediate test verification email to confirm server delivery.
        </p>

        <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            required
            placeholder="Enter recipient email for test..."
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            className="w-full sm:flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            disabled={isTestingEmail}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 transition"
          >
            <Send className="w-3.5 h-3.5 text-gold-600" />
            <span>{isTestingEmail ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </form>

        {testEmailResult && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            testEmailResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {testEmailResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{testEmailResult.text}</span>
          </div>
        )}
      </div>

      {/* Admin Security & Password Change */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-cream-200">
          <KeyRound className="w-4 h-4 text-gold-600" />
          <h3 className="font-serif font-bold text-base text-charcoal-950">
            Admin Account Security
          </h3>
        </div>

        {passwordMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-charcoal-700 uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs outline-none"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2 rounded-xl text-xs font-bold text-charcoal-800 bg-cream-200 hover:bg-cream-300 transition"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
