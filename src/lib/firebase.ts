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
 * Syncs changes from a dynamic local state array directly to a Firestore collection,
 * calculating deltas in memory (insertions, updates, deletions) and executing 
 * them as an atomic batch write without scan/getDocs latency.
 */
export async function syncStateArrayToFirestore<T extends { id: string }>(
  collectionName: string,
  oldArray: T[],
  newArray: T[]
) {
  try {
    const batch = writeBatch(db);
    const newIds = newArray.map(item => item.id);

    let hasChanges = false;

    // 1. Handle Deletions (present in old but not in new)
    for (const oldItem of oldArray) {
      if (!newIds.includes(oldItem.id)) {
        batch.delete(doc(db, collectionName, oldItem.id));
        hasChanges = true;
      }
    }

    // 2. Handle Insertions and Updates (present in new, check if changed or new)
    for (const newItem of newArray) {
      const oldItem = oldArray.find(o => o.id === newItem.id);
      if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
        batch.set(doc(db, collectionName, newItem.id), newItem);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await batch.commit();
      console.log(`[Firebase] Successfully flushed batch delta sync for ${collectionName}`);
    }
  } catch (error) {
    console.error(`[Firebase] Batch delta sync error for ${collectionName}:`, error);
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
