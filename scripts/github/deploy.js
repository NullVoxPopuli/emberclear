#!/usr/bin/env node

const execa = require('execa');
const Listr = require('listr');
const fetch = require('node-fetch');

const GITHUB_API_URL="https://api.github.com"

const {
  GITHUB_REPOSITORY, GITHUB_TOKEN, GITHUB_SHA
} = process.env;


const [_node, _script, status, url] = process.argv;

const tasks = new Listr([
  {
    title: 'Setting Deployment Status: In Progress',
    task: () => updateStatus(),
  },
]);

// function deploy( ){
//   let dir = 'packages/frontend/dist';
//   let { stdout } = execa.sync(`netlify deploy --dir=${dir} --json`);

//   console.log(stdout, typeof stdout);
//   let response = JSON.parse(stdout);

//   let deployUrl = response['deploy_url'];

//   console.log(`
//     Deploy Preview URL
//     ${deployUrl}
//   `);

//   return deployUrl;
// }


function updateStatus() {
  return fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/statuses/${GITHUB_SHA}`, {
    method: 'POST',
    headers: {
      ['Authorization']: `token ${GITHUB_TOKEN}`,
      // ['Content-Type']: `text/json; charset=utf-8`,
      // ['Accept']: '',
      // ['User-Agent']: 'NullVoxPopuli'
    },
    data: {
      state: status,
      ['target_url']: url || `https://github.com/${GITHUB_REPOSITORY}`,
      description: 'Deploy Preview'
    }
  });
}


tasks.run().catch(err => {
  console.error(err);
  process.exit(1);
});
