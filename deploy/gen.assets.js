const sharp = require('sharp');
const fs = require('fs');

const SRC_IMG = 'src/assets/favicon.svg';

async function resize(dim, output) {
  const outputFile = `public/img/icons/${output}`;
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  await sharp(SRC_IMG)
    .resize({ width: dim, height: dim })
    .png({ progressive: true, compressionLevel: 9 })
    .toFile(outputFile);
}


async function main() {
  await Promise.race([
    resize(192, 'android-chrome-192x192.png'),
    resize(512, 'android-chrome-512x512.png'),
    resize(192, 'android-chrome-maskable-192x192.png'),
    resize(512, 'android-chrome-maskable-512x512.png'),
    resize(180, 'apple-touch-icon.png'),
    resize(60, 'apple-touch-icon-60x60.png'),
    resize(76, 'apple-touch-icon-76x76.png'),
    resize(120, 'apple-touch-icon-120x120.png'),
    resize(152, 'apple-touch-icon-152x152.png'),
    resize(180, 'apple-touch-icon-180x180.png'),
    resize(16, 'favicon-16x16.png'),
    resize(32, 'favicon-32x32.png'),
    resize(144, 'msapplication-icon-144x144.png'),
    resize(150, 'mstile-150x150.png'),
    resize(150, 'mstile-150x150.png'),
  ]);

}

main();
