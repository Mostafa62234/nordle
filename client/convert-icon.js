import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pngInput = path.join(__dirname, 'icons', 'icon.png');
const webpInput = path.join(__dirname, 'icons', 'icon-512.webp');
const inputPath = fs.existsSync(pngInput) ? pngInput : webpInput;

const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)){
    fs.mkdirSync(assetsDir);
}

const iconDest = path.join(assetsDir, 'icon.png');
const splashDest = path.join(assetsDir, 'splash.png');
const foregroundDest = path.join(assetsDir, 'icon-foreground.png');
const backgroundDest = path.join(assetsDir, 'icon-background.png');

const ZOOM = 1.0;
const baseSize = 1024;
const zoomedSize = Math.floor(baseSize * ZOOM);

async function convert() {
  try {
    // Generate standard icon
    await sharp(inputPath)
      .resize(zoomedSize, zoomedSize, { fit: 'contain', background: { r: 11, g: 12, b: 16, alpha: 1 } })
      .extract({ left: Math.floor((zoomedSize - baseSize) / 2), top: Math.floor((zoomedSize - baseSize) / 2), width: baseSize, height: baseSize })
      .png()
      .toFile(iconDest);
      
    // Generate splash
    await sharp(inputPath)
      .resize(2732, 2732, { fit: 'contain', background: { r: 11, g: 12, b: 16, alpha: 1 } })
      .png()
      .toFile(splashDest);
      
    // Generate foreground (transparent)
    await sharp(inputPath)
      .resize(zoomedSize, zoomedSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extract({ left: Math.floor((zoomedSize - baseSize) / 2), top: Math.floor((zoomedSize - baseSize) / 2), width: baseSize, height: baseSize })
      .png()
      .toFile(foregroundDest);
      
    // Generate background (solid color)
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 11, g: 12, b: 16, alpha: 1 }
      }
    })
    .png()
    .toFile(backgroundDest);
      
    console.log('Successfully generated assets/icon.png, assets/splash.png, icon-foreground.png, and icon-background.png');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

convert();
