/**
 * Script de remoção de campo `preferences.feedScrollThreshold` dos documentos
 * na coleção `users` do Firestore.
 *
 * Uso:
 * 1. Coloque o arquivo de credenciais do service account em
 *    `serviceAccountKey.json` na raiz do projeto, ou configure
 *    GOOGLE_APPLICATION_CREDENTIALS para apontar ao JSON.
 * 2. Instale dependências: `npm install firebase-admin` (se ainda não tiver).
 * 3. Rode: `node scripts/remove_feed_pref.js`
 *
 * Observação: o script atualiza documentos sequencialmente; para coleções
 * muito grandes pode ser necessário adaptar para usar batches.
 */

const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('./serviceAccountKey.json')) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  // Tenta usar Application Default Credentials
  admin.initializeApp();
}

const db = admin.firestore();

async function run() {
  console.log('Iniciando limpeza de preferences.feedScrollThreshold em users...');
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  console.log(`Documentos encontrados: ${snapshot.size}`);

  const FieldValue = admin.firestore.FieldValue;
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    if (data.preferences && Object.prototype.hasOwnProperty.call(data.preferences, 'feedScrollThreshold')) {
      const prefs = { ...data.preferences };
      delete prefs.feedScrollThreshold;

      try {
        if (Object.keys(prefs).length === 0) {
          await doc.ref.update({ preferences: FieldValue.delete() });
        } else {
          await doc.ref.update({ preferences: prefs });
        }
        console.log(`Atualizado: ${doc.id}`);
        updated++;
      } catch (err) {
        console.error(`Erro ao atualizar ${doc.id}:`, err.message || err);
      }
    }
  }

  console.log(`Limpeza concluída. Documentos atualizados: ${updated}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Erro no script:', err);
  process.exit(1);
});
