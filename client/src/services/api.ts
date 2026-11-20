const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('vlpn_admin_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('vlpn_admin_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('vlpn_admin_token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to json if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  changePassword: (data: any) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Applications
  submitApplication: (formData: FormData) =>
    request('/applications', { method: 'POST', body: formData }),
  getApplications: (params?: { status?: string; search?: string; chapter?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.chapter) query.append('chapter', params.chapter);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return request(`/applications?${query.toString()}`);
  },
  getApplication: (id: string | number) => request(`/applications/${id}`),
  approveApplication: (id: string | number) =>
    request(`/applications/${id}/approve`, { method: 'POST' }),
  rejectApplication: (id: string | number, rejection_reason?: string) =>
    request(`/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejection_reason }) }),

  // Members
  getMembers: (params?: { search?: string; chapter?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.chapter) query.append('chapter', params.chapter);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return request(`/members?${query.toString()}`);
  },
  getMember: (id: string | number) => request(`/members/${id}`),
  regenerateCard: (memberId: string | number) =>
    request(`/members/${memberId}/regenerate-card`, { method: 'POST' }),
  resendCard: (memberId: string | number) =>
    request(`/members/${memberId}/resend-card`, { method: 'POST' }),

  // Template Designer
  getTemplates: () => request('/templates'),
  getActiveTemplate: () => request('/templates/active'),
  getTemplate: (id: string | number) => request(`/templates/${id}`),
  createTemplate: (formData: FormData) =>
    request('/templates', { method: 'POST', body: formData }),
  updateTemplate: (id: string | number, data: any) =>
    request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  activateTemplate: (id: string | number) =>
    request(`/templates/${id}/activate`, { method: 'POST' }),
  previewTemplate: (id: string | number, data: { fields: any[]; memberSample?: any }) =>
    request(`/templates/${id}/preview`, { method: 'POST', body: JSON.stringify(data) }),

  // Emails
  getEmails: (params?: { status?: string; type?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return request(`/emails?${query.toString()}`);
  },
  resendEmail: (id: string | number) =>
    request(`/emails/${id}/resend`, { method: 'POST' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (settings: Record<string, string>) =>
    request('/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
  testEmail: (testEmail: string) =>
    request('/settings/test-email', { method: 'POST', body: JSON.stringify({ testEmail }) }),

  // Public
  getStatus: (query: string) => request(`/public/status?query=${encodeURIComponent(query)}`),
  getMeta: () => request('/public/meta'),
  verifyMember: (memberId: string) => request(`/public/verify/${encodeURIComponent(memberId)}`)
};
