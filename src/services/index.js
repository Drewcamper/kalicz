import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { toast } from 'react-toastify';

const firestore = getFirestore();

export const fetchCollection = async collectionName => {
  try {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    toast(error);
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(firestore, collectionName, id));
    toast('Document deleted successfull');
  } catch (error) {
    toast(error);
  }
};

export const updateDocument = async (collectionName, id, updates) => {
  try {
    const docRef = doc(firestore, collectionName, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    toast(error);
  }
};
