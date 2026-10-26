/**
 * AlgoPulse - REST API Client Module
 * Handles Spring Boot backend communication, JWT authentication, and data transfer.
 */
const API = (() => {
  const BASE_URL = '/api';

  function getToken() {
    return localStorage.getItem('algopulse_token');
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem('algopulse_token', token);
      document.cookie = `jwt_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem('algopulse_token');
      document.cookie = 'jwt_token=; path=/; max-age=0; SameSite=Lax';
    }
  }

  function getUser() {
    const raw = localStorage.getItem('algopulse_user');
    return raw ? JSON.parse(raw) : null;
  }

  function setUser(user) {
    if (user) {
      localStorage.setItem('algopulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('algopulse_user');
    }
  }

  async function request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      if (response.status === 401) {
        // Token expired or invalid
        if (token) {
          setToken(null);
          setUser(null);
          window.dispatchEvent(new CustomEvent('auth-changed'));
        }
      }

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: response.statusText || 'Request failed' };
        }
        throw new Error(errorData.error || errorData.message || 'Server request error');
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  }

  return {
    getToken,
    setToken,
    getUser,
    setUser,

    // Auth
    async login(username, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setToken(data.token);
      setUser(data);
      window.dispatchEvent(new CustomEvent('auth-changed'));
      return data;
    },

    async register(username, email, password) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
      setToken(data.token);
      setUser(data);
      window.dispatchEvent(new CustomEvent('auth-changed'));
      return data;
    },

    logout() {
      setToken(null);
      setUser(null);
      window.dispatchEvent(new CustomEvent('auth-changed'));
    },

    async getMe() {
      try {
        const user = await request('/auth/me');
        setUser(user);
        return user;
      } catch (err) {
        setUser(null);
        return null;
      }
    },

    // Categories
    async getCategories() {
      return await request('/categories');
    },

    // Questions
    async getQuestions(filters = {}) {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);

      const qs = params.toString();
      return await request(`/questions${qs ? '?' + qs : ''}`);
    },

    async getQuestion(idOrSlug) {
      return await request(`/questions/${idOrSlug}`);
    },

    // Progress & Stats
    async getUserStats() {
      return await request('/progress/stats');
    },

    async updateProgress(questionId, status, notes = '') {
      return await request(`/progress/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      });
    },

    // Bookmarks
    async getBookmarks() {
      return await request('/bookmarks');
    },

    async toggleBookmark(questionId) {
      return await request(`/bookmarks/${questionId}/toggle`, {
        method: 'POST'
      });
    },

    // Quizzes
    async getQuizzes() {
      return await request('/quizzes');
    },

    async getQuiz(id) {
      return await request(`/quizzes/${id}`);
    },

    async getQuizByQuestion(questionId) {
      return await request(`/quizzes/by-question/${questionId}`);
    },

    async submitQuiz(quizId, answers) {
      return await request('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify({ quizId, answers })
      });
    },

    // Admin
    async getAdminStats() {
      return await request('/admin/stats');
    },

    async createQuestion(payload) {
      return await request('/questions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    async updateQuestion(id, payload) {
      return await request(`/admin/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    },

    async deleteQuestion(id) {
      return await request(`/admin/questions/${id}`, {
        method: 'DELETE'
      });
    }
  };
})();
