import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  writeBatch,
  DocumentData,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_DATABASE } from '../data';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Automatically seeds the database with INITIAL_DATABASE values if the collections are empty.
 */
export async function seedDatabaseIfNeeded() {
  try {
    const productsSnap = await getDocs(collection(db, 'produk'));
    if (productsSnap.empty) {
      console.log('[Firebase] Database is empty. Seeding INITIAL_DATABASE values...');
      
      // 1. Seed produk
      for (const item of INITIAL_DATABASE.produk) {
        await setDoc(doc(db, 'produk', item.id), item);
      }
      // 2. Seed launching
      for (const item of INITIAL_DATABASE.launching) {
        await setDoc(doc(db, 'launching', item.id), item);
      }
      // 3. Seed event
      for (const item of INITIAL_DATABASE.event) {
        await setDoc(doc(db, 'event', item.id), item);
      }
      // 4. Seed galeri
      for (const item of INITIAL_DATABASE.galeri) {
        await setDoc(doc(db, 'galeri', item.id), item);
      }
      // 5. Seed cabang
      for (const item of INITIAL_DATABASE.cabang) {
        await setDoc(doc(db, 'cabang', item.id), item);
      }
      // 6. Seed config
      await setDoc(doc(db, 'config', 'default'), INITIAL_DATABASE.config);
      
      console.log('[Firebase] Initial seeding completed successfully!');
    } else {
      console.log('[Firebase] Database has existing data. Skipping seed.');
    }
  } catch (error) {
    console.error('[Firebase] Error during database seeding:', error);
  }
}

/**
 * Syncs a dynamic local array to a Firestore collection, handling insertions, updates,
 * and deletions perfectly via Firestore batch writes.
 */
export async function syncArrayToCollection(collectionName: string, array: any[]) {
  try {
    const colRef = collection(db, collectionName);
    const existingDocs = await getDocs(colRef);
    const existingIds = existingDocs.docs.map(doc => doc.id);
    const newIds = array.map(item => item.id);

    const batch = writeBatch(db);

    // Step 1: Delete documents that no longer exist in the local state array
    for (const oldId of existingIds) {
      if (!newIds.includes(oldId)) {
        batch.delete(doc(db, collectionName, oldId));
      }
    }

    // Step 2: Add or update existing documents
    for (const item of array) {
      if (item.id) {
        batch.set(doc(db, collectionName, item.id), item);
      }
    }

    await batch.commit();
    console.log(`[Firebase] Successfully synced ${collectionName} with Firestore!`);
  } catch (error) {
    console.error(`[Firebase] Sync error for ${collectionName}:`, error);
  }
}

/**
 * Syncs the config document to Firestore.
 */
export async function syncConfig(configData: any) {
  try {
    await setDoc(doc(db, 'config', 'default'), configData);
    console.log('[Firebase] Config synced with Firestore.');
  } catch (error) {
    console.error('[Firebase] Sync error for config:', error);
  }
}
