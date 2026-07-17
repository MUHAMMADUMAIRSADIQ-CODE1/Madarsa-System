const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Handle 403 Forbidden responses (blocked users, etc.)
function handleForbidden(message) {
  const blockedMessages = [
    'account has been blocked',
    'user blocked',
    'your account has been blocked',
    'not authorized',
  ];
  const isBlocked = blockedMessages.some(m => message?.toLowerCase().includes(m));
  if (isBlocked) {
    // Clear auth state - user has been blocked since their last login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Redirect to the blocked page or login
    window.location.href = '/account-blocked';
  }
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const config = {
    method,
    headers: { ...headers },
    ...rest,
  };

  if (body && !(body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    config.body = body;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data = null;

  try {
    const text = await response.text();
    if (text && text.length > 0) {
      data = JSON.parse(text);
    }
  } catch (parseError) {
    const error = new Error(`Invalid JSON response from ${endpoint}: ${parseError.message}`);
    error.status = response.status;
    error.originalResponse = parseError;
    throw error;
  }

  if (!response.ok) {
    const message =
      (data && data.message) ||
      `Request failed with status ${response.status}`;
    
    // Handle 403 - check if user was blocked since login
    if (response.status === 403) {
      handleForbidden(message);
    }
    
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),

  upload: (endpoint, formData, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body: formData }),
};

export default api;
