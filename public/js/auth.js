/**
 * auth.js — Shared client-side auth utilities
 * Used across pages for consistent token management
 */

const Auth = {
  getToken() {
    return localStorage.getItem('authToken');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('authUser'));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  },

  redirectIfAuthenticated(redirectTo = '/dashboard') {
    if (this.isAuthenticated()) {
      window.location.href = redirectTo;
    }
  },

  requireAuth(redirectTo = '/login') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
    }
  },
};

// Export for module usage (optional)
if (typeof module !== 'undefined') module.exports = Auth;
