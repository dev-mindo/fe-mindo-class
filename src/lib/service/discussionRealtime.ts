"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";

export type DiscussionRealtimeEvent = {
  action: "create" | "update" | "delete" | "close" | "vote";
  entity: "discussion" | "answer" | "vote";
  source?: "participant" | "admin";
  moduleId?: number;
  discussionId?: number;
  data?: unknown;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_APP_ID,
  measurementId:
    process.env.NEXT_PUBLIC_DISCUSSION_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

const discussionApp = isConfigured
  ? getApps().some((app) => app.name === "discussion-realtime")
    ? getApp("discussion-realtime")
    : initializeApp(firebaseConfig, "discussion-realtime")
  : null;

const discussionDB = discussionApp ? getFirestore(discussionApp) : null;
const discussionAuth = discussionApp ? getAuth(discussionApp) : null;
let authenticationPromise: Promise<void> | null = null;

const ensureRealtimeAuthentication = async () => {
  if (!discussionAuth || discussionAuth.currentUser) return;

  if (!authenticationPromise) {
    authenticationPromise = signInAnonymously(discussionAuth)
      .then(() => undefined)
      .catch((error) => {
        authenticationPromise = null;
        console.warn(
          "Discussion Firebase anonymous authentication failed:",
          error,
        );
      });
  }

  await authenticationPromise;
};

const sanitizeData = (data: unknown) => {
  if (data === undefined) return null;
  return JSON.parse(JSON.stringify(data));
};

const publishToChannel = async (
  collectionName: string,
  channelId: number,
  event: DiscussionRealtimeEvent,
) => {
  if (!discussionDB || !channelId) return;

  await addDoc(
    collection(
      discussionDB,
      collectionName,
      String(channelId),
      "events",
    ),
    {
      ...event,
      data: sanitizeData(event.data),
      createdAt: serverTimestamp(),
      createdAtMs: Date.now(),
    },
  );
};

export const publishDiscussionEvent = async (
  event: DiscussionRealtimeEvent,
) => {
  if (!discussionDB) return;

  try {
    await ensureRealtimeAuthentication();

    const writes: Promise<void>[] = [];

    if (event.moduleId) {
      writes.push(
        publishToChannel("discussion_modules", event.moduleId, event),
      );
    }

    if (event.discussionId) {
      writes.push(
        publishToChannel(
          "discussion_details",
          event.discussionId,
          event,
        ),
      );
    }

    await Promise.all(writes);
  } catch (error) {
    console.error("Failed to publish discussion realtime event:", error);
  }
};

const subscribeToChannel = (
  collectionName: string,
  channelId: number,
  callback: (event: DiscussionRealtimeEvent) => void,
) => {
  if (!discussionDB || !channelId) return () => undefined;

  let unsubscribe: Unsubscribe = () => undefined;
  let isCancelled = false;
  // Small lookback prevents clock differences between browser sessions from
  // causing an event to be missed while the listener is being attached.
  const subscribedAt = Date.now() - 10_000;

  void ensureRealtimeAuthentication().then(() => {
    if (isCancelled) return;

    const eventsQuery = query(
      collection(
        discussionDB,
        collectionName,
        String(channelId),
        "events",
      ),
      where("createdAtMs", ">=", subscribedAt),
    );

    unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            callback(change.doc.data() as DiscussionRealtimeEvent);
          }
        });
      },
      (error) => {
        console.error("Discussion realtime listener error:", error);
      },
    );
  });

  return () => {
    isCancelled = true;
    unsubscribe();
  };
};

export const subscribeModuleDiscussion = (
  moduleId: number,
  callback: (event: DiscussionRealtimeEvent) => void,
) => subscribeToChannel("discussion_modules", moduleId, callback);

export const subscribeDiscussionDetail = (
  discussionId: number,
  callback: (event: DiscussionRealtimeEvent) => void,
) => subscribeToChannel("discussion_details", discussionId, callback);

export const isDiscussionRealtimeConfigured = isConfigured;
