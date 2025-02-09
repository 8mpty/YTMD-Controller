import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useApi } from "../context/ApiContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SettingsModal from "./SettingsModal";
import DatabaseModal from "./DatabaseModal";
import { clearDatabase } from "../services/DatabaseService";
import VideoInformationModal from "./VideoInformationModal";
import AppInfoModal from "./AppInfoModal";

const TABS = {
  HOME: "home",
  SEARCH: "search",
  NOWPLAYING: "nowplaying",
  LIBRARY: "library",
};

export default function TopBar({
  onRefresh,
  onCollapse,
  isCollapsed,
  setActiveTab,
  activeTab,
  setDimensions,
}) {
  const navigation = useNavigation();
  const { clearApiConfig } = useApi();
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [showVideoInfo, setShowVideoInfo] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleRefresh = () => {
    const newDimensions = {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    };
    setDimensions(newDimensions);
    onRefresh();
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
            name={
              isCollapsed && activeTab === TABS.HOME ? "home" : "home-outline"
            }
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
            setActiveTab(TABS.SEARCH);
            onCollapse();
          }}
          style={[
            styles.tabButton,
            isCollapsed &&
              activeTab === TABS.SEARCH &&
              styles.activeTabContainer,
          ]}
        >
          <Ionicons
            name={
              isCollapsed && activeTab === TABS.SEARCH
                ? "search"
                : "search-outline"
            }
            size={24}
            color="white"
          />
          {isCollapsed && activeTab === TABS.SEARCH && (
            <>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                  placeholder="Search"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  multiline={false}
                  numberOfLines={1}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setSearchQuery("")}
                  >
                    <Ionicons name="close-circle" size={16} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.underline} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTab(TABS.NOWPLAYING);
            onCollapse();
          }}
          style={[
            styles.tabButton,
            isCollapsed &&
              activeTab === TABS.NOWPLAYING &&
              styles.activeTabContainer,
          ]}
        >
          <Ionicons
            name={
              isCollapsed && activeTab === TABS.NOWPLAYING
                ? "musical-notes"
                : "musical-notes-outline"
            }
            size={24}
            color="white"
          />
          {isCollapsed && activeTab === TABS.NOWPLAYING && (
            <>
              <Text style={styles.tabText}>Now Playing</Text>
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
            name={
              isCollapsed && activeTab === TABS.LIBRARY
                ? "library"
                : "library-outline"
            }
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
        <TouchableOpacity onPress={handleRefresh} style={styles.button}>
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
        onViewAppInfo={() => {
          setShowSettings(false);
          setShowAppInfo(true);
        }}
      />

      <DatabaseModal
        visible={showDatabase}
        onClose={() => setShowDatabase(false)}
        onClearDatabase={handleClearDatabase}
      />

      <AppInfoModal
        visible={showAppInfo}
        onClose={() => setShowAppInfo(false)}
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
    padding: 8,
    gap: 10,
  },
  activeTabContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabText: {
    color: "white",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: 140, // Fixed width
  },
  searchInput: {
    color: "white",
    fontSize: 14,
    width: 140, // Match container width
    paddingVertical: 4,
    paddingRight: 24,
  },
  clearButton: {
    position: "absolute",
    right: 0,
    padding: 4,
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
