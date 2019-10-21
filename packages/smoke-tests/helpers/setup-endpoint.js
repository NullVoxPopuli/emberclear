const { startServer } = require('./start-server');

/**
 * Adds this.host, and this.server
 */
function setupEndpoint() {
  before(async function () {
    switch (process.env.WEBDRIVER_TARGET) {
      case 'pull-request': {
        console.info('---- DEPLOY PREVIEW ----');
        console.info(process.env.DEPLOY_URL);

        this.host = process.env.DEPLOY_URL;

        if (!this.host) {
          throw new Error(`host not set. Did you forget to set $DEPLOY_URL?`);
        }

        break;
      }
      case 'local': {
        let { server, port } = await startServer();

        this.server = server;

        this.host = `https://localhost:${port}`;

        break;
      }
      case 'ember': {
        this.host = `https://localhost:4201`;

        break;
      }
      default: {
        this.host = 'https://emberclear.io';

        break;
      }
    }

    if (process.env.VERBOSE) {
      console.info('Host:', this.host);
    }
  });

  after(async function () {
    if (this.server) {
      this.server.kill();

      await this.server;
    }
  });
}

module.exports = {
  setupEndpoint,
};
