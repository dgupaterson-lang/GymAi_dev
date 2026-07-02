module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin remplace react-native-reanimated/plugin
    // depuis Reanimated v4 et doit rester en DERNIER de la liste.
    plugins: ['react-native-worklets/plugin'],
  };
};
