#!/usr/bin/env node

const execa = require('execa');
const Listr = require('listr');
const fetch = require('node-fetch');

const GITHUB_API_URL="https://api.github.com"

const {
  GITHUB_REPOSITORY, GITHUB_TOKEN, GITHUB_SHA
} = process.env;


const cwd = process.cwd();

const STATUS = {
  ERROR: 'error',
  FAILURE: 'failure',
  INACTIVE: 'inactive',
  IN_PROGRESS: 'in_progress',
  QUEUED: 'queued',
  PENDING: 'pending',
  SUCCESS: 'success',
}

let deployId = undefined;
let url = '';

const tasks = new Listr([
  {
    title: 'Setting Deployment Status: In Progress',
    task: () => updateStatus(deployId, STATUS.IN_PROGRESS),
  },
  {
    title: 'Install Dependencies',
    task: () => execa.sync('./run yarn install', { cwd }),
  },
  {
    title: 'Build for Production',
    task: () => execa.sync('./run yarn build:production', { cwd }),
  },
  {
    title: 'Deploying to Netlify',
    task: () => url = deploy(),
  },
  {
    title: 'Updating Deployment Status: Success',
    task: () => updateStatus(deployId, STATUS.SUCCESS, url),
  }
]);

function deploy( ){
  let dir = 'packages/frontend/dist';
  let { stdout } = execa.sync(`netlify deploy --dir=${dir} --json`);

  console.log(stdout, typeof stdout);
  let response = JSON.parse(stdout);

  let deployUrl = response['deploy_url'];

  console.log(`
    Deploy Preview URL
    ${deployUrl}
  `);

  return deployUrl;
}


function updateStatus(deployId, status, targetUrl = '') {
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
      ['target_url']: targetUrl || `https://github.com/${GITHUB_REPOSITORY}`,
      description: 'Deploy Preview'
    }
  });
}


tasks.run().catch(async err => {
  try {
    await updateStatus(deployId, STATUS.FAILURE);
  } finally {
    process.exit(1);
  }
});
