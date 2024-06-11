import configData from './config.json';

export const transformData = (data, type) => {
  const transformConfig = configData.transformations[type];
  const result = {};

  const extractValue = (path, obj) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || "N/A";
  };

  for (const [key, path] of Object.entries(transformConfig)) {
    if (typeof path === 'object') {
      result[key] = {};
      for (const [subKey, subPath] of Object.entries(path)) {
        result[key][subKey] = extractValue(subPath, data);
      }
    } else {
      result[key] = extractValue(path, data);
    }
  }

  return result;
};
