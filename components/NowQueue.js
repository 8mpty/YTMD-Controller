import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../context/ApiContext";
import { getLikeStatus, updateLikeStatus } from "../services/DatabaseService";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");
const ITEM_WIDTH = viewportWidth * 0.22;
const ITEM_HEIGHT = ITEM_WIDTH * (1 / 1);

const NowQueue = ({ currentVideoId }) => {
  const [queue, setQueue] = useState([]);
  const [likedVideos, setLikedVideos] = useState({});
  const { getBaseUrl } = useApi();
  const baseUrl = getBaseUrl();
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);

  const fetchQueue = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/queue`);
      const data = await response.json();

      // Fetch like statuses in parallel
      const likeStatuses = await Promise.all(
        data.items.map(async (item) => {
          const videoId = item.playlistPanelVideoRenderer.videoId;
          try {
            const likeStatus = await getLikeStatus(videoId);
            return [videoId, likeStatus];
          } catch (error) {
            console.error(`Error fetching like status for ${videoId}:`, error);
            return [videoId, false];
          }
        })
      );

      // More efficient state update
      setQueue(data.items);
      setLikedVideos(Object.fromEntries(likeStatuses));
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (currentVideoId && queue.length > 0) {
      const index = queue.findIndex(
        (item) => item.playlistPanelVideoRenderer.videoId === currentVideoId
      );

      if (index !== -1) {
        if (Platform.OS === "web") {
          const scrollPosition = index * (ITEM_WIDTH + viewportWidth * 0.05);
          setScrollX(scrollPosition);
        } else if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0,
          });
        }
      }
    }
  }, [currentVideoId, queue]);

  const handleLikeToggle = useCallback(
    async (videoId) => {
      try {
        const currentStatus = likedVideos[videoId] || false;
        const newStatus = !currentStatus;

        await updateLikeStatus(videoId, newStatus);

        setLikedVideos((prev) => ({
          ...prev,
          [videoId]: newStatus,
        }));
      } catch (error) {
        console.error(`Error toggling like for ${videoId}:`, error);
      }
    },
    [likedVideos]
  );

  const renderItem = ({ item, index }) => {
    const videoId = item.playlistPanelVideoRenderer.videoId;
    const isCurrentTrack = videoId === currentVideoId;
    const isLiked = likedVideos[videoId] || false;

    return (
      <View style={styles.queueItem}>
        <View
          style={[
            styles.itemContainer,
            isCurrentTrack && styles.currentTrackContainer,
          ]}
        >
          <Image
            source={{
              uri: item.playlistPanelVideoRenderer.thumbnail.thumbnails[1].url,
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLikeToggle(videoId)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#ff4545" : "#fff"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.trackInfo}>
          <Text
            style={[styles.title, isCurrentTrack && styles.currentTrackTitle]}
            numberOfLines={1}
          >
            {item.playlistPanelVideoRenderer.title.runs[0].text}
          </Text>
        </View>
      </View>
    );
  };

  const handleScroll = (event) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.webCarouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.carousel}
            decelerationRate="fast"
            style={styles.webScrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentOffset={{ x: scrollX, y: 0 }}
          >
            {queue.map((item, index) => (
              <View
                key={item.playlistPanelVideoRenderer.videoId || index}
                style={styles.webItemWrapper}
              >
                {renderItem({ item, index })}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={queue}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.playlistPanelVideoRenderer.videoId ||
            Math.random().toString(36).substring(7)
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH + viewportWidth * 0.05,
            offset: (ITEM_WIDTH + viewportWidth * 0.05) * index,
            index,
          })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    width: "100%",
  },
  webCarouselContainer: {
    width: "100%",
    overflow: "hidden",
  },
  webScrollView: {
    width: "100%",
  },
  webItemWrapper: {
    width: ITEM_WIDTH + viewportWidth * 0.05,
  },
  carousel: {
    paddingHorizontal: viewportWidth * 0.05,
    justifyContent: "center",
    alignItems: "center",
  },
  queueItem: {
    alignItems: "center",
    marginHorizontal: viewportWidth * 0.025,
    marginBottom: 100,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderWidth: 0,
    borderColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  currentTrackContainer: {
    borderColor: "#ff2c86",
    borderWidth: 4,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  trackInfo: {
    marginTop: viewportHeight * 0.01,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: viewportWidth * 0.016,
    fontWeight: "bold",
    textAlign: "center",
    flexWrap: "wrap",
    maxWidth: ITEM_WIDTH,
  },
  currentTrackTitle: {
    color: "#ff2c86",
  },
  index: {
    color: "#ccc",
    fontSize: viewportWidth * 0.035,
  },
});

export default NowQueue;
