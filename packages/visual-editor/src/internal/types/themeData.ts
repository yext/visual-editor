export type ThemeSaveState = {
  history: ThemeHistory;
  hash: string;
};

export type ThemeHistories = {
  histories: ThemeHistory[];
  index: number;
};

export type ThemeData = Record<string, string>;

export type ThemeHistory = {
  data: ThemeData;
  id: string;
};
