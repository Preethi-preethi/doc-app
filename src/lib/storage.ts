export interface UserProfile {
    profileName: string;
    passwordHash: string; // Storing as plaintext for this mock, but named hash for future-proofing
}

export interface SavedDocument {
    id: string;
    user_id: string; // Map to profileName
    title: string;
    content: string;
    mode: 'product' | 'process';
    is_public: boolean;
    created_at: string;
}

const PROFILES_KEY = 'doc_app_profiles';
const CURRENT_USER_KEY = 'doc_app_current_user';
const DOCUMENTS_KEY = 'doc_app_documents';

export const storage = {
    // --- Profile Methods ---
    getProfiles: (): Record<string, UserProfile> => {
        try {
            const data = localStorage.getItem(PROFILES_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },
    saveProfile: (profile: UserProfile): void => {
        const profiles = storage.getProfiles();
        profiles[profile.profileName] = profile;
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    },
    getProfile: (profileName: string): UserProfile | null => {
        const profiles = storage.getProfiles();
        return profiles[profileName] || null;
    },
    setCurrentUser: (profileName: string | null): void => {
        if (profileName) {
            localStorage.setItem(CURRENT_USER_KEY, profileName);
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    },
    getCurrentUser: (): string | null => {
        return localStorage.getItem(CURRENT_USER_KEY);
    },

    // --- Document Methods ---
    getDocuments: (): Record<string, SavedDocument> => {
        try {
            const data = localStorage.getItem(DOCUMENTS_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },
    saveDocument: (doc: Omit<SavedDocument, 'id' | 'created_at'>): SavedDocument => {
        const documents = storage.getDocuments();

        // Generate a simple ID
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10);

        const newDoc: SavedDocument = {
            ...doc,
            id,
            created_at: new Date().toISOString()
        };

        documents[id] = newDoc;
        localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
        return newDoc;
    },
    getDocument: (id: string): SavedDocument | null => {
        const documents = storage.getDocuments();
        return documents[id] || null;
    },
    updateDocumentVisibility: (id: string, is_public: boolean): void => {
        const documents = storage.getDocuments();
        if (documents[id]) {
            documents[id].is_public = is_public;
            localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
        }
    }
};
