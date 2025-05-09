import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, NavLink, HashRouter } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import FieldsPage from "./pages/fieldsPage";
import FillsPage from "./pages/fillsPage";
import { ToastContainer } from "react-toastify";

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const ThemeToggle: React.FC = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("ThemeToggle must be used within a ThemeProvider");
  }
  const { theme, toggleTheme } = context;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-800 transition-colors duration-200">
          <NavigationMenu className="bg-white dark:bg-neutral-900 shadow p-4 w-full max-w-full">
            <div className="flex justify-between items-center w-full max-w-full mx-auto">
              <NavigationMenuList className="flex space-x-4 items-center">
                <NavigationMenuItem>
                  <NavLink
                    to="/campos"
                    className={({ isActive }: { isActive: boolean }) =>
                      `${navigationMenuTriggerStyle()} ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`
                    }
                  >
                    Campos
                  </NavLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavLink
                    to="/preenchimentos"
                    className={({ isActive }: { isActive: boolean }) =>
                      `${navigationMenuTriggerStyle()} ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`
                    }
                  >
                    Preenchimentos
                  </NavLink>
                </NavigationMenuItem>
              </NavigationMenuList>
              <NavigationMenuItem>
                <ThemeToggle />
              </NavigationMenuItem>
            </div>
          </NavigationMenu>
          <main className="p-6 text-gray-900 dark:text-gray-100">
            <Routes>
              <Route path="/campos" element={<FieldsPage />} />
              <Route path="/preenchimentos" element={<FillsPage />} />
              <Route index element={<FieldsPage />} />
            </Routes>
          </main>
        </div>
            <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
