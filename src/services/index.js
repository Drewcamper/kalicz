import {
  collection,
  getFirestore,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';

const firestore = getFirestore();
const collectionName = 'images';

// Create a document in Firestore
export const createDocument = async data => {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), data);
    toast.success('Document uploaded successfully');
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    toast.error('Error uploading document');
    throw error;
  }
};

// Fetch all documents from the collection
export const fetchCollection = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching collection:', error);
    toast.error('Error fetching collection');
    throw error;
  }
};

// Delete document and its associated file from Storage
export const deleteDocument = async (id, url) => {
  console.log('Deleting document and file:', { id, url });
  try {
    await deleteDoc(doc(firestore, collectionName, id));
    if (url) {
      const storage = getStorage();
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    }
    toast.success('Document and file deleted successfully');
  } catch (error) {
    console.error('Error deleting document or file:', error);
    toast.error('Error deleting document or file');
    throw error;
  }
};

// Update a document
export const updateDocument = async (id, updates) => {
  try {
    const docRef = doc(firestore, collectionName, id);
    await updateDoc(docRef, updates);
    toast.success('Document updated successfully');
  } catch (error) {
    console.error('Error updating document:', error);
    toast.error('Error updating document');
    throw error;
  }
};
