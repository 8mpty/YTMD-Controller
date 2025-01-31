// services/DatabaseService.js
import * as SQLite from "expo-sqlite";

let db;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("likes.db");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        videoId TEXT UNIQUE NOT NULL,
        like_status INTEGER DEFAULT 0,
        updated_date TEXT
      );
    `);
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const getLikeStatus = async (videoId) => {
  try {
    // First try to get existing record
    const row = await db.getFirstAsync(
      "SELECT like_status FROM likes WHERE videoId = ?",
      [videoId]
    );

    if (row) {
      return !!row.like_status;
    }

    // If no record exists, create one with default false status
    const currentDate = new Date().toLocaleDateString("en-GB");
    await db.runAsync(
      "INSERT INTO likes (videoId, like_status, updated_date) VALUES (?, 0, ?)",
      [videoId, currentDate]
    );
    return false;
  } catch (error) {
    console.error("Error getting like status:", error);
    throw error;
  }
};

export const updateLikeStatus = async (videoId, status) => {
  try {
    const currentDate = new Date().toLocaleDateString("en-GB");
    const result = await db.runAsync(
      "INSERT OR REPLACE INTO likes (videoId, like_status, updated_date) VALUES (?, ?, ?)",
      [videoId, status ? 1 : 0, currentDate]
    );
    return result;
  } catch (error) {
    console.error("Error updating like status:", error);
    throw error;
  }
};

// Optional: Helper function to get all likes (for debugging)
export const getAllLikes = async () => {
  try {
    const rows = await db.getAllAsync("SELECT * FROM likes");
    return rows;
  } catch (error) {
    console.error("Error getting all likes:", error);
    throw error;
  }
}