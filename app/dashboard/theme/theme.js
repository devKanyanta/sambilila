// theme.js

export const colors = {
  black: "#08090a",
  carbonBlack: "#222823",
  charcoal: "#575a5e",
  lilacAsh: "#a7a2a9",
  brightSnow: "#f4f7f5"
};

export const lightTheme = {
  mode: "light",

  background: {
    primary: colors.brightSnow,
    secondary: "#ffffff",
    surface: "#ffffff",
  },

  text: {
    primary: colors.black,
    secondary: colors.charcoal,
    muted: colors.lilacAsh,
    inverse: colors.brightSnow,
  },

  border: {
    subtle: "#e2e5e4",
    default: colors.lilacAsh,
  },

  accent: {
    primary: colors.charcoal,
    hover: colors.black,
  },

  button: {
    background: colors.black,
    text: colors.brightSnow,
    hover: colors.charcoal,
  },

  card: {
    background: "#ffffff",
    shadow: "rgba(8, 9, 10, 0.06)"
  }
};

export const darkTheme = {
  mode: "dark",

  background: {
    primary: colors.black,
    secondary: colors.carbonBlack,
    surface: colors.carbonBlack,
  },

  text: {
    primary: colors.brightSnow,
    secondary: colors.lilacAsh,
    muted: colors.charcoal,
    inverse: colors.black,
  },

  border: {
    subtle: "#2f3433",
    default: colors.charcoal,
  },

  accent: {
    primary: colors.lilacAsh,
    hover: colors.brightSnow,
  },

  button: {
    background: colors.lilacAsh,
    text: colors.black,
    hover: colors.brightSnow,
  },

  card: {
    background: colors.carbonBlack,
    shadow: "rgba(0,0,0,0.3)"
  }
};
