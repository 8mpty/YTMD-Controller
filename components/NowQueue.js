import React, { useState, useEffect, useRef, useCallback, memo } from "react";
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
import createApiService from "../services/apiService";

// Separate QueueItem component with memo
const QueueItem = memo(
  ({
    item,
    currentVideoId,
    likedTracks,
    onLikeToggle,
    itemWidth,
    itemHeight,
    styles,
  }) => {
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.currentVideoId === nextProps.currentVideoId &&
      prevProps.likedTracks[
        prevProps.item.playlistPanelVideoRenderer.videoId
      ] ===
        nextProps.likedTracks[
          nextProps.item.playlistPanelVideoRenderer.videoId
        ] &&
      prevProps.item.playlistPanelVideoRenderer.videoId ===
        nextProps.item.playlistPanelVideoRenderer.videoId
    );
  }
);

const NowQueue = ({
  currentVideoId,
  isActive,
  likedTracks,
  onLikeToggle,
  refreshKey,
  dimensions,
}) => {
  const [queue, setQueue] = useState([]);
  const { getBaseUrl } = useApi();
  const baseUrl = getBaseUrl();
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);
  const api = createApiService(baseUrl);

  const ITEM_WIDTH = dimensions.width * 0.2;
  const ITEM_HEIGHT = ITEM_WIDTH * 1;

  const getStyles = (itemWidth, itemHeight) =>
    StyleSheet.create({
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
        width: itemWidth + dimensions.width * 0.05,
      },
      carousel: {
        paddingHorizontal: dimensions.width * 0.05,
        justifyContent: "center",
        alignItems: "center",
      },
      queueItem: {
        alignItems: "center",
        marginHorizontal: dimensions.width * 0.025,
        marginBottom: 135,
      },
      itemContainer: {
        width: itemWidth,
        height: itemHeight,
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
        marginTop: dimensions.height * 0.01,
        alignItems: "center",
      },
      title: {
        color: "#fff",
        fontSize: dimensions.width * 0.016,
        fontWeight: "bold",
        textAlign: "center",
        flexWrap: "wrap",
        maxWidth: itemWidth,
      },
      currentTrackTitle: {
        color: "#ff2c86",
      },
    });

  const styles = getStyles(ITEM_WIDTH, ITEM_HEIGHT);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await api.getQueue();

      setQueue((prevQueue) => {
        const newItems = data.items;

        const existingItemsMap = new Map(
          prevQueue.map((item) => [
            item.playlistPanelVideoRenderer.videoId,
            item,
          ])
        );

        const updatedItems = newItems.map((newItem) => {
          const videoId = newItem.playlistPanelVideoRenderer.videoId;
          const existingItem = existingItemsMap.get(videoId);

          if (
            existingItem &&
            existingItem.playlistPanelVideoRenderer.title.runs[0].text ===
              newItem.playlistPanelVideoRenderer.title.runs[0].text
          ) {
            return existingItem;
          }

          return newItem;
        });

        return updatedItems;
      });
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (isActive || refreshKey) {
      fetchQueue();
    }
  }, [isActive, fetchQueue, refreshKey]);

  useEffect(() => {
    if (isActive && currentVideoId && queue.length > 0) {
      const index = queue.findIndex(
        (item) => item.playlistPanelVideoRenderer.videoId === currentVideoId
      );

      if (index !== -1) {
        if (Platform.OS === "web" && scrollViewRef.current) {
          const scrollPosition = index * (ITEM_WIDTH + dimensions.width * 0.05);
          scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
        } else if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0,
            viewOffset: dimensions.width * 0.05,
          });
        }
      }
    }
  }, [currentVideoId, queue, isActive, ITEM_WIDTH, dimensions.width]);

  const renderItem = useCallback(
    ({ item }) => (
      <QueueItem
        item={item}
        currentVideoId={currentVideoId}
        likedTracks={likedTracks}
        onLikeToggle={onLikeToggle}
        itemWidth={ITEM_WIDTH}
        itemHeight={ITEM_HEIGHT}
        styles={styles}
      />
    ),
    [currentVideoId, likedTracks, onLikeToggle, ITEM_WIDTH, ITEM_HEIGHT, styles]
  );

  const keyExtractor = useCallback(
    (item) =>
      item.playlistPanelVideoRenderer.videoId ||
      Math.random().toString(36).substring(7),
    []
  );

  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_WIDTH + dimensions.width * 0.05,
      offset: (ITEM_WIDTH + dimensions.width * 0.05) * index,
      index,
    }),
    [ITEM_WIDTH, dimensions.width]
  );

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
                {renderItem({ item })}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={queue}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      )}
    </View>
  );
};

export default memo(NowQueue);