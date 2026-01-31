export const AUTH_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful! Welcome back.',
    LOGOUT: 'Logout successful! Visit again.',
  },
  ERROR: {
    INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials!',
    NOT_VERIFIED_USER: 'Please verify your email before logging in!',
    SESSION_EXPIRED: 'Session expired! Please login again.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  },
} as const;
