const util = require('util');
const { notDefined } = require('../util/checks');

const prefixKey = (prefix, key) => {
  if (notDefined(prefix) || prefix === '') {
    return key;
  }
  return `${prefix}.${key}`;
};

const toStringKeys = ['toString', Symbol.toStringTag];
const inspectKeys = ['inspect', util.inspect.custom];

const contentProxy = (step, prefix) => {
  const get = (target, name) => {
    if (name === 'hasOwnProperty') {
      return property => {
        const isToString = toStringKeys.includes(property);
        const isInspect = inspectKeys.includes(property);
        return isToString || isInspect;
      };
    }
    const key = `${step.name}:${prefix}`;
    if (toStringKeys.includes(name)) {
      if (target.exists(key)) {
        return () => target.t(key, step.locals);
      }
      return () => {
        throw new Error(`No translation for ${key}`);
      };
    }
    if (inspectKeys.includes(name)) {
      return () => `Proxy { key: ${key}, value: ${target.t(key)} }`;
    }
    const newPrefix = prefixKey(prefix, name);
    return new Proxy(target, contentProxy(step, newPrefix));
  };

  return { get };
};

module.exports = { contentProxy };
