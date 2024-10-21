export type ThemeSaveState = {
  history: ThemeHistory;
  hash: string;
};

export type ThemeHistories = {
  histories: ThemeHistory[];
  index: number;
};

export type ThemeHistory = {
  state: {
    data?: {
      [key: string]: string;
    };
  };
  id: string;
};
