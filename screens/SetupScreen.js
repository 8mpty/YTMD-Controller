import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useApi } from "../context/ApiContext";

export default function SetupScreen({ navigation }) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const { saveApiConfig, loadApiConfig } = useApi();

  useEffect(() => {
    checkExistingConfig();
  }, []);

  const checkExistingConfig = async () => {
    const hasConfig = await loadApiConfig();
    if (hasConfig) {
      navigation.replace("Player");
    }
  };

  const testConnection = async (baseUrl) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/api/v1/song`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      return true;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Connection timed out");
      }
      throw error;
    }
  };

  const handleConnect = async () => {
    if (!ip || !port) {
      setError("Please enter both IP address and port");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      const baseUrl = `http://${ip}:${port}`;
      await testConnection(baseUrl);
      await saveApiConfig(ip, port);
      navigation.replace("Player");
    } catch (error) {
      setError(
        `Connection failed: ${error.message}. Please check your details and try again.`
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Connection</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholderTextColor="#fff"
        placeholder="Desktop IP"
        value={ip}
        onChangeText={setIp}
        editable={!isConnecting}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#fff"
        placeholder="Port"
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
        editable={!isConnecting}
      />
      <TouchableOpacity
        style={[styles.button, isConnecting && styles.buttonDisabled]}
        onPress={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connect</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: "#fff",
    backgroundColor: "#111",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    height: 45,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 20,
    textAlign: "center",
  },
});
