export const format12H = (time24) => {
  if (!time24) return '';
  const h = parseInt(time24.split(':')[0], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:00 ${ampm}`;
};
