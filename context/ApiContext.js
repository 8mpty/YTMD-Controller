import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const [apiConfig, setApiConfig] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const saveApiConfig = async (ip, port) => {
    try {
      const config = { ip, port };
      await AsyncStorage.setItem("apiConfig", JSON.stringify(config));
      setApiConfig(config);
      setIsConfigured(true);
      return true;
    } catch (error) {
      console.error("Error saving API config:", error);
      return false;
    }
  };

  const loadApiConfig = async () => {
    try {
      const stored = await AsyncStorage.getItem("apiConfig");
      if (stored) {
        const config = JSON.parse(stored);
        setApiConfig(config);
        setIsConfigured(true);
        return true;
      }
      setIsConfigured(false);
      return false;
    } catch (error) {
      console.error("Error loading API config:", error);
      setIsConfigured(false);
      return false;
    }
  };

  const getBaseUrl = () => {
    if (!apiConfig) return null;
    return `http://${apiConfig.ip}:${apiConfig.port}`;
  };

  const clearApiConfig = async () => {
    try {
      await AsyncStorage.removeItem("apiConfig");
      setApiConfig(null);
      setIsConfigured(false);
    } catch (error) {
      console.error("Error clearing API config:", error);
    }
  };

  return (
    <ApiContext.Provider
      value={{
        apiConfig,
        isConfigured,
        saveApiConfig,
        loadApiConfig,
        getBaseUrl,
        clearApiConfig,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export const useApi = () => useContext(ApiContext);
