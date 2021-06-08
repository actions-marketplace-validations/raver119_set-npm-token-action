const fs = require('fs');
const core = require('@actions/core');

const cleanse = (registry, token) => {
  return `${registry.replace(/^(http|https):/i, "").replace(/\/$/,"")}/:_authToken=${token}`
}

async function run() {
  try {
    const token = core.getInput('token');
    const scope = core.getInput('scope');
    const registry = core.getInput('registry');
    core.setSecret(token);

    // original mode, .npmrc uses npmjs registry
    let npmrc = `//registry.npmjs.org/:_authToken=${token}`

    if (registry.length > 0) {
      // registry goes first, since it's applied regardless of the scope
      npmrc = cleanse(registry, token)

      if (scope.length > 0 && scope.startsWith("@")) {
        // if scope was defined - apply it
        npmrc = `${npmrc}\m${scope}:registry=${registry.replace(/\/$/, "")}`
      }
    }

    fs.writeFile('.npmrc', npmrc, error => {
      if (error) {
        core.setFailed(error.message);
      }
    })

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
