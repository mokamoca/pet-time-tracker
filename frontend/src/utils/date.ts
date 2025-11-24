export const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const diff = d.getDay();
  d.setDate(d.getDate() - diff);
  return d;
};
