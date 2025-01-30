export type ThemeSaveState = {
  history: ThemeHistory;
  hash: string;
};

export type ThemeHistories = {
  histories: ThemeHistory[];
  index: number;
};

export type ThemeData = Record<string, any>;

export type ThemeHistory = {
  data: ThemeData;
  id: string;
};

export type OnThemeChangeFunc = (newThemeValues: ThemeData) => void;
