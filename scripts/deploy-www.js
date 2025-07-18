const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = path.resolve(__dirname, '../build');
const WWW_DIR = path.resolve(__dirname, '../www'); // Dossier local au projet
const BACKUP_DIR = path.resolve(__dirname, '../www-backup');

console.log('🚀 Déploiement du build dans', WWW_DIR);

try {
  // 1. Vérifier que le build existe
  if (!fs.existsSync(BUILD_DIR)) {
    throw new Error('Le dossier build/ n\'existe pas. Lancez d\'abord npm run build.');
  }

  // 2. Sauvegarder l'ancien /www/ (optionnel mais recommandé)
  if (fs.existsSync(WWW_DIR)) {
    console.log('💾 Backup de /www/ vers /www-backup ...');
    if (fs.existsSync(BACKUP_DIR)) {
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.cpSync(WWW_DIR, BACKUP_DIR, { recursive: true });
  }

  // 3. Remplacer le contenu de /www/ par le nouveau build
  console.log('📁 Déploiement du nouveau build ...');
  // On supprime tout sauf le dossier lui-même
  if (fs.existsSync(WWW_DIR)) {
    fs.readdirSync(WWW_DIR).forEach(file => {
      fs.rmSync(path.join(WWW_DIR, file), { recursive: true, force: true });
    });
  } else {
    fs.mkdirSync(WWW_DIR, { recursive: true });
  }
  // Copier le build dedans
  fs.cpSync(BUILD_DIR, WWW_DIR, { recursive: true });

  // Gestion des droits d'accès
  try {
    execSync('chown -R www-data:www-data ' + WWW_DIR);
    execSync('find ' + WWW_DIR + ' -type d -exec chmod 755 {} \\;');
    execSync('find ' + WWW_DIR + ' -type f -exec chmod 644 {} \\;');
    console.log('🔒 Droits d\'accès mis à jour.');
  } catch (permErr) {
    console.warn('⚠️  Impossible de mettre à jour les droits d\'accès automatiquement. Faites-le manuellement si besoin.');
  }

  console.log('✅ Déploiement terminé avec succès !');
} catch (error) {
  console.error('❌ Erreur lors du déploiement :', error.message);
  // Restauration possible
  if (fs.existsSync(BACKUP_DIR)) {
    console.log('🔄 Restauration de la sauvegarde précédente ...');
    // On supprime tout dans /www/
    if (fs.existsSync(WWW_DIR)) {
      fs.readdirSync(WWW_DIR).forEach(file => {
        fs.rmSync(path.join(WWW_DIR, file), { recursive: true, force: true });
      });
    } else {
      fs.mkdirSync(WWW_DIR, { recursive: true });
    }
    fs.cpSync(BACKUP_DIR, WWW_DIR, { recursive: true });
    // Gestion des droits d'accès après restauration
    try {
      execSync('chown -R www-data:www-data ' + WWW_DIR);
      execSync('find ' + WWW_DIR + ' -type d -exec chmod 755 {} \\;');
      execSync('find ' + WWW_DIR + ' -type f -exec chmod 644 {} \\;');
      console.log('🔒 Droits d\'accès mis à jour après restauration.');
    } catch (permErr) {
      console.warn('⚠️  Impossible de mettre à jour les droits d\'accès automatiquement après restauration. Faites-le manuellement si besoin.');
    }
    console.log('✅ Restauration effectuée.');
  }
  process.exit(1);
} 