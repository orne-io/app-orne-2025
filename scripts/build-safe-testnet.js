const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = 'build';
const TEMP_BUILD_DIR = 'build-temp-testnet';
const BACKUP_DIR = 'build-backup-testnet';

console.log('🚀 Starting safe testnet build process...');

try {
  // 1. Nettoyer le dossier temporaire s'il existe
  if (fs.existsSync(TEMP_BUILD_DIR)) {
    console.log('🧹 Cleaning temporary build directory...');
    fs.rmSync(TEMP_BUILD_DIR, { recursive: true, force: true });
  }

  // 2. Créer le dossier temporaire
  console.log('📁 Creating temporary build directory...');
  fs.mkdirSync(TEMP_BUILD_DIR, { recursive: true });

  // 3. Copier les fichiers nécessaires pour le build
  console.log('📋 Copying source files to temporary directory...');
  
  // Copier package.json et package-lock.json
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', path.join(TEMP_BUILD_DIR, 'package.json'));
  }
  if (fs.existsSync('package-lock.json')) {
    fs.copyFileSync('package-lock.json', path.join(TEMP_BUILD_DIR, 'package-lock.json'));
  }

  // Copier le dossier src
  if (fs.existsSync('src')) {
    execSync(`cp -r src ${TEMP_BUILD_DIR}/`);
  }

  // Copier le dossier public
  if (fs.existsSync('public')) {
    execSync(`cp -r public ${TEMP_BUILD_DIR}/`);
  }

  // Copier les fichiers de configuration
  const configFiles = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.testnet',
    'tailwind.config.js',
    'postcss.config.js',
    'vite.config.js',
    'vite.config.ts',
    'webpack.config.js',
    'next.config.js',
    'craco.config.js'
  ];

  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(TEMP_BUILD_DIR, file));
    }
  });

  // 4. Aller dans le dossier temporaire et installer les dépendances
  console.log('📦 Installing dependencies in temporary directory...');
  process.chdir(TEMP_BUILD_DIR);
  execSync('npm ci --production=false --legacy-peer-deps', { stdio: 'inherit' });

  // 5. Faire le build testnet
  console.log('🔨 Building testnet in temporary directory...');
  execSync('REACT_APP_ENV=testnet npm run build', { stdio: 'inherit' });

  // 6. Vérifier que le build a créé un dossier build
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error('Testnet build failed: no build directory created');
  }

  // 7. Retourner au dossier racine
  process.chdir('..');

  // 8. Créer une sauvegarde de l'ancien build
  if (fs.existsSync(BUILD_DIR)) {
    console.log('💾 Creating backup of current build...');
    if (fs.existsSync(BACKUP_DIR)) {
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.renameSync(BUILD_DIR, BACKUP_DIR);
  }

  // 9. Copier le nouveau build
  console.log('📁 Copying new testnet build to production directory...');
  execSync(`cp -r ${TEMP_BUILD_DIR}/${BUILD_DIR} ./`);

  // 10. Nettoyer le dossier temporaire
  console.log('🧹 Cleaning temporary directory...');
  fs.rmSync(TEMP_BUILD_DIR, { recursive: true, force: true });

  // 11. Nettoyer l'ancienne sauvegarde (optionnel)
  if (fs.existsSync(BACKUP_DIR)) {
    console.log('🗑️ Removing old backup...');
    fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
  }

  console.log('✅ Safe testnet build completed successfully!');
  console.log('🎉 Application is now running with the new testnet build.');

} catch (error) {
  console.error('❌ Testnet build failed:', error.message);
  
  // En cas d'échec, restaurer l'ancien build s'il existe
  if (fs.existsSync(BACKUP_DIR)) {
    console.log('🔄 Restoring previous build...');
    if (fs.existsSync(BUILD_DIR)) {
      fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    }
    fs.renameSync(BACKUP_DIR, BUILD_DIR);
    console.log('✅ Previous build restored.');
  }

  // Nettoyer le dossier temporaire
  if (fs.existsSync(TEMP_BUILD_DIR)) {
    console.log('🧹 Cleaning temporary directory...');
    fs.rmSync(TEMP_BUILD_DIR, { recursive: true, force: true });
  }

  process.exit(1);
} 