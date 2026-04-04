const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'icons', 'icon-512.webp');
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)){
    fs.mkdirSync(assetsDir);
}

const iconDest = path.join(assetsDir, 'icon.png');
const splashDest = path.join(assetsDir, 'splash.png'); // usually needs to be large but we'll use same for now

async function convert() {
  try {
    await sharp(inputPath)
      .resize(1024, 1024, { fit: 'contain', background: { r: 11, g: 12, b: 16, alpha: 1 } })
      .png()
      .toFile(iconDest);
      
    await sharp(inputPath)
      .resize(2732, 2732, { fit: 'contain', background: { r: 11, g: 12, b: 16, alpha: 1 } })
      .png()
      .toFile(splashDest);
      
    console.log('Successfully generated assets/icon.png and assets/splash.png');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

convert();
