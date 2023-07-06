import { app } from './firebase.setup';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    type DocumentData,
    type SetOptions
} from "firebase/firestore";
import { collectionData } from 'rxfire/firestore';
import { startWith } from 'rxjs/operators';
import type { Observable } from 'rxjs';

export default class FirestoreService {
    private db = getFirestore(app);

    constructor(public path: string) {        
    }

    public getDocuments(uid: string): Observable<DocumentData[]> {
        const items = collection(this.db, this.path);

        // Query requires an index, see screenshot below
        const q = query(items, where('uid', '==', uid), orderBy('createdAt'));        
        return collectionData(q, { idField: 'id' }).pipe(startWith([]));
    }
    
    public async setDocument<T extends { id: string }>(data: T, options?: SetOptions): Promise<void> {
        const docRef = doc(this.db, this.path, data.id);
        await setDoc(docRef, data, options);
    }

    public async setDocuments<T extends { id: string }>(array: T[], options?: SetOptions): Promise<void> {
        const batch = writeBatch(this.db);
        array.forEach(data => {
            const docRef = doc(this.db, this.path, data.id);
            batch.set(docRef, data, options);
        });
        await batch.commit();
    }
    
    public async updateDocument(data: Partial<unknown>, id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await updateDoc(docRef, data);
    }
    
    public async removeDocument(id: string): Promise<void> {
        const docRef = doc(this.db, this.path, id);
        await deleteDoc(docRef);
    }
}
