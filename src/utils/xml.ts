/**
 * Converts a JS object to XML wrapped in an open/closing tag
 * @param {Record<string | number, unknown> | Array<unknown>} obj An object
 * @param {string} openingTag The parent opening tag without <>, this may include attributes eg `QDocRoot version="1.0"
 * @param {string} closingTag The parent closing tag without <> eg `QDocRoot`
 * @param {number} indent The indentation level
 * @returns {string} The XML string
 */
export function objectToXml(
  obj: Record<string | number, unknown> | Array<unknown>,
  openingTag: string,
  closingTag?: string,
  indent: number = 0,
): string {
  if (Array.isArray(obj)) {
    const array = obj as Array<unknown>;
    let xml = ``;
    for (let i = 0, len = array.length; i < len; i += 1) {
      const item = array[i];
      const itemXml = objectToXml(item as Record<string | number, unknown>, openingTag, closingTag, indent + 2);
      xml += `\n${' '.repeat(indent)}${itemXml}${'  '.repeat(indent)}`;
    }
    return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` : xml;
  }
  let xml = `${' '.repeat(indent)}<${openingTag}>`;
  const objectKeys = Object.keys(obj);
  for (let i = 0, len = objectKeys.length; i < len; i += 1) {
    const key = objectKeys[i];
    if (key) {
      if (Object.hasOwn(obj, key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          const itemXml = objectToXml(value as Record<string | number, unknown>, key, key, indent + 2);
          xml += `\n${itemXml}${' '.repeat(indent)}`;
        } else {
          xml += `\n${' '.repeat(indent + 2)}<${key}><![CDATA[${value}]]></${key}>`;
        }
      }
    }
  }
  xml += `\n${' '.repeat(indent)}</${closingTag ?? openingTag}>`;
  return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` : xml;
}
