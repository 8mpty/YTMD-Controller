import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApi } from "../context/ApiContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsModal from "./SettingsModal";
import DatabaseModal from "./DatabaseModal";
import { clearDatabase } from "../services/DatabaseService";
import VideoInformationModal from "./VideoInformationModal";

export default function TopBar({ onRefresh, onCollapse }) {
  const navigation = useNavigation();
  const { clearApiConfig } = useApi();
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [showVideoInfo, setShowVideoInfo] = useState(false); 

  const handleConfigureIP = async () => {
    setShowSettings(false);
    await clearApiConfig();
    navigation.replace("Setup");
  };

  const handleClearDatabase = async () => {
    try {
      await clearDatabase();
    } catch (error) {
      console.error("Error clearing database:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 10),
          paddingRight: Math.max(insets.right, 15),
          paddingLeft: Math.max(insets.left, 15),
        },
      ]}
    >
      <TouchableOpacity onPress={onCollapse} style={styles.button}>
        <Ionicons name="home-outline" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.rightButtons}>
        <TouchableOpacity onPress={() => setShowVideoInfo(true)} style={styles.button}>
          <Ionicons name="bug-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefresh} style={styles.button}>
          <Ionicons name="refresh-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.button}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <VideoInformationModal visible={showVideoInfo} onClose={() => setShowVideoInfo(false)} />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigureIP={handleConfigureIP}
        onManageDatabase={() => {
          setShowSettings(false);
          setShowDatabase(true);
        }}
        onViewAppInfo={() => {}}
      />

      <DatabaseModal
        visible={showDatabase}
        onClose={() => setShowDatabase(false)}
        onClearDatabase={handleClearDatabase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingBottom: 10,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 15,
  },
  button: {
    padding: 5,
  },
});
