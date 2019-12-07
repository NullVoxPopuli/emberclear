const Funnel = require('broccoli-funnel');

module.exports = {
  buildStaticTrees() {
    // qr-scanner hardcoded this path.... -.-
    let qrScannerWorker = new Funnel('node_modules/qr-scanner/', {
      include: ['qr-scanner-worker.min.js'],
      destDir: '/libraries/qr-scanner/',
    });

    let prism = new Funnel('node_modules/prismjs', {
      include: ['prism.js', 'themes/*', 'plugins/**', 'components/**'],
      destDir: '/prismjs/',
    });

    return [qrScannerWorker, prism];
  },
};
