export function convertTimeZone(date: Date, timeZone: string): Date {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  const offset = tzDate.getTime() - utcDate.getTime();
  return new Date(date.getTime() + offset);
}

export function convertToUTC(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
}
