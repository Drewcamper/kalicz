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
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';

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
    return decodeURIComponent(match[1]); // returns 'images/original/filename.jpg'
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
  console.log({ isLoader, documentId, updatedData });
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

export const fetchCollectionByOrder = async (order, isLoader) => {
  try {
    const collectionName = getCollectionName(isLoader);
    const q = query(collection(firestore, collectionName), where('order', '==', order));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching by order:', error);
    toast.error('Error finding linked loader image');
    return [];
  }
};
