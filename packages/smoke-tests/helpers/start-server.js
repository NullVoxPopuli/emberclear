const execa = require('execa');
const path = require('path');

const distLocation = path.join(process.cwd(), '..', 'frontend', 'dist');

async function startServer() {
  console.info(`Starting server at ${distLocation}`);

  let server = execa('http-server', [distLocation], {
    preferLocal: true,
  });

  let port = await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      let str = data.toString();
      let matches = str.match(/http:\/\/127\.0\.0\.1:(\d+)$/m);

      if (matches) {
        let currentPort = parseInt(matches[1]);

        resolve(currentPort);
      }
    });
  });

  return { server, port };
}

module.exports = {
  startServer,
};
