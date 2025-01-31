import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Controls from "../components/Controls";
import ProgressBar from "../components/ProgressBar";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import LyricsPanel from "../components/LyricsPanel";
import Clock from "../components/DisplayClock";
import NowQueue from "../components/NowQueue";
import { useApi } from "../context/ApiContext";
import { Ionicons } from "@expo/vector-icons";
import {
  initDatabase,
  getLikeStatus,
  updateLikeStatus,
} from "../services/DatabaseService";

const TABS = {
  HOME: "home",
  NOWPLAYING: "nowplaying",
  LIBRARY: "library",
};

export default function PlayerScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [songInfo, setSongInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const { getBaseUrl, clearApiConfig } = useApi();
  const [isLiked, setIsLiked] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.HOME);

  const navigation = useNavigation();
  const baseUrl = getBaseUrl();
  const insets = useSafeAreaInsets();
  const controlsRef = React.useRef();

  const imageSize = Math.min(screenHeight * 0.5, screenWidth * 0.3);
  const titleSize = Math.min(screenWidth * 0.03, 40);
  const artistSize = Math.min(screenWidth * 0.018, 32);
  const iconSize = Math.min(screenWidth * 0.03, 32);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error("Error setting up database:", error);
      }
    };
    setupDatabase();
  }, []);

  const fetchSongInfo = async () => {
    if (!baseUrl) {
      setError("No API configuration found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/song`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (songInfo?.videoId !== data.videoId) {
        await fetchLikeStatus(data.videoId);
      }

      setSongInfo(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching song info:", error);
      setError(
        "Failed to connect to the server. Please check your connection settings."
      );

      Alert.alert(
        "Connection Error",
        "Failed to connect to the server. Would you like to reconfigure the connection?",
        [
          {
            text: "Try Again",
            onPress: () => fetchSongInfo(),
            style: "cancel",
          },
          {
            text: "Reconfigure",
            onPress: async () => {
              await clearApiConfig();
              navigation.replace("Setup");
            },
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    try {
      await fetch(`${baseUrl}/api/v1/toggle-play`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handlePrevious = async () => {
    try {
      await fetch(`${baseUrl}/api/v1/previous`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error going to previous track:", error);
    }
  };

  const handleNext = async () => {
    try {
      await fetch(`${baseUrl}/api/v1/next`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error going to next track:", error);
    }
  };

  const fetchLikeStatus = async (videoId) => {
    try {
      const status = await getLikeStatus(videoId);
      setIsLiked(status);
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };

  const handleLikeToggle = async () => {
    if (songInfo?.videoId) {
      const newStatus = !isLiked;
      try {
        await updateLikeStatus(songInfo.videoId, newStatus);
        setIsLiked(newStatus);
      } catch (error) {
        console.error("Error updating like status:", error);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      let interval;

      const startPolling = () => {
        fetchSongInfo();
        interval = setInterval(fetchSongInfo, 1000);
      };

      startPolling();

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [baseUrl])
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.centered,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSongInfo}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.retryButton]}
            onPress={async () => {
              await clearApiConfig();
              navigation.replace("Setup");
            }}
          >
            <Text style={styles.retryText}>Change IP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!songInfo) {
    return (
      <View
        style={[
          styles.centered,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <Text style={styles.errorText}>No song information available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar
        onRefresh={() => {
          fetchSongInfo();
          if (controlsRef.current) {
            controlsRef.current.fetchInitialStates();
          }
        }}
        onCollapse={() => setIsCollapsed(true)}
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {!isCollapsed ? (
        <View
          style={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 10),
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: Math.max(insets.left, 20),
              paddingRight: Math.max(insets.right, showLyrics ? 0 : 20),
            },
          ]}
        >
          <View
            style={[styles.mainContent, showLyrics && { paddingRight: "32%" }]}
          >
            <View style={styles.topSection}>
              <Image
                source={{ uri: songInfo.imageSrc }}
                style={[
                  styles.artwork,
                  {
                    width: imageSize,
                    height: imageSize,
                  },
                ]}
              />
              <View style={[styles.info, { paddingRight: screenWidth * 0.1 }]}>
                <Text
                  style={[styles.title, { fontSize: titleSize }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {songInfo.title}
                </Text>
                <Text
                  style={[styles.artist, { fontSize: artistSize }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {songInfo.artist}
                </Text>
                <View style={styles.ratingContainer}>
                  <TouchableOpacity
                    style={styles.ratingButton}
                    onPress={handleLikeToggle}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={iconSize}
                      color={isLiked ? "#ff4545" : "#666666"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.bottomSection}>
              <ProgressBar
                elapsed={songInfo.elapsedSeconds}
                duration={songInfo.songDuration}
              />
              <Controls
                ref={controlsRef}
                isPaused={songInfo.isPaused}
                baseUrl={baseUrl}
                onLyricsToggle={() => setShowLyrics(!showLyrics)}
                showLyrics={showLyrics}
              />
            </View>
          </View>
          <LyricsPanel isVisible={showLyrics} songInfo={songInfo} />
        </View>
      ) : null}
      {isCollapsed && (
        <>
          {activeTab === TABS.HOME && (
            <View style={styles.placeholderContent}>
              <Clock />
            </View>
          )}

          {activeTab === TABS.NOWPLAYING && (
            <View style={styles.placeholderContent}>
              <NowQueue currentVideoId={songInfo.videoId} />
            </View>
          )}

          {activeTab === TABS.LIBRARY && (
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderText}>COMING SOON?</Text>
            </View>
          )}

          <BottomBar
            songInfo={songInfo}
            onExpand={() => setIsCollapsed(false)}
            isLiked={isLiked}
            onLikeToggle={handleLikeToggle}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onPlayPause={handlePlayPause}
            baseUrl={baseUrl}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    position: "relative",
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  artwork: {
    borderRadius: 8,
    margin: 15,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
  },
  artist: {
    color: "#D3D3D3",
    marginBottom: 5,
  },
  bottomSection: {
    width: "100%",
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  errorButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  ratingButton: {
    padding: 5,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 100,
  },
});
