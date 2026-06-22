const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const versionType = process.argv[2];

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error("Please provide a valid version type: patch, minor, or major.");
  console.log("Usage: node scripts/release.js <patch|minor|major>");
  process.exit(1);
}

try {
  console.log(`Bumping ${versionType} version...`);
  
  // Update package.json version
  execSync(`npm version ${versionType} --no-git-tag-version`);
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const newVersion = pkg.version;
  
  console.log(`New version is v${newVersion}`);
  
  console.log("Committing changes...");
  execSync(`git add package.json package-lock.json`);
  execSync(`git commit -m "chore(release): v${newVersion}"`);
  
  console.log("Tagging release...");
  execSync(`git tag v${newVersion}`);
  
  console.log("Pushing to GitHub...");
  execSync(`git push origin main`);
  execSync(`git push origin v${newVersion}`);
  
  console.log("🎉 Successfully pushed! GitHub Actions will now build and publish the release.");
} catch (error) {
  console.error("Failed during release process:", error.message);
  process.exit(1);
}
