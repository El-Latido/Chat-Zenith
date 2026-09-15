import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, query, orderBy, limit, limitToLast, getDocs, getCountFromServer, onSnapshot } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { fdb, fStorage } from "./firebase";
import { DBState } from "./types"; 


export const updateUserProfileInFirebase = async (oldUsername: string, newUsername: string, data: any) => {
    if (!fdb) return null;
    
    try {
        

        if (newUsername !== oldUsername) {
            const existsDoc = await getDoc(doc(fdb, 'users', newUsername));
            if (existsDoc.exists()) throw new Error("El usuario ya existe");
            
            const oldUserDocRef = doc(fdb, 'users', oldUsername);
            const oldUserDoc = await getDoc(oldUserDocRef);
            let currentRole = "user";
            
            if (oldUserDoc.exists()) {
                currentRole = oldUserDoc.data().role || "user";
                await setDoc(doc(fdb, 'users', newUsername), { ...data, username: newUsername, role: currentRole });
                await deleteDoc(oldUserDocRef);
            }
            return currentRole;
        } else {
            const docRef = doc(fdb, 'users', oldUsername);
            const docSnap = await getDoc(docRef);
            let currentRole = "user";
            
            if (docSnap.exists()) {
                currentRole = docSnap.data().role || "user";
                await updateDoc(docRef, { ...data });
            } else {
                await setDoc(docRef, { ...data, username: oldUsername, role: currentRole });
            }
            return currentRole;
        }
    } catch (err) {
        console.error("Error al guardar en Firebase:", err);
        throw err;
    }
};

export const updateAiProfileInFirebase = async (aiUsername: string, data: any) => {
    if (!fdb) return;
    try {
        
        await setDoc(doc(fdb, 'users', aiUsername), { ...data, username: aiUsername, role: "admin" }, { merge: true });
    } catch (e) {
        console.error("Error updating AI profile:", e);
    }
};

export const saveMessageToFirebase = async (msg: any) => {
    if (!fdb) return;
    try {
        await addDoc(collection(fdb, 'messages'), msg);
    } catch (e) {
        console.error("Error al guardar mensaje en Firebase:", e);
    }
};
