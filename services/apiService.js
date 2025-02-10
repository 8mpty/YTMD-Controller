class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`GET request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data = {}, expectJson = true) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      if (expectJson) {
        return await response.json();
      }
      return true;
    } catch (error) {
      console.error(`POST request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async patch(endpoint, data = {}, expectJson = true) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      if (expectJson) {
        return await response.json();
      }
      return true;
    } catch (error) {
      console.error(`PATCH request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint, expectJson = false) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      if (expectJson) {
        return await response.json();
      }
      return true;
    } catch (error) {
      console.error(`DELETE request failed for ${endpoint}:`, error);
      throw error;
    }
  }
}

export const createApiService = (baseUrl) => {
  const api = new ApiService(baseUrl);

  return {
    // Song controls
    getSongInfo: () => api.get("/song", {}, false),
    togglePlay: () => api.post("/toggle-play", {}, false),
    previousSong: () => api.post("/previous", {}, false),
    nextSong: () => api.post("/next", {}, false),
    seekTo: (seconds) => api.post("/seek-to", { seconds }, false),

    // Volume controls
    getVolume: () => api.get("/volume"),
    setVolume: (volume) => api.post("/volume", { volume: Math.round(volume) }, false),

    // Queue
    getQueue: () => api.get("/queue"),
    addSongToQueue: (videoId) => api.post("/queue", { videoId, insertPosition: "INSERT_AT_END" }, false),
    changeActiveSongInQueue: (index) => api.patch("/queue", { index: parseInt(index) }, false),
    clearQueue: () => api.delete("/queue"),
    moveSongInQueue: (fromIndex, toIndex) => api.patch(`/queue/${fromIndex}`, { toIndex }),
    removeSongFromQueue: (index) => api.delete(`/queue/${index}`),

    // Playback settings
    getRepeatMode: () => api.get("/repeat-mode"),
    switchRepeat: (iteration = 1) => api.post("/switch-repeat", { iteration }, false),
    getShuffle: () => api.get("/shuffle", {}, false),
    toggleShuffle: () => api.post("/shuffle", {}, false),
  };
};

export default createApiService;
