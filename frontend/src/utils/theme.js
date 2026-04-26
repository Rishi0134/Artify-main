const THEME_KEY = "artify-theme";

export const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem(THEME_KEY) || "dark";
};

export const applyTheme = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
};

export const setStoredTheme = (theme) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(theme);
};
