const workboxBuild = require('workbox-build');
const swDest = './build/default/sw.js';
workboxBuild
  .generateSW({
    swDest,
    importWorkboxFrom: 'local',
    directoryIndex: 'index.html',
    globDirectory: './build/default',
    globPatterns: ['**/*.{js,css,html,png}'],
    runtimeCaching: [
      {
        // Match any same-origin request that contains 'api'.
        urlPattern: /node_modules/,
        // Apply a network-first strategy.
        handler: 'cacheFirst',
        options: {
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  })
  .then(({ count, size }) => {
    console.log(
      `Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`
    );
  })
  .catch(err => {
    console.error(`Unable to generate a new service worker.`, err);
  });
