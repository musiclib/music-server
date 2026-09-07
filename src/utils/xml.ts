export function objectToXml(
  obj: Record<string | number, unknown> | Array<unknown>,
  rootElement: string,
  closingTag?: string,
  indent: number = 0,
): string {
  if (Array.isArray(obj)) {
    const array = obj as Array<unknown>;
    let xml = ``;
    for (let i = 0, len = array.length; i < len; i += 1) {
      const item = array[i];
      const itemXml = objectToXml(item as Record<string | number, unknown>, rootElement, closingTag, indent + 2);
      xml += `\n${' '.repeat(indent)}${itemXml}${'  '.repeat(indent)}`;
    }
    return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` : xml;
  }
  let xml = `${' '.repeat(indent)}<${rootElement}>`;
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
  xml += `\n${' '.repeat(indent)}</${closingTag ?? rootElement}>`;
  return indent === 0 ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}` : xml;
}
