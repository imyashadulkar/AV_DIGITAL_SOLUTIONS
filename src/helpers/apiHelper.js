export const stripPrefix = (fieldName) => {
  const colonIndex = fieldName.indexOf(':');
  if (colonIndex !== -1) {
    return fieldName.substring(colonIndex + 1).trim();
  }
  return fieldName.trim();

};

export const stripValuePrefix = (value) => {
  if (typeof value === 'string') {
    const colonIndex = value.indexOf(':');
    if (colonIndex !== -1) {
      return value.substring(colonIndex + 1).trim();
    }
  }
  return value;
};

