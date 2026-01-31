export function convertToISTString(utcISOString: string): string {
  const date = new Date(utcISOString);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(date);

  const dateTimeParts: { [key: string]: string } = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      dateTimeParts[part.type] = part.value;
    }
  }

  const formattedDate = `${dateTimeParts.day} ${dateTimeParts.month} ${dateTimeParts.year}`;
  const formattedTime = `${dateTimeParts.hour}:${dateTimeParts.minute}`;

  return `${formattedDate}, ${formattedTime}`;
}

export const convertToKeyword = (name: string) => {
  return `${name?.split(' ').reduce((acc, word) => {
    return acc + word.charAt(0).toUpperCase();
  }, '')}`.slice(0, 2);
};

export function convertHHMMSSToSeconds(timeStr: string) {
  let seconds = 0;
  const timeUnits = timeStr.split(':');
  timeUnits.reverse().forEach((timeUnit, i) => {
    seconds += parseInt(timeUnit) * 60 ** i;
  });

  return seconds;
}
