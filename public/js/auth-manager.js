// Authentication module
import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { appState } from './app-state.js';

class AuthManager {
    constructor() {
        this.provider = new GoogleAuthProvider();
        this.provider.setCustomParameters({
            prompt: 'select_account'
        });

        // Bind form submission handlers
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-form')?.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Bind Google auth buttons
        document.getElementById('google-login-btn')?.addEventListener('click', () => this.handleGoogleAuth());
        document.getElementById('google-signup-btn')?.addEventListener('click', () => this.handleGoogleAuth());
        
        // Bind form toggle buttons
        document.getElementById('show-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms('signup');
        });
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms('login');
        });

        // Bind logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Set persistence to LOCAL
        setPersistence(auth, browserLocalPersistence).catch(console.error);
    }

    toggleForms(showForm) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (showForm === 'signup') {
            loginForm?.classList.add('hidden');
            signupForm?.classList.remove('hidden');
        } else {
            signupForm?.classList.add('hidden');
            loginForm?.classList.remove('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            appState.showError('Please fill in all fields');
            return;
        }

        appState.showLoadingState();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to login. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
            }
            
            appState.showError(errorMessage);
        } finally {
            appState.hideLoadingState();
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('signup-username')?.value;
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;

        if (!username || !email || !password) {
            appState.showError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            appState.showError('Password must be at least 6 characters');
            return;
        }

        appState.showLoadingState();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document
            await setDoc(doc(db, 'users', user.uid), {
                username,
                email: user.email,
                streak: 0,
                lastCheckIn: null,
                checkInHistory: [],
                bio: "",
                profilePicUrl: "",
                createdAt: serverTimestamp()
            });

        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Failed to create account. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak';
                    break;
            }
            
            appState.showError(errorMessage);
        } finally {
            appState.hideLoadingState();
        }
    }

    async handleGoogleAuth() {
        appState.showLoadingState();
        try {
            await signInWithPopup(auth, this.provider);
        } catch (error) {
            console.warn('Popup auth failed:', error);
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                try {
                    await signInWithRedirect(auth, this.provider);
                } catch (redirectError) {
                    console.error('Redirect auth failed:', redirectError);
                    appState.showError('Failed to authenticate with Google. Please try again.');
                }
            } else {
                appState.showError('Failed to authenticate with Google. Please try again.');
            }
        } finally {
            appState.hideLoadingState();
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            appState.navigateToPage('auth');
        } catch (error) {
            console.error('Logout error:', error);
            appState.showError('Failed to logout. Please try again.');
        }
    }
}

export const authManager = new AuthManager();