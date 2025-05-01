// Mock authentication functions
export const authenticate = (username, password, userType) => {
    // Simple validation (no real auth)
    if (username.trim() && password.trim()) {
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        userType: userType || 'user',
        username
      }));
      return true;
    }
    return false;
  };
  
  export const logout = () => {
    localStorage.removeItem('auth');
  };
  
  export const getAuth = () => {
    return JSON.parse(localStorage.getItem('auth')) || {
      isAuthenticated: false,
      userType: 'user',
      username: ''
    };
  };