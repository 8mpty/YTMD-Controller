import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Dimensions
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
import createApiService from "../services/apiService";
import {
  initDatabase,
  getLikeStatus,
  updateLikeStatus,
} from "../services/DatabaseService";

const TABS = {
  HOME: "home",
  SEARCH: "search",
  NOWPLAYING: "nowplaying",
  LIBRARY: "library",
};

const NO_CONNECTION_SONG_INFO = {
  title: "Please configure your connection first",
  artist: "No connection",
  imageSrc: null,
  videoId: null,
  elapsedSeconds: 0,
  songDuration: 0,
  isPaused: true,
};

export default function PlayerScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [songInfo, setSongInfo] = useState(NO_CONNECTION_SONG_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const { getBaseUrl } = useApi();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [likedTracks, setLikedTracks] = useState({});
  const [refreshKey, setRefreshKey] = useState(0)
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  

  const navigation = useNavigation();
  const baseUrl = getBaseUrl();
  const api = createApiService(baseUrl);
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

  const updateTrackLikeStatus = async (videoId, newStatus, title, imgSrc) => {
    try {
      await updateLikeStatus(videoId, newStatus, title, imgSrc);
      setLikedTracks(prev => ({
        ...prev,
        [videoId]: newStatus
      }));
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const fetchLikeStatus = async (videoId) => {
    try {
      const status = await getLikeStatus(videoId);
      setLikedTracks(prev => ({
        ...prev,
        [videoId]: status
      }));
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };

  const fetchSongInfo = async () => {
    if (!baseUrl) {
      setSongInfo(NO_CONNECTION_SONG_INFO);
      return;
    }

    try {
      const data = await api.getSongInfo();
      if (songInfo?.videoId !== data.videoId) {
        await fetchLikeStatus(data.videoId);
      }
      setSongInfo(data);
    } catch (error) {
      console.error("Error fetching song info:", error);
      setSongInfo(NO_CONNECTION_SONG_INFO);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let interval;

      const startPolling = () => {
        fetchSongInfo();
        if (baseUrl) {
          interval = setInterval(fetchSongInfo, 1000);
        }
      };

      startPolling();

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [baseUrl])
  );

  const handlePlayPause = async () => {
    if (!baseUrl) return;
    try {
      await api.togglePlay();
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handlePrevious = async () => {
    if (!baseUrl) return;
    try {
      await api.previousSong();
    } catch (error) {
      console.error("Error going to previous track:", error);
    }
  };

  const handleNext = async () => {
    if (!baseUrl) return;
    try {
      await api.nextSong();
    } catch (error) {
      console.error("Error going to next track:", error);
    }
  };

  const handleRefresh = async () => {
    await fetchSongInfo();
    if (controlsRef.current) {
      controlsRef.current.fetchInitialStates();
    }
    setRefreshKey(prev => prev + 1);
  };

  const handleSeek = async (seconds) => {
    if (!baseUrl) return;
    try {
      await api.seekTo(seconds);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const NoConnectionContent = () => (
    <View style={styles.noConnectionContainer}>
      <Text style={styles.noConnectionText}>
        Please configure your connection first
      </Text>
      <TouchableOpacity
        style={styles.configureButton}
        onPress={() => navigation.navigate("Setup")}
      >
        <Text style={styles.configureButtonText}>Configure Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        onRefresh={handleRefresh}
        onCollapse={() => setIsCollapsed(true)}
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setDimensions={setDimensions}
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
          <View style={[styles.mainContent, showLyrics && { paddingRight: "32%" }]}>
            {!baseUrl ? (
              <NoConnectionContent />
            ) : (
              <>
                <View style={styles.topSection}>
                  <Image
                    source={
                      songInfo.imageSrc
                        ? { uri: songInfo.imageSrc }
                        : require("../assets/no-connection.png")
                    }
                    style={[styles.artwork, { width: imageSize, height: imageSize }]}
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
                        onPress={() => 
                          updateTrackLikeStatus(
                            songInfo.videoId, 
                            !likedTracks[songInfo.videoId],
                            songInfo.title,
                            songInfo.imageSrc
                          )
                        }
                      >
                        <Ionicons
                          name={likedTracks[songInfo.videoId] ? "heart" : "heart-outline"}
                          size={iconSize}
                          color={likedTracks[songInfo.videoId] ? "#ff4545" : "#666666"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.bottomSection}>
                  <ProgressBar
                    elapsed={songInfo.elapsedSeconds}
                    duration={songInfo.songDuration}
                    onSeek={handleSeek}
                  />
                  <Controls
                    ref={controlsRef}
                    isPaused={songInfo.isPaused}
                    baseUrl={baseUrl}
                    onLyricsToggle={() => setShowLyrics(!showLyrics)}
                    showLyrics={showLyrics}
                  />
                </View>
              </>
            )}
          </View>
          <LyricsPanel isVisible={showLyrics} songInfo={songInfo} />
        </View>
      ) : (
        <>
          {activeTab === TABS.HOME && (
            <View style={styles.placeholderContent}>
              <Clock />
            </View>
          )}

          {activeTab === TABS.SEARCH && (
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderText}>COMING SOON</Text>
            </View>
          )}

          {activeTab === TABS.NOWPLAYING && (
            <View style={styles.placeholderContent}>
              {!baseUrl ? (
                <NoConnectionContent />
              ) : (
                <NowQueue 
                  currentVideoId={songInfo.videoId}
                  isActive={activeTab === TABS.NOWPLAYING}
                  likedTracks={likedTracks}
                  onLikeToggle={updateTrackLikeStatus}
                  refreshKey={refreshKey}
                  dimensions={dimensions}
                />
              )}
            </View>
          )}

          {activeTab === TABS.LIBRARY && (
            <View style={styles.placeholderContent}>
              <Text style={styles.placeholderText}>COMING SOON</Text>
            </View>
          )}
        </>
      )}
      {isCollapsed && (
        <BottomBar
          songInfo={songInfo}
          onExpand={() => setIsCollapsed(false)}
          isLiked={likedTracks[songInfo.videoId] || false}
          onLikeToggle={() => 
            updateTrackLikeStatus(
              songInfo.videoId, 
              !likedTracks[songInfo.videoId],
              songInfo.title,
              songInfo.imageSrc
            )
          }
          onPrevious={handlePrevious}
          onNext={handleNext}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
        />
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
  noConnectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noConnectionText: {
    color: "#666",
    fontSize: 24,
    marginBottom: 20,
  },
  configureButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    minWidth: 150,
    alignItems: "center",
  },
  configureButtonText: {
    color: "#fff",
    fontSize: 16,
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