import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApi } from "../context/ApiContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsModal from "./SettingsModal";
import DatabaseModal from "./DatabaseModal";
import { clearDatabase } from "../services/DatabaseService";
import VideoInformationModal from "./VideoInformationModal";

const TABS = {
  HOME: "home",
  LIBRARY: "library",
};

export default function TopBar({ onRefresh, onCollapse, isCollapsed }) {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
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
      <View style={styles.leftButtons}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab(TABS.HOME);
            onCollapse();
          }}
          style={[
            styles.tabButton,
            isCollapsed && activeTab === TABS.HOME && styles.activeTabContainer,
          ]}
        >
          <Ionicons
            name={activeTab === TABS.HOME ? "home" : "home-outline"}
            size={24}
            color="white"
          />
          {isCollapsed && activeTab === TABS.HOME && (
            <>
              <Text style={styles.tabText}>Home</Text>
              <View style={styles.underline} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTab(TABS.LIBRARY);
            onCollapse();
          }}
          style={[
            styles.tabButton,
            isCollapsed &&
              activeTab === TABS.LIBRARY &&
              styles.activeTabContainer,
          ]}
        >
          <Ionicons
            name={activeTab === TABS.LIBRARY ? "library" : "library-outline"}
            size={24}
            color="white"
          />
          {isCollapsed && activeTab === TABS.LIBRARY && (
            <>
              <Text style={styles.tabText}>Library</Text>
              <View style={styles.underline} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.rightButtons}>
        <TouchableOpacity
          onPress={() => setShowVideoInfo(true)}
          style={styles.button}
        >
          <Ionicons name="bug-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefresh} style={styles.button}>
          <Ionicons name="refresh-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowSettings(true)}
          style={styles.button}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <VideoInformationModal
        visible={showVideoInfo}
        onClose={() => setShowVideoInfo(false)}
      />

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
  leftButtons: {
    flexDirection: "row",
    gap: 10,
  },
  rightButtons: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    padding: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#BBB",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    gap: 8,
  },
  activeTabContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    color: "white",
    fontSize: 14,
  },
  underline: {
    position: "absolute",
    bottom: -4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#ff2c86",
  },
});
