export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function toKey(str: string) {
  return `${str
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 10)}-${getRandomNumber(0, 4)}`;
}
