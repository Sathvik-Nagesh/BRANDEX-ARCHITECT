const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function build() {
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  console.log("Loading Logo.png...");
  const logoPath = path.join(__dirname, '..', 'Logos', 'Logo.png');
  if (!fs.existsSync(logoPath)) {
    console.error("Logo.png not found at", logoPath);
    process.exit(1);
  }

  const logo = await Jimp.read(logoPath);
  
  // Create Sidebar (164x314) - Dark Premium Background #1a1a2e (hex to int: 0x1A1A2EFF)
  console.log("Generating sidebar.bmp...");
  const sidebar = new Jimp(164, 314, 0x1A1A2EFF);
  const sidebarLogo = logo.clone().scaleToFit(140, 140);
  sidebar.composite(sidebarLogo, (164 - sidebarLogo.bitmap.width) / 2, 80);
  await sidebar.writeAsync(path.join(buildDir, 'sidebar.bmp'));

  // Create Header (150x57) - White Background
  console.log("Generating header.bmp...");
  const header = new Jimp(150, 57, 0xFFFFFFFF);
  const headerLogo = logo.clone().scaleToFit(130, 45);
  header.composite(headerLogo, (150 - headerLogo.bitmap.width) / 2, (57 - headerLogo.bitmap.height) / 2);
  await header.writeAsync(path.join(buildDir, 'header.bmp'));
  
  console.log("Installer images generated successfully!");
}

build().catch(console.error);
