import { FileTypeEnum } from 'src/types/enums';

/* eslint-disable @typescript-eslint/quotes */
const splitDelimiters: string[] = [',', ';', '/', ' & '];

/**
 * Splits an array of strings that may be additionally delimited by common delimiters (comma, semicolon, and ampersand).
 * @param {string[]} items The array of strings to split
 * @returns {string[]} The array of split strings
 */
export function splitArray(items: string[]): string[] {
  const splitItems: string[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item) {
      let inserted = false;
      for (let j = 0; j < splitDelimiters.length; j += 1) {
        const delimiter = splitDelimiters[j];
        if (delimiter) {
          if (item.includes(delimiter)) {
            const parts = item.split(delimiter);
            if (parts.length > 0) {
              for (let k = 0; k < parts.length; k += 1) {
                const part = parts[k]?.trim();
                if (part) {
                  splitItems.push(part);
                }
              }
            }
            inserted = true;
            break;
          }
        }
      }
      if (!inserted) {
        splitItems.push(item.trim());
      }
    }
  }
  return splitItems;
}

/**
 * Cleans up a string by trimming whitespace, escaping single quotes, and removing unwanted characters
 * that can be problematic to insert into the database.
 * @param {string} value The string to sanitize
 * @returns {string} The sanitized string
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .split("'")
    .join("''")
    .replace(/[^\p{L}\p{N}\p{P}\p{P} ]/gu, '');
}

/**
 * Normalizes a string by sanitizing it and converting it to lowercase.
 * @param {string} value The string to normalize
 * @returns {string} The normalized string
 */
export function normalizeString(value: string): string {
  return sanitizeString(value).toLocaleLowerCase();
}

/**
 * Replaces the double-quotes in a string required for SQLite insertion
 * @param {string} value The string in which to replace double quotes
 * @returns {string} The string with double quotes replaced
 */
export function replaceDoubleQuotes(value: string): string {
  // eslint-disable-next-line @typescript-eslint/quotes
  return value.split("''").join("'");
}

/**
 * Returns the corresponding MIME type for a given audio codec.
 * @param {FileTypeEnum} codec The audio codec for which to get the conten t type
 * @returns {string} The corresponding MIME type for the audio codec
 */
export function getAudioContentType(codec: FileTypeEnum): string {
  switch (codec) {
    case FileTypeEnum.MP3:
      return 'audio/mpeg';
    case FileTypeEnum.FLAC:
      return 'audio/flac';
    // case FileTypeEnum.WAV:
    //   return 'audio/wav';
    case FileTypeEnum.OGG:
      return 'audio/ogg';
    case FileTypeEnum.M4A:
      return 'audio/mp4';
    default:
      return 'application/octet-stream';
  }
}
