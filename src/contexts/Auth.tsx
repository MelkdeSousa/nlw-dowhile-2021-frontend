import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";

interface IAuthContextData {
  user: IUser | null;
  signInUrl: string;
  signOut: () => void;
}

interface IUser {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthResponse {
  token: string;
  user: IUser;
}

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContextData);

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=05a726e6c781d93d3142`;

  const signIn = async (githubCode: string) => {
    const response = await api.post<IAuthResponse>("authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;

    localStorage.setItem("@dowhile:token", token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  };

  const signOut = () => {
    setUser(null);
    localStorage.remove("@dowhile:token");
  };

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutGithubCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutGithubCode);

      signIn(githubCode);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<IUser>("user").then(({ data }) => {
        setUser(data);
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
