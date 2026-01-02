import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

import { db, STORE_ID, WHATSAPP_NUMBER } from './firebase';
import type { Branch, Product, StoreConfig } from '@/types';

export const collections = {
  stores: (id: string) => doc(db, 'stores', id),
  products: collection(db, 'products'),
  branches: collection(db, 'branches'),
  users: (uid: string) => doc(db, 'users', uid)
};

export async function getStoreConfig(): Promise<StoreConfig> {
  const ref = collections.stores(STORE_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initial: StoreConfig = {
      storeId: STORE_ID,
      storeName: 'FlexiShop',
      accentColor: '#F59E0B',
      whatsappNumber: WHATSAPP_NUMBER,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, initial, { merge: true });
    return { ...initial, createdAt: undefined, updatedAt: undefined };
  }
  const data = snap.data() as any;
  return {
    storeId: snap.id,
    storeName: data.storeName || 'FlexiShop',
    accentColor: data.accentColor || '#F59E0B',
    whatsappNumber: data.whatsappNumber || WHATSAPP_NUMBER
  };
}

export async function updateStoreConfig(patch: Partial<StoreConfig>) {
  const ref = collections.stores(STORE_ID);
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function listProducts(): Promise<Product[]> {
  const q = query(collections.products, where('storeId', '==', STORE_ID), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      storeId: data.storeId,
      name: data.name,
      price: Number(data.price || 0),
      stock: Number(data.stock || 0),
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      active: data.active !== false
    };
  });
}

export async function createProduct(input: Omit<Product, 'id'>) {
  await addDoc(collections.products, {
    ...input,
    storeId: STORE_ID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  await updateDoc(doc(db, 'products', id), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

export async function listBranches(): Promise<Branch[]> {
  const q = query(collections.branches, where('storeId', '==', STORE_ID), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      storeId: data.storeId,
      name: data.name,
      address: data.address,
      hours: data.hours,
      phone: data.phone,
      location: data.location
    };
  });
}

export async function createBranch(input: Omit<Branch, 'id'>) {
  await addDoc(collections.branches, {
    ...input,
    storeId: STORE_ID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateBranch(id: string, patch: Partial<Branch>) {
  await updateDoc(doc(db, 'branches', id), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}

export async function deleteBranch(id: string) {
  await deleteDoc(doc(db, 'branches', id));
}
