const workboxBuild = require('workbox-build');
workboxBuild.generateSW({
  swDest: './build/default/sw.js',
  importWorkboxFrom: 'local',
  directoryIndex: 'index.html',
  globDirectory: '.',
  globPatterns: ['./build/default/**\/*.{js,css,html,png}'],
}).then(({count, size}) => {
  console.log(`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`);
})
.catch((err) => {
    console.error(`Unable to generate a new service worker.`, err);
});
