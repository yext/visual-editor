export type ThemeSaveState = {
  history: any; // json object
  index: number;
  hash: string;
};

export type ThemeHistories = {
  histories: History[];
  index?: number;
};

export type History<D = any> = {
  state: D;
  id?: string;
};
