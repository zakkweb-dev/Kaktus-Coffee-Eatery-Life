import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_DATABASE } from '../data';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Validates connection to Firestore. Throws a console warning if client is offline.
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'config', 'default'));
    console.log('[Firebase] Connection validated successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration as client is offline.");
    }
  }
}
testConnection();

/**
 * Validates and uploads an image to Firebase Storage, returning the clean public URL.
 * Only accepts JPG, JPEG, PNG, WEBP with maximum size of 5MB.
 */
export async function uploadImageToStorage(file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format gambar tidak valid! Hanya diperbolehkan JPG, JPEG, PNG, atau WEBP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran file terlalu besar! Maksimal ukuran gambar adalah 5MB.');
  }
  
  const ext = file.name.split('.').pop() || 'jpg';
  const cleanFileName = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`;
  const storageRef = ref(storage, cleanFileName);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Automatically seeds the database with INITIAL_DATABASE values if the collections are empty.
 */
export async function seedDatabaseIfNeeded() {
  let productsSnap;
  try {
    productsSnap = await getDocs(collection(db, 'produk'));
  } catch (error: any) {
    if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, 'produk');
    }
    console.error('[Firebase] Error checking products collection:', error);
    return;
  }

  try {
    if (productsSnap.empty) {
      const currentUser = auth.currentUser;
      const isAdminUser = currentUser && (
        currentUser.email === 'alrazakiswar11@gmail.com' || 
        currentUser.email === 'al_rasyak_izwar@kaktuscoffee.com'
      );
      
      if (!isAdminUser) {
        console.warn('[Firebase] Database is empty, but seeding is skipped as the current user is not an administrator.');
        return;
      }

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
      // 6. Seed custom_cake
      for (const item of INITIAL_DATABASE.customCake) {
        await setDoc(doc(db, 'custom_cake', item.id), item);
      }
      // 7. Seed config
      await setDoc(doc(db, 'config', 'default'), INITIAL_DATABASE.config);

      // 8. Seed default hero banners
      await setDoc(doc(db, 'hero_banners', 'banner-1'), {
        id: 'banner-1',
        fotoUrl: '/src/assets/images/kaktus_hero_banner_1781599649978.jpg',
        title: 'KAKTUS COFFEE',
        subtitle: 'Eatery & Life',
        isActive: true,
        order: 1
      });
      await setDoc(doc(db, 'hero_banners', 'banner-2'), {
        id: 'banner-2',
        fotoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
        title: 'CRAFTED COFFEE EXPERIENCE',
        subtitle: 'Nikmati Kopi Terbaik Anda',
        isActive: true,
        order: 2
      });
      
      console.log('[Firebase] Initial seeding completed successfully!');
    } else {
      console.log('[Firebase] Database has existing data. Skipping seed.');
    }
  } catch (error: any) {
    if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, 'seeding');
    }
    console.error('[Firebase] Error during database seeding:', error);
    return;
  }

  let reviewsSnap;
  try {
    reviewsSnap = await getDocs(collection(db, 'reviews'));
  } catch (error: any) {
    if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, 'reviews');
    }
    console.error('[Firebase] Error checking reviews collection:', error);
    return;
  }

  try {
    if (reviewsSnap.empty) {
      const currentUser = auth.currentUser;
      const isAdminUser = currentUser && (
        currentUser.email === 'alrazakiswar11@gmail.com' || 
        currentUser.email === 'al_rasyak_izwar@kaktuscoffee.com'
      );

      if (isAdminUser) {
        console.log('[Firebase] Seeding approved default reviews for beautiful UI display...');
        const defaultReviews = [
          {
            id: 'rev-1',
            nama: 'Rian Aditya',
            rating: 5,
            ulasan: 'Suasana tempatnya asri sekali, cocok buat WFH atau sekadar kumpul sore bareng teman. Kopinya nomor satu, custom cake-nya juga sangat lembut!',
            status: 'approved',
            createdAt: Date.now() - 3 * 24 * 3600 * 1000
          },
          {
            id: 'rev-2',
            nama: 'Siti Rahma',
            rating: 5,
            ulasan: 'Kaktus Coffee selalu amanah. Kemarin pesan custom cake wedding di sini, hasilnya cantik sekali dan rasanya enak banget, tidak kemanisan. Highly recommended!',
            status: 'approved',
            createdAt: Date.now() - 1 * 24 * 3600 * 1000
          },
          {
            id: 'rev-3',
            nama: 'Budi Santoso',
            rating: 4,
            ulasan: 'Kopinya mantap dan pelayanannya ramah. Area outdoor-nya juara kalau sore menjelang senja. Pasti balik lagi.',
            status: 'approved',
            createdAt: Date.now() - 5 * 24 * 3600 * 1000
          }
        ];
        for (const rev of defaultReviews) {
          await setDoc(doc(db, 'reviews', rev.id), rev);
        }
        console.log('[Firebase] Seeded 3 default reviews successfully.');
      } else {
        console.log('[Firebase] Reviews collection is empty. Seeding is skipped for unauthenticated visitors.');
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, 'reviews_seeding');
    }
    console.error('[Firebase] Error during reviews seeding:', error);
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
    console.log(`[Firebase Sync] Starting sync for collection '${collectionName}'`);
    
    const batch = writeBatch(db);
    const newIds = newArray.map(item => item.id);

    let hasChanges = false;
    let deleteCount = 0;
    let writeCount = 0;

    // 1. Handle Deletions (present in old but not in new)
    for (const oldItem of oldArray) {
      if (!newIds.includes(oldItem.id)) {
        batch.delete(doc(db, collectionName, oldItem.id));
        hasChanges = true;
        deleteCount++;
      }
    }

    // 2. Handle Insertions and Updates
    for (const newItem of newArray) {
      const oldItem = oldArray.find(o => o.id === newItem.id);
      if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
        batch.set(doc(db, collectionName, newItem.id), newItem);
        hasChanges = true;
        writeCount++;
      }
    }

    if (hasChanges) {
      await batch.commit();
      console.log(`[Firebase Sync] Committed batch to '${collectionName}': ${writeCount} sets, ${deleteCount} deletes`);
    }
  } catch (error) {
    console.error(`[Firebase Sync] Batch transaction failed for '${collectionName}':`, error);
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
