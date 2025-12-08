module.exports = {
  appId: 'com.ktmlifecare.clinic',
  productName: 'KTM Life Care Clinic',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  win: {
    target: 'nsis',
    icon: 'assets/icon.ico',
  },
  mac: {
    target: 'dmg',
    icon: 'assets/icon.icns',
    category: 'public.app-category.medical',
  },
  linux: {
    target: 'AppImage',
    icon: 'assets/icon.png',
    category: 'Medical',
  },
};

