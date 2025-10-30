// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDViVrJ9agi89g7cG51SVP9ECHDk5YNGoM",
    authDomain: "auraai-472617.firebaseapp.com",
    projectId: "auraai-472617",
    storageBucket: "auraai-472617.appspot.com",
    messagingSenderId: "1077227113610",
    appId: "1:1077227113610:web:846934fd5147f430a07173",
    measurementId: "G-PY62KH8QGE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL by default
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Export initialized instances
export { app, auth, db };

// Auth state management
export function initializeAuth(onAuthSuccess, onAuthFailure) {
    return onAuthStateChanged(auth, async (user) => {
        try {
            if (user) {
                // Get or create user document
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                
                const userData = userDoc.exists() 
                    ? userDoc.data()
                    : {
                        username: user.displayName || 'Zenith User',
                        email: user.email,
                        streak: 0,
                        lastCheckIn: null,
                        checkInHistory: [],
                        bio: "",
                        profilePicUrl: ""
                    };

                if (!userDoc.exists()) {
                    await setDoc(userRef, userData);
                }

                onAuthSuccess(user, userData);
            } else {
                onAuthFailure();
            }
        } catch (error) {
            console.error('Auth state change error:', error);
            onAuthFailure(error);
        }
    });
}

// Google Sign-in with fallback
export async function signInWithGoogle(onStatus) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        onStatus?.('Attempting sign-in...');
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.warn('Popup sign-in failed:', error);
        
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            onStatus?.('Popup blocked, trying redirect...');
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error('Redirect sign-in failed:', redirectError);
                throw redirectError;
            }
        } else {
            throw error;
        }
    }
}