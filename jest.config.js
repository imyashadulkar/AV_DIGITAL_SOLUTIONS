export default {
  testEnvironment: "node",
  transform: {},
  globals: {
    "ts-jest": {
      useESM: true
    }
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
