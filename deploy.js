import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Parse .env file manually to avoid external dependencies
const envPath = path.resolve('.env');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      env[match[1]] = value;
    }
  });
}

const FTP_HOST = env.FTP_HOST;
const FTP_USER = env.FTP_USER;
const FTP_PASS = env.FTP_PASS;
const UNZIP_KEY = 'rg_sec_2026_d3f1a6c4b8e29a70e5b7';

if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
  console.error('\n❌ ERROR: Please configure FTP_HOST, FTP_USER, and FTP_PASS in your admin/.env file.');
  process.exit(1);
}

try {
  console.log('\n🚀 Starting Local Deployment...');
  
  console.log('\nStep 1: Compiling project (npm run build)...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\nStep 2: Generating routing fallback (.htaccess)...');
  const htaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;
  fs.writeFileSync(path.join('dist', '.htaccess'), htaccess);

  console.log('\nStep 3: Compressing build outputs into tarball...');
  if (fs.existsSync('dist.tar')) {
    fs.unlinkSync('dist.tar');
  }
  
  // Use native tar tool to create a standard tar file (excluding root dot entry)
  execSync('tar -cf dist.tar -C dist *', { stdio: 'inherit' });

  console.log('\nStep 4: Uploading dist.tar to cPanel FTP...');
  const ftpUrl = `ftp://${FTP_HOST}/dist.tar`;
  execSync(`curl -T dist.tar "${ftpUrl}" --user "${FTP_USER}:${FTP_PASS}"`, { stdio: 'inherit' });

  console.log('\nStep 5: Triggering extraction on server...');
  const triggerUrl = `https://rewardgoadmin.hamrotayari.com/unzip.php?key=${UNZIP_KEY}`;
  
  // Execute curl web request
  const response = execSync(`curl -s "${triggerUrl}"`).toString().trim();
  console.log(`Server Response: ${response}`);

  // Cleanup local tar
  if (fs.existsSync('dist.tar')) {
    fs.unlinkSync('dist.tar');
  }

  console.log('\n🎉 Deployment Completed Successfully! Site is Live.');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
