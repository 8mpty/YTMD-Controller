import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYLISTS_KEY = "@playlists";
const PLAYLIST_COUNTER_KEY = "@playlist_id_counter";

export const initPlaylistDatabase = async () => {
  try {
    const counter = await AsyncStorage.getItem(PLAYLIST_COUNTER_KEY);
    if (!counter) {
      await AsyncStorage.setItem(PLAYLIST_COUNTER_KEY, "0");
    }
    return true;
  } catch (error) {
    console.error("Error initializing playlist database:", error);
    throw error;
  }
};

const getNextPlaylistId = async () => {
  const currentId = parseInt(
    (await AsyncStorage.getItem(PLAYLIST_COUNTER_KEY)) || "0"
  );
  const nextId = currentId + 1;
  await AsyncStorage.setItem(PLAYLIST_COUNTER_KEY, nextId.toString());
  return nextId;
};

export const getAllPlaylists = async () => {
  try {
    const playlistsString = await AsyncStorage.getItem(PLAYLISTS_KEY);
    return playlistsString ? JSON.parse(playlistsString) : [];
  } catch (error) {
    console.error("Error getting all playlists:", error);
    return [];
  }
};

export const createPlaylist = async (name, description = "") => {
  try {
    const playlists = await getAllPlaylists();
    const newId = await getNextPlaylistId();

    const newPlaylist = {
      id: newId,
      name,
      description,
      tracks: [],
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    playlists.push(newPlaylist);
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    return newPlaylist;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const playlists = await getAllPlaylists();
    const updatedPlaylists = playlists.filter(
      (playlist) => playlist.id !== playlistId
    );
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updatedPlaylists));
    return true;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
};

export const addTrackToPlaylist = async (playlistId, track) => {
  try {
    const playlists = await getAllPlaylists();
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex === -1) {
      throw new Error("Playlist not found");
    }

    // Check if track already exists in playlist
    const trackExists = playlists[playlistIndex].tracks.some(
      (t) => t.videoId === track.videoId
    );

    if (trackExists) {
      throw new Error("Track already exists in playlist");
    }

    playlists[playlistIndex].tracks.push({
      ...track,
      added_date: new Date().toISOString(),
    });
    playlists[playlistIndex].updated_date = new Date().toISOString();

    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    return playlists[playlistIndex];
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    throw error;
  }
};

export const removeTrackFromPlaylist = async (playlistId, videoId) => {
  try {
    const playlists = await getAllPlaylists();
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex === -1) {
      throw new Error("Playlist not found");
    }

    playlists[playlistIndex].tracks = playlists[playlistIndex].tracks.filter(
      (track) => track.videoId !== videoId
    );
    playlists[playlistIndex].updated_date = new Date().toISOString();

    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    return playlists[playlistIndex];
  } catch (error) {
    console.error("Error removing track from playlist:", error);
    throw error;
  }
};

export const getPlaylistsContainingTrack = async (videoId) => {
  try {
    const playlists = await getAllPlaylists();
    return playlists.filter((playlist) =>
      playlist.tracks.some((track) => track.videoId === videoId)
    );
  } catch (error) {
    console.error("Error getting playlists containing track:", error);
    throw error;
  }
};

export const updatePlaylistDetails = async (playlistId, updates) => {
  try {
    const playlists = await getAllPlaylists();
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex === -1) {
      throw new Error("Playlist not found");
    }

    playlists[playlistIndex] = {
      ...playlists[playlistIndex],
      ...updates,
      updated_date: new Date().toISOString(),
    };

    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    return playlists[playlistIndex];
  } catch (error) {
    console.error("Error updating playlist details:", error);
    throw error;
  }
};
