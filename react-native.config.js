module.exports = {
    assets: ['./assets/fonts'],
    dependencies: {
      'react-native-vector-icons': {
        platforms: {
          ios: {
            project: './ios/YourProject.xcodeproj',
          },
          android: {
            sourceDir: '../node_modules/react-native-vector-icons/android',
            packageImportPath: 'import io.github.react_native_vector_icons.VectorIconsPackage;',
          },
        },
      },
    },
  };
  