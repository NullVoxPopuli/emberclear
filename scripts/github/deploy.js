#!/usr/bin/env node

const execa = require('execa');
const Listr = require('listr');
const fetch = require('node-fetch');
const Octokit = require('@octokit/rest')

const GITHUB_API_URL="https://api.github.com"

const {
  GITHUB_REPOSITORY, GITHUB_TOKEN, GITHUB_SHA,
  GITHUB_REF
} = process.env;


const BEGIN='begin';
const SUCCESS='success';
const FAILURE='failure';
const [_node, _script, stage, url] = process.argv;


const octokit = new Octokit({
  auth: `token ${ GITHUB_TOKEN }`,
});

const [owner, repo] = GITHUB_REPOSITORY.split('/');


async function begin() {
    let result = await octokit.checks.create({
      owner,
      repo,
      name: 'Deploy Preview',
      head_sha: GITHUB_SHA
    });

  console.log(result);
}

async function success( ){
    let result = await octokit.checks.update({
      owner,
      repo,
      status: 'completed',
      conclusion: 'success',
      details_url: url,
      check_run_id
    });

  console.log(result);
}

function failure() {
    let result = octokit.checks.update({
      owner,
      repo,
      status: 'completed',
      conclusion: 'failure',
      check_run_id
    });

  console.log(result);
}

switch (stage) {
  case BEGIN:
    return new Listr([
      {
        title: 'Setting Up Status Check',
        task: () => {
          return begin();
        }
      }
    ]).run().catch(err => {
        console.error(err);
    });
  case SUCCESS:
    return success();
  case FAILURE:
    return failure();
}

