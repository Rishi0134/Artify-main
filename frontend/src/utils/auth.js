const TOKEN_KEY = "artify_token";
const USER_KEY = "artify_user";

export const setStoredAuth = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    clearStoredAuth();
    return null;
  }
};

export const updateStoredUser = (user) => {
  const currentToken = getStoredToken();
  if (!currentToken) {
    return;
  }

  setStoredAuth({
    token: currentToken,
    user,
  });
};

export const getDashboardPath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "artist") return "/artist/dashboard";
  return "/user/dashboard";
};
