#!/usr/bin/env node

const execa = require('execa');
const Listr = require('listr');
const fetch = require('node-fetch');

const GITHUB_API_URL="https://api.github.com"

const {
  GITHUB_REPOSITORY, GITHUB_TOKEN, GITHUB_SHA
} = process.env;

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
    title: 'Creating Deployment',
    task: async () => {
      deployId = await createDeploy();
    }
  },
  {
    title: 'Setting Deployment Status: In Progress',
    task: () => updateStatus(deployId, STATUS.IN_PROGRESS),
  },
  {
    title: 'Install Dependencies',
    task: () => execa('./run yarn install'),
  },
  {
    title: 'Build for Production',
    task: () => execa('./run yarn build:production'),
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


async function createDeploy() {
  let response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/deployments`, {
    method: 'POST',
    headers: {
      ['Authorization']: `token ${GITHUB_TOKEN}`,
      ['Content-Type']: `text/jsqn; charset=utf-8`,
      // ['Accept']: '',
      ['User-Agent']: 'NullVoxPopuli'
    },
    data: {
      ref: GITHUB_SHA,
      auto_merge: false,
      required_contexts: [],
      environment: 'branch',
      description: 'Deploying',
    }
  });
  let text = await response.json();
  console.error(text, typeof text);
  let json = JSON.parse(text);

  return json.id;
}

async function updateStatus(deployId, status, description = '') {
  let response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/deployments/${deployId}/statuses`, {
    method: 'POST',
    headers: {
      ['Authorization']: `token ${GITHUB_TOKEN}`,
      ['Content-Type']: `text/jsqn; charset=utf-8`,
      // ['Accept']: '',
      ['User-Agent']: 'NullVoxPopuli'
    },
    data: {
      state: status,
      ['target_url']: `https://github.com/${GITHUB_REPOSITORY}`,
      description: `${description}`
    }
  });

  await response.json();
}


tasks.run().catch(async err => {
  try {
    await updateStatus(deployId, STATUS.FAILURE);
  } finally {
    process.exit(1);
  }
});
