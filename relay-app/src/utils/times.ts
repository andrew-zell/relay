export const TIMES: string[] = [];

for (let h = 6; h <= 18; h++) {
  const period = h < 12 ? 'AM' : 'PM';
  const displayHour = h <= 12 ? h : h - 12;
  TIMES.push(`${displayHour}:00 ${period}`);
  if (h < 18) {
    TIMES.push(`${displayHour}:30 ${period}`);
  }
}
// Result: 6:00 AM … 6:00 PM in 30-min steps
