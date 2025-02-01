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

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");
const ITEM_WIDTH = viewportWidth * 0.22;
const ITEM_HEIGHT = ITEM_WIDTH * (1 / 1);

const NowQueue = ({ currentVideoId, isActive, likedTracks, onLikeToggle }) => {
  const [queue, setQueue] = useState([]);
  const { getBaseUrl } = useApi();
  const baseUrl = getBaseUrl();
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);

  const fetchQueue = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/queue`);
      const data = await response.json();
      setQueue(data.items);
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }, [baseUrl]);

  // Initial fetch when component becomes active
  useEffect(() => {
    if (isActive) {
      fetchQueue();
    }
  }, [isActive, fetchQueue]);

  // Handle scrolling to current track only when currentVideoId changes
  useEffect(() => {
    if (isActive && currentVideoId && queue.length > 0) {
      const index = queue.findIndex(
        (item) => item.playlistPanelVideoRenderer.videoId === currentVideoId
      );

      if (index !== -1) {
        if (Platform.OS === "web" && scrollViewRef.current) {
          const scrollPosition = index * (ITEM_WIDTH + viewportWidth * 0.05);
          scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        } else if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0,
          });
        }
      }
    }
  }, [currentVideoId, queue, isActive]);

  const renderItem = ({ item, index }) => {
    const videoId = item.playlistPanelVideoRenderer.videoId;
    const isCurrentTrack = videoId === currentVideoId;
    const isLiked = likedTracks[videoId] || false;
    const title = item.playlistPanelVideoRenderer.title.runs[0].text;
    const thumbnails = item.playlistPanelVideoRenderer.thumbnail.thumbnails;
    const imgSrc = thumbnails[thumbnails.length - 1].url;

    return (
      <View style={styles.queueItem}>
        <View
          style={[
            styles.itemContainer,
            isCurrentTrack && styles.currentTrackContainer,
          ]}
        >
          <Image
            source={{ uri: imgSrc }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onLikeToggle(videoId, !isLiked, title, imgSrc)}
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
            {title}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.webCarouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.carousel}
            style={styles.webScrollView}
            scrollEventThrottle={16}
            decelerationRate="normal"
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
});

export default NowQueue;