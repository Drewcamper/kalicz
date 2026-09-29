import {
  collection,
  getFirestore,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';
import { DEFAULT_CATEGORY } from '../constants/categories';

const firestore = getFirestore();
const COLLECTION_NAMES = {
  LOADERS: 'loader',
  ORIGINALS: 'original',
};

const getCollectionName = isLoader =>
  isLoader ? COLLECTION_NAMES.LOADERS : COLLECTION_NAMES.ORIGINALS;

const getStoragePathFromUrl = url => {
  const match = url?.match(/\/o\/(.*?)\?alt=media/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]); // returns 'images/original/<category>/filename.jpg'
  }
  return null;
};

export const fetchCollection = async isLoader => {
  try {
    const collectionName = getCollectionName(isLoader);
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    toast.error('Error fetching collection');
    throw error;
  }
};

export const getOneOriginalImage = async id => {
  const docRef = doc(firestore, COLLECTION_NAMES.ORIGINALS, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('Original image not found');
  }
};

export const createDocument = async (isLoader, documentData) => {
  try {
    const collectionName = getCollectionName(isLoader);
    const docRef = await addDoc(collection(firestore, collectionName), documentData);
    if (docRef && collectionName === COLLECTION_NAMES.ORIGINALS)
      toast.success('Image uploaded successfully');
    return docRef?.id;
  } catch (error) {
    toast.error('Error adding document: ', error);
    throw error;
  }
};

export const updateDocument = async (isLoader, documentId, updatedData) => {
  try {
    const collectionName = getCollectionName(isLoader);

    const docRef = doc(firestore, collectionName, documentId);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    toast.error('Error updating document');
    throw error;
  }
};

export const deleteDocument = async (isLoader, documentId, imageUrl) => {
  try {
    if (imageUrl) {
      const storagePath = getStoragePathFromUrl(imageUrl);
      if (storagePath) {
        const storage = getStorage();
        const imageRef = ref(storage, storagePath);
        await deleteObject(imageRef);
      }
    }

    const collectionName = getCollectionName(isLoader);
    const docRef = doc(firestore, collectionName, documentId);
    await deleteDoc(docRef);

    if (!isLoader) toast.success('Image deleted successfully');
  } catch (error) {
    toast.error('Error deleting image');
    throw error;
  }
};

// `category` is required so that two images in different categories
// that happen to share the same local `order` number never get
// cross-matched as if they were the same upload's original/loader pair.
export const fetchCollectionByOrder = async (order, isLoader, category = DEFAULT_CATEGORY) => {
  try {
    const collectionName = getCollectionName(isLoader);
    const q = query(
      collection(firestore, collectionName),
      where('order', '==', order),
      where('category', '==', category),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching by order:', error);
    toast.error('Error finding linked loader image');
    return [];
  }
};

// One-time, idempotent migration: any document written before
// categories existed has no `category` field. Firestore's `==` queries
// never match a missing field, so fetchCollectionByOrder would silently
// fail to pair up legacy images unless every doc explicitly carries
// category: 'index'. Safe to call on every admin session — it's a
// no-op once everything has been migrated.
export const migrateLegacyCategory = async () => {
  const [originals, loaders] = await Promise.all([
    fetchCollection(false),
    fetchCollection(true),
  ]);

  const legacyOriginals = originals.filter(img => !img.category);
  const legacyLoaders = loaders.filter(img => !img.category);

  const legacy = [
    ...legacyOriginals.map(img => ({ ...img, isLoader: false })),
    ...legacyLoaders.map(img => ({ ...img, isLoader: true })),
  ];

  if (legacy.length === 0) {
    return { migrated: 0 };
  }

  const batch = writeBatch(firestore);
  legacy.forEach(img => {
    const collectionName = getCollectionName(img.isLoader);
    batch.update(doc(firestore, collectionName, img.id), { category: DEFAULT_CATEGORY });
  });
  await batch.commit();

  return { migrated: legacy.length };
};
