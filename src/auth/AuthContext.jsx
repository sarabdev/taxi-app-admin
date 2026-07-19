import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);

function getTokenExpiration(token) {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;

        const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
        const padded = normalized.padEnd(
            Math.ceil(normalized.length / 4) * 4,
            "=",
        );
        const decoded = JSON.parse(window.atob(padded));

        return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearSession = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            clearSession();
            setLoading(false);
            return;
        }

        const expiresAt = getTokenExpiration(token);
        if (expiresAt && expiresAt <= Date.now()) {
            clearSession();
            setLoading(false);
            return;
        }

        try {
            setUser(JSON.parse(storedUser));
        } catch {
            clearSession();
        }

        setLoading(false);
    }, [clearSession]);

    useEffect(() => {
        const handleUnauthorized = () => clearSession();

        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () =>
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, [clearSession]);

    useEffect(() => {
        if (!user) return undefined;

        const token = localStorage.getItem("token");
        const expiresAt = token ? getTokenExpiration(token) : null;
        if (!expiresAt) return undefined;

        const remainingTime = expiresAt - Date.now();
        if (remainingTime <= 0) {
            clearSession();
            return undefined;
        }

        const timeoutId = window.setTimeout(clearSession, remainingTime);
        return () => window.clearTimeout(timeoutId);
    }, [user, clearSession]);

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = clearSession;

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
