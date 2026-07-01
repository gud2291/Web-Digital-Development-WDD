const fs = require('fs');
const path = require('path');
const https = require('https');

const countryCodes = ['gb', 'es', 'fr', 'de', 'br', 'ru', 'cn', 'jp', 'sa', 'in'];
const destDir = path.join(__dirname, '../public/flags');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  for (const code of countryCodes) {
    const url = `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${code}.svg`;
    const destPath = path.join(destDir, `${code}.svg`);
    console.log(`Downloading flag for ${code}...`);
    try {
      await download(url, destPath);
      console.log(`Successfully downloaded ${code}.svg`);
    } catch (err) {
      console.error(`Failed for ${code}:`, err.message);
    }
  }
}

main();
