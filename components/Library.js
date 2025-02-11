import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getAllPlaylists,
  deletePlaylist,
  removeTrackFromPlaylist,
} from "../services/PlayListDatabaseService";
import PlaylistModal from "./PlaylistModal";
import { useApi } from "../context/ApiContext";
import createApiService from "../services/apiService";

// Separate component for playlist item to prevent unnecessary re-renders
const PlaylistItem = React.memo(
  ({ playlist, isSelected, onSelect, onDelete }) => (
    <TouchableOpacity
      style={[styles.playlistItem, isSelected && styles.selectedPlaylist]}
      onPress={() => onSelect(playlist)}
    >
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.trackCount}>{playlist.tracks.length} tracks</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(playlist.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4545" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
);

// Separate component for track item
const TrackItem = React.memo(({ track, onRemove, onPlay }) => (
  <TouchableOpacity
    style={styles.trackItem}
    onPress={() => onPlay(track)} // Add click handler for the whole track item
  >
    <Image source={{ uri: track.imgSrc }} style={styles.trackImage} />
    <View style={styles.trackInfo}>
      <Text style={styles.trackTitle}>{track.title}</Text>
      <Text style={styles.addedDate}>
        Added: {new Date(track.added_date).toLocaleDateString()}
      </Text>
    </View>
    <TouchableOpacity
      style={styles.removeButton}
      onPress={(e) => {
        e.stopPropagation(); // Prevent triggering the parent's onPress
        onRemove(track.videoId);
      }}
    >
      <Ionicons name="remove-circle-outline" size={24} color="#ff4545" />
    </TouchableOpacity>
  </TouchableOpacity>
));

// Constants for delay and error messages
const QUEUE_DELAY = 100;
const ERROR_MESSAGES = {
  DELETE_PLAYLIST: "Failed to delete playlist",
  REMOVE_TRACK: "Failed to remove track from playlist",
  PLAY_PLAYLIST: "Failed to play playlist",
};

export default function Library() {
  const { getBaseUrl } = useApi();
  const api = useMemo(() => createApiService(getBaseUrl()), [getBaseUrl]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const insets = useSafeAreaInsets();

  const loadPlaylists = useCallback(async () => {
    try {
      const allPlaylists = await getAllPlaylists();
      setPlaylists(allPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleDeletePlaylist = useCallback(
    async (playlistId) => {
      Alert.alert(
        "Delete Playlist",
        "Are you sure you want to delete this playlist?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deletePlaylist(playlistId);
                await loadPlaylists();
                if (selectedPlaylist?.id === playlistId) {
                  setSelectedPlaylist(null);
                }
              } catch (error) {
                console.error("Error deleting playlist:", error);
                Alert.alert("Error", ERROR_MESSAGES.DELETE_PLAYLIST);
              }
            },
          },
        ]
      );
    },
    [loadPlaylists, selectedPlaylist]
  );

  const handlePlayFromTrack = useCallback(
    async (selectedTrack) => {
      if (!selectedPlaylist?.tracks.length) return;
      try {
        const trackIndex = selectedPlaylist.tracks.findIndex(
          (track) => track.videoId === selectedTrack.videoId
        );
        if (trackIndex === -1) return;
        await api.clearQueue();

        // Create an array of promises for adding tracks
        const addTrackPromises = selectedPlaylist.tracks.map(
          (track, index) =>
            new Promise((resolve) =>
              setTimeout(async () => {
                try {
                  await api.addSongToQueue(track.videoId, "INSERT_AT_END");
                  resolve();
                } catch (error) {
                  console.error(`Error adding track ${track.videoId}:`, error);
                  resolve();
                }
              }, index * QUEUE_DELAY)
            )
        );
        await Promise.all(addTrackPromises);

        // Delay
        await new Promise((resolve) => setTimeout(resolve, QUEUE_DELAY));

        await api.changeActiveSongInQueue(trackIndex);
      } catch (error) {
        console.error("Error playing track:", error);
        Alert.alert("Error", ERROR_MESSAGES.PLAY_PLAYLIST);
      }
    },
    [selectedPlaylist, api]
  );

  const handleRemoveTrack = useCallback(
    async (videoId) => {
      if (!selectedPlaylist) return;

      try {
        await removeTrackFromPlaylist(selectedPlaylist.id, videoId);
        await loadPlaylists();
        const updatedPlaylist = playlists.find(
          (p) => p.id === selectedPlaylist.id
        );
        setSelectedPlaylist(updatedPlaylist);
      } catch (error) {
        console.error("Error removing track:", error);
        Alert.alert("Error", ERROR_MESSAGES.REMOVE_TRACK);
      }
    },
    [selectedPlaylist, playlists, loadPlaylists]
  );

  const handlePlayPlaylist = useCallback(async () => {
    if (!selectedPlaylist?.tracks.length) return;

    try {
      await api.clearQueue();
      await Promise.all(
        selectedPlaylist.tracks.map(
          (track, index) =>
            new Promise((resolve) =>
              setTimeout(async () => {
                await api.addSongToQueue(track.videoId, "INSERT_AT_END");
                resolve();
              }, index * QUEUE_DELAY)
            )
        )
      );

      await api.changeActiveSongInQueue(0);
    } catch (error) {
      console.error("Error playing playlist:", error);
      Alert.alert("Error", ERROR_MESSAGES.PLAY_PLAYLIST);
    }
  }, [selectedPlaylist, api]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: Math.max(insets.left),
        paddingRight: Math.max(insets.right),
      },
    ],
    [insets]
  );

  const handleModalClose = useCallback(() => {
    setShowPlaylistModal(false);
    loadPlaylists();
  }, [loadPlaylists]);

  return (
    <View style={containerStyle}>
      {/* AVAILABLE PLAYLISTS / LEFT COLUMN */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowPlaylistModal(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="#fff"
              style={styles.createButtonIcon}
            />
            <Text style={styles.createButtonText}>New Playlist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.playlistScroll}
          contentContainerStyle={styles.playlistScrollContent}
        >
          {playlists.map((playlist) => (
            <PlaylistItem
              key={playlist.id}
              playlist={playlist}
              isSelected={selectedPlaylist?.id === playlist.id}
              onSelect={setSelectedPlaylist}
              onDelete={handleDeletePlaylist}
            />
          ))}
        </ScrollView>
      </View>

      {/* TRACKS IN PLAYLISTS / RIGHT COLUMN */}
      <View style={styles.tracksSection}>
        <View style={styles.sidebarHeader}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handlePlayPlaylist}
            disabled={!selectedPlaylist?.tracks.length}
          >
            <Ionicons
              name="play-outline"
              size={24}
              color="#fff"
              style={styles.createButtonIcon}
            />
            <Text style={styles.createButtonText}>Play Playlist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.playlistScroll}
          contentContainerStyle={styles.playlistScrollContent}
        >
          {selectedPlaylist ? (
            <View style={styles.playlistContent}>
              {selectedPlaylist.tracks.map((track) => (
                <TrackItem
                  key={track.videoId}
                  track={track}
                  onRemove={handleRemoveTrack}
                  onPlay={handlePlayFromTrack}
                />
              ))}
              {selectedPlaylist.tracks.length === 0 && (
                <Text style={styles.emptyText}>No tracks in this playlist</Text>
              )}
            </View>
          ) : (
            <View style={styles.noSelectionContent}>
              <Text style={styles.noSelectionText}>
                Select a playlist to view its contents
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <PlaylistModal visible={showPlaylistModal} onClose={handleModalClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#000000",
    height: Platform.OS === "web" ? "100vh" : "100%",
    overflow: Platform.OS === "web" ? "hidden" : "visible",
  },
  sidebar: {
    width: Platform.OS === "ios" ? "30%" : Platform.OS === "android" ? "25%" : "20%",
    borderRightWidth: 1,
    borderRightColor: "#333333",
    ...(Platform.OS === "web" && {
      height: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }),
  },
  tracksSection: {
    flex: 1,
    ...(Platform.OS === "web" && {
      height: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }),
  },
  sidebarHeader: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  createButton: {
    backgroundColor: "#FF1493",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  playlistScroll: {
    flex: 1,
    ...(Platform.OS === "web" && {
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#1A1A1A",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#333333",
        borderRadius: "4px",
      },
    }),
  },
  playlistScrollContent: {
    padding: 16,
    paddingBottom:
      Platform.OS === "ios" ? 130 : Platform.OS === "android" ? 105 : 140,
    ...(Platform.OS === "web" && {
      minHeight: "min-content",
    }),
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#1A1A1A",
  },
  selectedPlaylist: {
    borderWidth: 1,
    borderColor: "#FF1493",
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  trackCount: {
    color: "#808080",
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#1A1A1A",
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  addedDate: {
    color: "#808080",
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  emptyText: {
    color: "#808080",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
  },
  noSelectionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noSelectionText: {
    color: "#808080",
    fontSize: 16,
  },
});
