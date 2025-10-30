// App initialization and auth handling
import { auth, db, initializeAuth } from './firebase.js';
import { getDoc, doc, setDoc } from 'firebase/firestore';

class AppState {
    static instance = null;
    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }
        AppState.instance = this;
        this.currentUser = null;
        this.currentPage = null;
        this.unsubscribeAuth = null;
        this.authLoading = false;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        this.showLoadingState();
        try {
            // Initialize Firebase auth listener
            this.unsubscribeAuth = initializeAuth(
                this.handleAuthSuccess.bind(this),
                this.handleAuthFailure.bind(this)
            );

            // Check for redirect result
            const result = await getRedirectResult(auth);
            if (result) {
                await this.handleSignInResult(result);
            }

            this.initialized = true;
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError('Failed to initialize app. Please refresh and try again.');
        } finally {
            this.hideLoadingState();
        }
    }

    async handleSignInResult(result) {
        try {
            const user = result.user;
            await this.createOrUpdateUserDoc(user);
            this.navigateToPage('chat');
        } catch (error) {
            console.error('Sign-in result handling error:', error);
            this.showError('Failed to complete sign-in. Please try again.');
        }
    }

    async createOrUpdateUserDoc(user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                username: user.displayName || 'Zenith User',
                email: user.email,
                streak: 0,
                lastCheckIn: null,
                checkInHistory: [],
                bio: "",
                profilePicUrl: user.photoURL || "",
                createdAt: serverTimestamp()
            });
        }
    }

    async handleAuthSuccess(user, userData) {
        this.currentUser = { ...user, ...userData };
        document.getElementById('welcome-user').textContent = `Welcome, ${userData.username}!`;
        this.navigateToPage('chat');
        this.hideLoadingState();
    }

    handleAuthFailure(error = null) {
        this.currentUser = null;
        this.navigateToPage('auth');
        if (error) {
            console.error('Auth failure:', error);
            this.showError('Authentication failed. Please try again.');
        }
        this.hideLoadingState();
    }

    navigateToPage(pageId) {
        if (this.currentPage === pageId) return;

        const pages = {
            auth: document.getElementById('auth-page'),
            chat: document.getElementById('main-app-page'),
            streaks: document.getElementById('streaks-page'),
            breathe: document.getElementById('breathe-page'),
            community: document.getElementById('community-page'),
            friends: document.getElementById('friends-page'),
            profile: document.getElementById('profile-page')
        };

        // Hide all pages
        Object.values(pages).forEach(page => {
            if (page) page.classList.add('hidden');
        });

        // Show target page
        const targetPage = pages[pageId];
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = pageId;
            
            // Additional page-specific initialization
            if (pageId === 'chat') {
                document.getElementById('chat-container').scrollTop = document.getElementById('chat-container').scrollHeight;
            }
        }
    }

    showLoadingState() {
        if (!this.authLoading) {
            this.authLoading = true;
            // Add loading indicator to auth page
            const authPage = document.getElementById('auth-page');
            if (authPage) {
                const loader = document.createElement('div');
                loader.id = 'auth-loader';
                loader.className = 'absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50';
                loader.innerHTML = '<div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div></div>';
                authPage.appendChild(loader);
            }
        }
    }

    hideLoadingState() {
        this.authLoading = false;
        const loader = document.getElementById('auth-loader');
        if (loader) {
            loader.remove();
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => errorDiv.classList.add('hidden'), 5000);
        }
    }

    cleanup() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
    }
}

export const appState = new AppState();
window.appState = appState; // For debugging

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    appState.initialize();
});