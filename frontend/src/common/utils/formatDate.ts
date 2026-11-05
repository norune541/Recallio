export function formatSmartUSDate(date: Date | number | string): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  const now = new Date();

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  const diffTime = startOfTarget.getTime() - startOfNow.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) <= 7) {
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
    return rtf.format(diffDays, 'day');
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(targetDate.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  };

  return new Intl.DateTimeFormat('en-US', options).format(targetDate);
}
