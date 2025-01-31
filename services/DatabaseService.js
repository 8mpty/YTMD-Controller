import AsyncStorage from "@react-native-async-storage/async-storage";

const LIKES_KEY = "@likes";
const COUNTER_KEY = "@id_counter";

export const initDatabase = async () => {
  try {
    const counter = await AsyncStorage.getItem(COUNTER_KEY);
    if (!counter) {
      await AsyncStorage.setItem(COUNTER_KEY, "0");
    }
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

const getNextId = async () => {
  const currentId = parseInt((await AsyncStorage.getItem(COUNTER_KEY)) || "0");
  const nextId = currentId + 1;
  await AsyncStorage.setItem(COUNTER_KEY, nextId.toString());
  return nextId;
};

export const getAllLikes = async () => {
  try {
    const likesString = await AsyncStorage.getItem(LIKES_KEY);
    const likes = likesString ? JSON.parse(likesString) : [];
    return likes.sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error getting all likes:", error);
    return [];
  }
};

export const getLikeStatus = async (videoId) => {
  try {
    const likes = await getAllLikes();
    const record = likes.find((like) => like.videoId === videoId);

    if (record) {
      return !!record.like_status;
    }

    const currentDate = new Date().toLocaleDateString("en-GB");
    const newId = await getNextId();
    const newRecord = {
      id: newId,
      videoId,
      like_status: false,
      updated_date: currentDate,
    };

    likes.push(newRecord);
    await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    return false;
  } catch (error) {
    console.error("Error getting like status:", error);
    throw error;
  }
};

export const updateLikeStatus = async (videoId, status) => {
  try {
    const likes = await getAllLikes();
    const currentDate = new Date().toLocaleDateString("en-GB");
    const index = likes.findIndex((like) => like.videoId === videoId);

    if (index >= 0) {
      likes[index].like_status = status;
      likes[index].updated_date = currentDate;
    } else {
      const newId = await getNextId();
      likes.push({
        id: newId,
        videoId,
        like_status: status,
        updated_date: currentDate,
      });
    }

    await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  } catch (error) {
    console.error("Error updating like status:", error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    await AsyncStorage.setItem(LIKES_KEY, JSON.stringify([]));
    await AsyncStorage.setItem(COUNTER_KEY, "0");
    return true;
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};
