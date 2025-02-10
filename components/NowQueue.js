import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "../context/ApiContext";
import createApiService from "../services/apiService";
import PlaylistModal from "./PlaylistModal";
import { getPlaylistsContainingTrack } from "../services/PlayListDatabaseService";

const createQueueItemStyles = (itemWidth, itemHeight, dimensions) =>
  StyleSheet.create({
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
    currentTrackContainer: {
      borderColor: "#ff2c86",
      borderWidth: 4,
    },
    addToPlaylist: {
      position: "absolute",
      top: 10,
      left: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
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

const QueueItem = memo(
  ({
    item,
    index,
    currentVideoId,
    likedTracks,
    onLikeToggle,
    onTrackSelect,
    onPlaylistAdd,
    itemWidth,
    itemHeight,
    dimensions,
  }) => {
    const [isInPlaylist, setIsInPlaylist] = useState(false);
    const { videoId, title, imgSrc } = useMemo(
      () => ({
        videoId: item.playlistPanelVideoRenderer.videoId,
        title: item.playlistPanelVideoRenderer.title.runs[0].text,
        imgSrc:
          item.playlistPanelVideoRenderer.thumbnail.thumbnails.slice(-1)[0].url,
      }),
      [item]
    );

    const isCurrentTrack = videoId === currentVideoId;
    const isLiked = likedTracks[videoId] || false;

    const styles = useMemo(
      () => createQueueItemStyles(itemWidth, itemHeight, dimensions),
      [itemWidth, itemHeight, dimensions]
    );

    const handlePress = useCallback(() => {
      onTrackSelect(index);
    }, [index, onTrackSelect]);

    const handleLikeToggle = useCallback(() => {
      onLikeToggle(videoId, !isLiked, title, imgSrc);
    }, [videoId, isLiked, title, imgSrc, onLikeToggle]);

    const handlePlaylistAdd = useCallback(() => {
      onPlaylistAdd({ videoId, title, imgSrc });
    }, [videoId, title, imgSrc, onPlaylistAdd]);

    useEffect(() => {
      const checkPlaylistStatus = async () => {
        try {
          const containingPlaylists = await getPlaylistsContainingTrack(videoId);
          setIsInPlaylist(containingPlaylists.length > 0);
        } catch (error) {
          console.error("Error checking playlist status:", error);
        }
      };
      
      checkPlaylistStatus();
    }, [videoId]);

    return (
      <View style={styles.queueItem}>
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.itemContainer,
            isCurrentTrack && styles.currentTrackContainer,
          ]}
        >
          <Image
            source={{ uri: imgSrc }}
            style={styles.thumbnail}
            resizeMode="cover"
            loading="lazy"
            defaultSource={Platform.select({
              web: {
                uri: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
              },
              default: null,
            })}
          />

          {/* ADD TO PLAYLIST BUTTON, IT WILL OPEN A MODAL FIRST */}
          <TouchableOpacity
            style={styles.addToPlaylist}
            onPress={handlePlaylistAdd}
          >
            <Ionicons 
              name={isInPlaylist ? "bookmarks" : "bookmarks-outline"} 
              size={18} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLikeToggle}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#ff4545" : "#fff"}
            />
          </TouchableOpacity>
        </TouchableOpacity>
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
      prevProps.index === nextProps.index &&
      prevProps.itemWidth === nextProps.itemWidth &&
      prevProps.itemHeight === nextProps.itemHeight &&
      prevProps.item.playlistPanelVideoRenderer.videoId ===
        nextProps.item.playlistPanelVideoRenderer.videoId
    );
  }
);

const NowQueue = memo(
  ({
    currentVideoId,
    isActive,
    likedTracks,
    onLikeToggle,
    refreshKey,
    dimensions,
  }) => {
    const [queue, setQueue] = useState([]);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const { getBaseUrl } = useApi();
    const baseUrl = getBaseUrl();
    const scrollRef = useRef(null);
    const api = useMemo(() => createApiService(baseUrl), [baseUrl]);

    const ITEM_WIDTH = dimensions.width * 0.2;
    const ITEM_HEIGHT = ITEM_WIDTH;

    const styles = useMemo(
      () =>
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
          carousel: {
            paddingHorizontal: dimensions.width * 0.05,
            justifyContent: "center",
            alignItems: "center",
          },
          webItemWrapper: {
            width: ITEM_WIDTH + dimensions.width * 0.05,
          },
        }),
      [dimensions.width, ITEM_WIDTH]
    );

    const handleTrackSelect = useCallback(
      async (index) => {
        try {
          await api.changeActiveSongInQueue(index);
        } catch (error) {
          console.error("Error changing active song:", error);
        }
      },
      [api]
    );

    const handlePlaylistAdd = useCallback((track) => {
      setSelectedTrack(track);
      setShowPlaylistModal(true);
    }, []);

    const fetchQueue = useCallback(async () => {
      try {
        const data = await api.getQueue();
        setQueue((prevQueue) => {
          if (JSON.stringify(prevQueue) === JSON.stringify(data.items)) {
            return prevQueue;
          }
          return data.items;
        });
      } catch (error) {
        console.error("Error fetching queue:", error);
      }
    }, [api]);

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
          const scrollPosition = index * (ITEM_WIDTH + dimensions.width * 0.05);
          if (scrollRef.current) {
            if (Platform.OS === "web") {
              scrollRef.current.scrollTo({ x: scrollPosition, animated: true });
            } else {
              scrollRef.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0,
                viewOffset: dimensions.width * 0.05,
              });
            }
          }
        }
      }
    }, [currentVideoId, queue, isActive, ITEM_WIDTH, dimensions.width]);

    const renderItem = useCallback(
      ({ item, index }) => (
        <QueueItem
          item={item}
          index={index}
          currentVideoId={currentVideoId}
          likedTracks={likedTracks}
          onLikeToggle={onLikeToggle}
          onTrackSelect={handleTrackSelect}
          onPlaylistAdd={handlePlaylistAdd}
          itemWidth={ITEM_WIDTH}
          itemHeight={ITEM_HEIGHT}
          dimensions={dimensions}
        />
      ),
      [
        currentVideoId,
        likedTracks,
        onLikeToggle,
        handleTrackSelect,
        handlePlaylistAdd,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        dimensions,
      ]
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

    const content =
      Platform.OS === "web" ? (
        <View style={styles.webCarouselContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.carousel}
            style={styles.webScrollView}
            scrollEventThrottle={16}
            decelerationRate="normal"
          >
            {queue.map((item, index) => (
              <View key={keyExtractor(item)} style={styles.webItemWrapper}>
                {renderItem({ item, index })}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <FlatList
          ref={scrollRef}
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
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
      );

    return (
      <View style={styles.container}>
        {content}
        <PlaylistModal
          visible={showPlaylistModal}
          onClose={() => {
            setShowPlaylistModal(false);
            setSelectedTrack(null);
          }}
          track={selectedTrack}
        />
      </View>
    );
  }
);

export default NowQueue;
