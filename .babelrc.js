module.exports = (api) => {
  const isTesting = api.caller((caller) => caller.name === '@babel/register');

  return {
    presets: [
      ['@babel/preset-env', {
        modules: isTesting ? 'commonjs' : false,
        loose: true,
        targets: isTesting ? { node: 'current' } : null,
      }],
    ],
    plugins: isTesting ? ['istanbul'] : [],
  };
};
