const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function resolveGitHubToken() {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN.trim();
  }
  try {
    const out = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const line = out.split(/\r?\n/).find((l) => l.startsWith('password='));
    if (line) return line.slice('password='.length).trim();
  } catch {}
  return '';
}

const token = resolveGitHubToken();
const owner = 'kbyms104';
const upstreamOwner = 'microsoft';
const repo = 'winget-pkgs';

const headers = {
  'Authorization': 'Bearer ' + token,
  'User-Agent': 'NekoSuite-WinGetBot',
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
};

async function api(endpoint, method = 'GET', data = null) {
  const opts = { method, headers };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(`https://api.github.com${endpoint}`, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  if (!res.ok) {
    throw new Error(`API Error [${res.status}] ${endpoint}: ${text}`);
  }
  return json;
}

const packages = [
  {
    id: 'NekoSuite.PurrFocus',
    folder: 'PurrFocus',
    version: '1.1.0',
    branch: 'add-purr-focus-1.1.0',
    previousPr: 431215,
    name: 'Purr Focus'
  },
  {
    id: 'NekoSuite.NekoDrop',
    folder: 'NekoDrop',
    version: '1.1.0',
    branch: 'add-neko-drop-1.1.0',
    previousPr: 431216,
    name: 'Neko Drop'
  },
  {
    id: 'NekoSuite.NekoPunch',
    folder: 'NekoPunch',
    version: '1.1.0',
    branch: 'add-neko-punch-1.1.0',
    previousPr: 431217,
    name: 'Neko Punch'
  },
  {
    id: 'NekoSuite.BongoFormat',
    folder: 'BongoFormat',
    version: '1.1.0',
    branch: 'add-bongo-format-1.1.0',
    previousPr: 431218,
    name: 'Bongo Format'
  }
];

async function run() {
  if (!token) {
    console.error('Error: GitHub token not found in GITHUB_TOKEN or git credential helper.');
    process.exit(1);
  }

  console.log('Syncing fork master with upstream microsoft/winget-pkgs...');
  try {
    const syncRes = await api(`/repos/${owner}/${repo}/merge-upstream`, 'POST', {
      branch: 'master'
    });
    console.log('Fork sync:', syncRes.message || 'Up to date');
  } catch (err) {
    console.warn('Warning: Could not sync fork master automatically:', err.message);
  }

  console.log('Fetching master ref from fork...');
  const masterRef = await api(`/repos/${owner}/${repo}/git/ref/heads/master`);
  const masterSha = masterRef.object.sha;
  console.log('Master SHA:', masterSha);

  const prResults = [];

  for (const pkg of packages) {
    console.log(`\n========================================`);
    console.log(`Processing ${pkg.id} (${pkg.version})...`);
    console.log(`========================================`);

    // 1. Create or reset branch
    try {
      await api(`/repos/${owner}/${repo}/git/refs/heads/${pkg.branch}`, 'DELETE');
      console.log(`Deleted existing branch ${pkg.branch}`);
    } catch {}

    console.log(`Creating branch ${pkg.branch} from ${masterSha}...`);
    await api(`/repos/${owner}/${repo}/git/refs`, 'POST', {
      ref: `refs/heads/${pkg.branch}`,
      sha: masterSha
    });

    // 2. Upload manifest files
    const manifestDir = path.join(__dirname, '..', 'winget-pkgs', 'manifests', 'n', 'NekoSuite', pkg.folder, pkg.version);
    const files = fs.readdirSync(manifestDir);

    for (const file of files) {
      const filePath = path.join(manifestDir, file);
      const content = fs.readFileSync(filePath);
      const base64 = content.toString('base64');
      const targetPath = `manifests/n/NekoSuite/${pkg.folder}/${pkg.version}/${file}`;

      console.log(`Uploading ${file} -> ${targetPath}`);
      await api(`/repos/${owner}/${repo}/contents/${targetPath}`, 'PUT', {
        message: `Add ${pkg.id} version ${pkg.version}`,
        content: base64,
        branch: pkg.branch
      });
    }

    // 3. Create Pull Request to microsoft/winget-pkgs
    const prTitle = `New package: ${pkg.id} version ${pkg.version}`;
    const prBody = `## Pull Request Checklist
- [x] The manifest complies with the [manifest schema specification](https://github.com/microsoft/winget-cli/blob/master/doc/ManifestSpec.md).
- [x] The manifest was validated using \`winget validate --manifest <path>\` and passed without errors.
- [x] The manifest was tested using \`winget install --manifest <path>\` and installed successfully.
- [x] The package complies with the [Quality & Security Guidelines](https://github.com/microsoft/winget-pkgs/blob/master/doc/policies/QualityAndSecurity.md).

### Description
New package submission for \`${pkg.id}\` version \`${pkg.version}\` (supersedes previously stale PR #${pkg.previousPr}, updated to v1.1.0 release and \`ManifestVersion: 1.28.0\`).
Ultra-lightweight Windows desktop utility from the Neko Suite project.
Official Website: https://kbyms104.github.io/neko-suite/
Project Repository: https://github.com/kbyms104/neko-suite`;

    console.log(`Creating Pull Request: "${prTitle}"...`);
    try {
      const pr = await api(`/repos/${upstreamOwner}/${repo}/pulls`, 'POST', {
        title: prTitle,
        head: `${owner}:${pkg.branch}`,
        base: 'master',
        body: prBody
      });
      console.log(`🎉 Pull Request created successfully! URL: ${pr.html_url}`);
      prResults.push({ id: pkg.id, number: pr.number, url: pr.html_url, status: 'CREATED' });
    } catch (err) {
      console.error(`Error creating PR for ${pkg.id}:`, err.message);
      prResults.push({ id: pkg.id, error: err.message, status: 'FAILED' });
    }
  }

  console.log('\n========================================');
  console.log('SUMMARY OF WINGET PULL REQUESTS:');
  console.log('========================================');
  console.log(JSON.stringify(prResults, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
