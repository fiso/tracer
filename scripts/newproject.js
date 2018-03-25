#!/usr/bin/env node
const ncp = require('ncp');
const cp = require('child_process');

if (process.argv.length < 3) {
  console.error('Need a project name (string)');
  process.exit();
}

const projectId = process.argv[2];

ncp('./', `../${projectId}`, (error) => {
  if (error) {
    console.log('Error while copying!\n');
    process.exit();
  }

  cp.execSync(`rm -Rf ../${projectId}/.git/`);
  cp.execSync(`rm -Rf ../${projectId}/build/`);
  cp.execSync(`rm -Rf ../${projectId}/node_modules/`);
  cp.execSync('git init', {cwd: `../${projectId}`});

  console.log(`Project created in ../${projectId}`);
});
