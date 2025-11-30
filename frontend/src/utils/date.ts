export const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const startOfWeek = (date: Date) => {
  const d = startOfDay(date);
  const diff = d.getDay();
  d.setDate(d.getDate() - diff);
  return d;
};
