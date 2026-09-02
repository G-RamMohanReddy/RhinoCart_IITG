import React, { useState, useEffect, useRef } from "react";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  doc,
  updateDoc,
  where,
  deleteDoc,
  orderBy,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// --- FIREBASE CONFIGURATION ---
// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- STYLES ---
const styles = {
  appContainer: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#f0f2f5",
    color: "#333",
    minHeight: "100vh",
  },
  authPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2.5rem",
    borderRadius: "1rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  logo: {
    textAlign: "center",
    marginBottom: "2rem",
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#4a47a3",
  },
  logoSpan: { color: "#706fd3" },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "2rem",
    textAlign: "center",
  },
  inputGroup: { marginBottom: "1.5rem" },
  inputField: {
    width: "100%",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "1rem",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(90deg, #706fd3, #4a47a3)",
  },
  switchViewLink: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#4a47a3",
    cursor: "pointer",
    fontWeight: "500",
  },
  errorMessage: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "0.5rem",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  infoMessage: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #4a47a3",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  dashboardLayout: {
    maxWidth: "800px",
    margin: "0 auto",
    paddingBottom: "5rem",
  },
  header: {
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
  headerLogoText: { fontSize: "1.8rem", fontWeight: "bold", color: "#4A5568" },
  headerRight: { display: "flex", alignItems: "center", gap: "1.5rem" },
  headerNav: { display: "flex", alignItems: "center", gap: "1.5rem" },
  headerNavLink: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#555",
    cursor: "pointer",
    padding: "5px 8px",
    borderRadius: "5px",
    transition: "background-color 0.2s",
  },
  headerNavLinkActive: { color: "#4a47a3", fontWeight: "700" },
  profileIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: { width: "100%", height: "100%", objectFit: "cover" },
  dashboardNav: { padding: "1rem", backgroundColor: "#f9fafb" },
  dashboardNavGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  primaryTab: {
    width: "100%",
    textAlign: "center",
    padding: "1rem 0.75rem",
    fontWeight: "bold",
    fontSize: "1.1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: "none",
  },
  primaryTabActive: {
    backgroundColor: "#4a47a3",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  primaryTabInactive: { backgroundColor: "#e5e7eb", color: "#374151" },
  mainContent: { padding: "1rem" },
  contentBox: {
    padding: "1.5rem",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  h2: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "1rem",
  },
  h3: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#444",
    marginTop: "1.5rem",
    marginBottom: "1rem",
    borderBottom: "1px solid #eee",
    paddingBottom: "0.5rem",
  },
  p: { color: "#555", lineHeight: 1.5 },
  orderCard: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginBottom: "1rem",
    transition: "box-shadow 0.2s ease-in-out",
  },
  orderCardHover: { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  acceptButton: {
    marginTop: "1rem",
    width: "100%",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "bold",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: "none",
  },
  logoutButton: {
    fontSize: "0.9rem",
    color: "#555",
    cursor: "pointer",
    textAlign: "center",
    padding: "1rem",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalCloseButton: {
    position: "absolute",
    top: "0.5rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#aaa",
  },
  activeOrderBanner: { padding: "1rem", margin: "0 1rem 1rem 1rem" },
  compactSearchingView: {
    backgroundColor: "#4a47a3",
    color: "white",
    padding: "1rem",
    borderRadius: "0.5rem",
    textAlign: "center",
  },
  buyerConfirmationContainer: {
    padding: "1rem",
    maxWidth: "600px",
    margin: "auto",
  },
  priceDetailsCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "2px dashed #e5e7eb",
  },
  chatViewContainer: {
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
    width: "384px",
    height: "500px",
    backgroundColor: "white",
    borderRadius: "1rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1001,
  },
  chatHeader: {
    padding: "0.75rem",
    backgroundColor: "#4a47a3",
    color: "white",
    borderRadius: "1rem 1rem 0 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessages: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  messageBubble: {
    padding: "0.75rem",
    borderRadius: "0.75rem",
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  messageSent: {
    backgroundColor: "#dcf8c6",
    color: "#333",
    alignSelf: "flex-end",
  },
  messageReceived: {
    backgroundColor: "#e5e7eb",
    color: "#333",
    alignSelf: "flex-start",
  },
  chatImage: { maxWidth: "100%", borderRadius: "0.5rem", cursor: "pointer" },
  chatInputForm: {
    padding: "0.75rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "0.5rem",
  },
  imageUploadLabel: {
    padding: "0.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileModalImageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  profileModalImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "#e5e7eb",
  },
  termsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
    color: "#555",
  },
  termsLink: {
    color: "#4a47a3",
    cursor: "pointer",
    marginLeft: "0.5rem",
    textDecoration: "underline",
  },
  orderDetailsProfileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  orderDetailsProfileImage: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  tabsContainer: {
    display: "flex",
    borderBottom: "2px solid #e5e7eb",
    marginBottom: "1.5rem",
  },
  tab: {
    padding: "0.75rem 1.25rem",
    cursor: "pointer",
    border: "none",
    background: "none",
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "-2px",
  },
  tabActive: {
    color: "#4a47a3",
    fontWeight: "bold",
    boxShadow: "inset 0 -2px 0 #4a47a3",
  },
  statusBadge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "0.75rem",
    fontSize: "0.8rem",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusColors: {
    searching: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    pendingConfirmation: { backgroundColor: "#fef3c7", color: "#92400e" },
    confirmed: { backgroundColor: "#d1fae5", color: "#047857" },
    deliveryPendingConfirmation: {
      backgroundColor: "#ffedd5",
      color: "#9a3412",
    },
    delivered: { backgroundColor: "#e5e7eb", color: "#374151" },
    cancelled: { backgroundColor: "#fee2e2", color: "#991b1b" },
  },
  notificationPopup: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    backgroundColor: "white",
    color: "#333",
    padding: "1rem",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1002,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    animation: "slideIn 0.5s ease-out, fadeOut 0.5s ease-in 3.5s forwards",
  },
  highlightAnimation: { animation: "pulse-animation 2s 2" },
  deliveryFeeDisplay: {
    textAlign: "center",
    margin: "1rem 0",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#4a47a3",
  },
};

// --- ICON COMPONENTS ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "2rem", width: "2rem", color: "#4b5563" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "1.5rem", width: "1.5rem" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "1.5rem", width: "1.5rem", color: "white" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "1.5rem", width: "1.5rem", color: "#555" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const GalleryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ height: "1.5rem", width: "1.5rem", color: "#555" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// --- PROFESSIONALLY UPDATED LOCATIONS ---
const rawHostels = {
  Manas: { lat: 26.188, lon: 91.7 },
  Brahmaputra: { lat: 26.186, lon: 91.699 },
  Kapili: { lat: 26.188, lon: 91.696 },
  Dihing: { lat: 26.187, lon: 91.699 },
  Subansiri: { lat: 26.193, lon: 91.695 },
  Disang: { lat: 26.186, lon: 91.696 },
  Kameng: { lat: 26.19, lon: 91.701 },
  Siang: { lat: 26.189, lon: 91.697 },
  Barak: { lat: 26.189, lon: 91.701 },
  Umiam: { lat: 26.188, lon: 91.702 },
  Lohit: { lat: 26.189, lon: 91.698 },
  Gaurang: { lat: 26.192, lon: 91.701 },
  Dikhow: { lat: 26.186, lon: 91.697 },
  Dhansiri: { lat: 26.19, lon: 91.693 },
  "Married Scholars Hostel": { lat: 26.185, lon: 91.693 },
};
const generatedCanteens = Object.keys(rawHostels).reduce((acc, hostelName) => {
  if (hostelName !== "Married Scholars Hostel")
    acc[`${hostelName} Canteen`] = rawHostels[hostelName];
  return acc;
}, {});
const locations = {
  Markets: {
    "Khoka Market": { lat: 26.185, lon: 91.701 },
    "IITG Market Complex": { lat: 26.195, lon: 91.687 },
  },
  Hostels: rawHostels,
  Canteens: {
    "Food Court": { lat: 26.192, lon: 91.699 },
    ...generatedCanteens,
  },
  "Academic Complex": {
    "Core 1": { lat: 26.188, lon: 91.692 },
    "Core 2": { lat: 26.187, lon: 91.691 },
    "Core 3": { lat: 26.186, lon: 91.692 },
    "Core 4": { lat: 26.185, lon: 91.691 },
    "Core 5": { lat: 26.186, lon: 91.689 },
    "Lecture Halls": { lat: 26.189, lon: 91.691 },
    Library: { lat: 26.189, lon: 91.693 },
    "Admin Building": { lat: 26.189, lon: 91.691 },
  },
  "Landmarks & Facilities": {
    Hospital: { lat: 26.197, lon: 91.697 },
    "Sports Complex": { lat: 26.193, lon: 91.696 },
    "New Sac": { lat: 26.192, lon: 91.699 },
    "Guest House": { lat: 26.197, lon: 91.696 },
    "Main Gate": { lat: 26.196, lon: 91.687 },
    "KV Gate": { lat: 26.183, lon: 91.696 },
  },
  City: {
    "Guwahati City": { lat: 26.144, lon: 91.736 },
    Amingaon: { lat: 26.185, lon: 91.657 },
  },
  "Out of Station": { lat: 26.144, lon: 91.736 },
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  var R = 6371;
  var dLat = (lat2 - lat1) * (Math.PI / 180);
  var dLon = (lon2 - lon1) * (Math.PI / 180);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateDeliveryFee(from, to) {
  const findCoords = (locationStr) => {
    if (!locationStr) return null;
    if (locations[locationStr]) return locations[locationStr];
    const parts = locationStr.split(" - ");
    if (
      parts.length === 2 &&
      locations[parts[0]] &&
      locations[parts[0]][parts[1]]
    )
      return locations[parts[0]][parts[1]];
    return null;
  };
  const fromCoords = findCoords(from);
  const toCoords = findCoords(to);
  if (!fromCoords || !toCoords) return 10;
  const distance = getDistanceFromLatLonInKm(
    fromCoords.lat,
    fromCoords.lon,
    toCoords.lat,
    toCoords.lon,
  );
  const fee = Math.max(10, Math.round(distance * 15)); // ₹15/km, min ₹10
  return Math.min(fee, 100); // Max fee of 100
}

// --- AUTHENTICATION & PROFILE COMPONENTS ---
const LoadingSpinner = () => (
  <>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    <div style={styles.loadingOverlay}>
      <div style={styles.spinner}></div>
    </div>
  </>
);
const LoginView = ({ setView, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };
  return (
    <div style={styles.card}>
      <div style={{ ...styles.logoContainer, marginBottom: "2rem" }}>
        <h1 style={{ ...styles.logoTextAuth, ...styles.logo }}>
          Rhino<span style={styles.logoSpan}>Cart</span>
        </h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <input
            type="email"
            style={styles.inputField}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <input
            type="password"
            style={styles.inputField}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={styles.btn}>
          Login
        </button>
      </form>
      <div style={styles.switchViewLink} onClick={() => setView("register")}>
        Don't have an account? Register here
      </div>
    </div>
  );
};

const TermsAndConditionsModal = ({ onClose }) => (
  <div style={styles.modalBackdrop}>
    <div style={styles.modalContent}>
      <button onClick={onClose} style={styles.modalCloseButton}>
        &times;
      </button>
      <h2 style={styles.formTitle}>Terms and Conditions for RhinoCart</h2>
      <p
        style={{
          ...styles.p,
          textAlign: "center",
          fontStyle: "italic",
          fontSize: "0.9rem",
        }}
      >
        Last Updated: September 1, 2025
      </p>

      <p style={{ ...styles.p, marginTop: "1rem" }}>
        Welcome to RhinoCart! Please read these Terms and Conditions ("Terms")
        carefully before using the RhinoCart web application (the "Service").
        Your access to and use of the Service is conditioned on your acceptance
        of and compliance with these Terms. These Terms apply to all users,
        including "Buyers" (those requesting deliveries) and "Rhinos" (porters
        who perform deliveries), and others who access or use the Service.
      </p>
      <p style={styles.p}>
        By accessing or using the Service, you agree to be bound by these Terms.
        If you disagree with any part of the terms, then you may not access the
        Service.
      </p>

      <h3 style={styles.h3}>1. The Service</h3>
      <p style={styles.p}>
        RhinoCart is a neutral, peer-to-peer digital platform designed to
        connect students within the Indian Institute of Technology Guwahati
        (IITG) campus. The Service allows Buyers to post requests for the
        purchase and delivery of items, and for Rhinos to accept and fulfill
        these requests. You acknowledge and agree that RhinoCart is solely a
        technology platform and does not provide delivery, logistics, or
        purchasing services itself. RhinoCart is not a retailer, restaurant, or
        courier service. The actual contract for delivery is strictly between
        the Buyer and the Rhino.
      </p>

      <h3 style={styles.h3}>2. User Accounts and Eligibility</h3>
      <p style={styles.p}>
        <strong>Eligibility:</strong> To use the Service, you must be a current
        and registered student of IIT Guwahati.
        <br />
        <strong>Registration:</strong> You must register for an account using an
        appropriate email address. You agree that the information you provide
        during registration and in your profile is accurate, complete, and
        current at all times.
        <br />
        <strong>Profile Completion:</strong> After your first login, you will be
        required to complete your user profile with mandatory information,
        including your full name, hostel, room number, and contact number. You
        will not be able to access the core features of the Service until this
        information is provided. Providing false or misleading information may
        result in the suspension or termination of your account.
        <br />
        <strong>Account Security:</strong> You are responsible for safeguarding
        the password that you use to access the Service and for any activities
        or actions under your password.
      </p>

      <h3 style={styles.h3}>3. User Conduct</h3>
      <p style={styles.p}>As a user of RhinoCart, you agree to:</p>
      <ul style={{ ...styles.p, paddingLeft: "20px", listStyleType: "disc" }}>
        <li>
          Use the Service in a lawful manner and in compliance with all
          applicable laws and IIT Guwahati campus regulations.
        </li>
        <li>
          Treat all other users with respect and courtesy. Harassment, abuse, or
          any form of misconduct is strictly prohibited.
        </li>
        <li>
          Not use the Service to request, transport, or purchase any illegal,
          hazardous, or prohibited items.
        </li>
        <li>
          Communicate clearly and honestly with other users regarding order
          details, pricing, and delivery times through the in-app chat or other
          means.
        </li>
      </ul>

      <h3 style={styles.h3}>4. Orders, Payments, and Fees</h3>
      <p style={styles.p}>
        <strong>Placing Orders:</strong> Buyers are responsible for clearly
        specifying the items they need, pickup locations, and drop-off details.
        <br />
        <strong>Accepting Orders:</strong> Rhinos act as independent
        individuals. When a Rhino accepts an order, they enter into a direct
        agreement with the Buyer.
        <br />
        <strong>Pricing and Fees:</strong> The Rhino will propose a price for
        the requested items. This price, along with the calculated delivery fee,
        will be presented to the Buyer for confirmation. The delivery fee is
        calculated based on the distance between the pickup and drop-off
        locations.
        <br />
        <strong>Payment:</strong> All payments for items and delivery fees are
        to be handled directly between the Buyer and the Rhino, primarily
        through <strong>Cash on Delivery (COD)</strong>. RhinoCart does not
        process payments and is not responsible for any payment disputes.
      </p>

      <h3 style={styles.h3}>5. Disputes and Cancellations</h3>
      <p style={styles.p}>
        <strong>Disputes:</strong> Any disputes arising from a
        delivery—including but not limited to incorrect items, damaged goods, or
        payment issues—are to be resolved directly between the Buyer and the
        Rhino involved. RhinoCart may, upon request, provide relevant
        information such as user details or chat logs to assist in dispute
        resolution but is not obligated to mediate.
        <br />
        <strong>Cancellations:</strong> Users may cancel an order according to
        the functionality provided within the app. A Buyer may cancel a request
        before it is confirmed. Both a Buyer and a Rhino may cancel an active,
        confirmed order, which will be recorded in their order history. Repeated
        or last-minute cancellations may be subject to review and could lead to
        account suspension.
      </p>

      <h3 style={styles.h3}>6. Limitation of Liability</h3>
      <p style={styles.p}>
        The RhinoCart service is provided on an "AS IS" and "AS AVAILABLE"
        basis. To the fullest extent permissible by law, RhinoCart disclaims all
        warranties. RhinoCart shall not be liable for any indirect, incidental,
        special, consequential, or punitive damages, including without
        limitation, loss of items, financial loss, or other intangible losses,
        resulting from: (i) your access to or use of or inability to access or
        use the Service; (ii) any conduct or content of any third party (i.e.,
        another user) on the Service; (iii) any loss or damage to items during
        the delivery process.
      </p>

      <h3 style={styles.h3}>7. Account Termination</h3>
      <p style={styles.p}>
        We may terminate or suspend your account immediately, without prior
        notice or liability, for any reason whatsoever, including without
        limitation if you breach the Terms.
      </p>

      <h3 style={styles.h3}>8. Changes to Terms</h3>
      <p style={styles.p}>
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. We will provide notice of any changes by posting the
        new Terms on this page. By continuing to access or use our Service after
        those revisions become effective, you agree to be bound by the revised
        terms.
      </p>

      <h3 style={styles.h3}>9. Contact Us</h3>
      <p style={styles.p}>
        If you have any questions about these Terms, please refer to the
        "Contact Us" section within the application.
      </p>

      <button onClick={onClose} style={{ ...styles.btn, marginTop: "1.5rem" }}>
        I Understand
      </button>
    </div>
  </div>
);

const RegisterView = ({ setView, onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(email, password);
  };

  return (
    <>
      {isTermsModalOpen && (
        <TermsAndConditionsModal onClose={() => setIsTermsModalOpen(false)} />
      )}
      <div style={styles.card}>
        <div style={{ ...styles.logoContainer, marginBottom: "2rem" }}>
          <h1 style={{ ...styles.logoTextAuth, ...styles.logo }}>
            Rhino<span style={styles.logoSpan}>Cart</span>
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              style={styles.inputField}
              placeholder="College Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              style={styles.inputField}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.termsContainer}>
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            <label htmlFor="terms">
              I agree to the
              <span
                style={styles.termsLink}
                onClick={() => setIsTermsModalOpen(true)}
              >
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: agreedToTerms ? 1 : 0.6,
              cursor: agreedToTerms ? "pointer" : "not-allowed",
            }}
            disabled={!agreedToTerms}
          >
            Register
          </button>
        </form>
        <div style={styles.switchViewLink} onClick={() => setView("login")}>
          Already have an account? Login
        </div>
      </div>
    </>
  );
};
const EmailVerificationView = ({ setView, email }) => (
  <div style={styles.card}>
    <div style={styles.infoMessage}>
      <p style={{ fontWeight: "600", fontSize: "1.2rem" }}>Verify Your Email</p>
      <p>
        A verification link has been sent to <strong>{email}</strong>. Please
        click the link to continue. (Check Spam if not found)
      </p>
    </div>
    <button onClick={() => setView("login")} style={styles.btn}>
      Back to Login
    </button>
  </div>
);

const ProfileSetupView = ({ user, onProfileComplete }) => {
  const [fullName, setFullName] = useState("");
  const [hostel, setHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !hostel || !roomNumber || !phoneNumber) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName,
          hostel,
          roomNumber,
          phoneNumber,
          email: user.email,
          profileComplete: true,
          photoURL: null,
          notificationsEnabled: null, // Initialize notification preference
        },
        { merge: true },
      );
      onProfileComplete();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  return (
    <div style={styles.authPage}>
      <div style={styles.card}>
        <h2 style={styles.formTitle}>Complete Your Profile</h2>
        <p style={{ ...styles.p, textAlign: "center", marginBottom: "2rem" }}>
          Welcome! We need a few more details to get you started.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              style={styles.inputField}
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <select
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              style={styles.inputField}
              required
            >
              <option value="" disabled>
                Select Your Hostel...
              </option>
              {Object.keys(locations.Hostels).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <input
              type="text"
              style={styles.inputField}
              placeholder="Room Number (e.g., B1-201)"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="tel"
              style={styles.inputField}
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.btn}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

const ProfileView = ({ user, profile, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [hostel, setHostel] = useState(profile.hostel);
  const [roomNumber, setRoomNumber] = useState(profile.roomNumber);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile.photoURL);
  const [isUploading, setIsUploading] = useState(false);
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSave = async () => {
    setIsUploading(true);
    let photoURL = profile.photoURL;
    if (imageFile) {
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      await uploadTask;
      photoURL = await getDownloadURL(storageRef);
    }
    const updatedProfile = {
      fullName,
      hostel,
      roomNumber,
      phoneNumber,
      photoURL,
    };
    await updateDoc(doc(db, "users", user.uid), updatedProfile);
    setIsUploading(false);
    setIsEditing(false);
  };
  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <button onClick={onClose} style={styles.modalCloseButton}>
          &times;
        </button>
        <h2 style={styles.formTitle}>Your Profile</h2>
        <div style={styles.profileModalImageContainer}>
          <img
            src={
              imagePreview || "https://placehold.co/100x100/e5e7eb/333?text=Add"
            }
            alt="Profile"
            style={styles.profileModalImage}
          />
          {isEditing && (
            <input type="file" accept="image/*" onChange={handleImageChange} />
          )}
        </div>
        <div style={styles.inputGroup}>
          <label>Full Name</label>
          <input
            type="text"
            style={styles.inputField}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Hostel</label>
          <select
            value={hostel}
            onChange={(e) => setHostel(e.target.value)}
            style={styles.inputField}
            disabled={!isEditing}
          >
            {Object.keys(locations.Hostels).map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label>Room Number</label>
          <input
            type="text"
            style={styles.inputField}
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            style={styles.inputField}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          {isEditing ? (
            <button
              onClick={handleSave}
              style={{ ...styles.btn, flex: 1 }}
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{ ...styles.btn, flex: 1 }}
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={onClose}
            style={{ ...styles.btn, flex: 1, background: "#6c757d" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT: NOTIFICATION PERMISSION ---
const NotificationPermissionModal = ({ user, onClose }) => {
  const handleResponse = async (enable) => {
    try {
      const userRef = doc(db, "users", user.uid);
      if (enable) {
        const permission = await Notification.requestPermission();
        await updateDoc(userRef, {
          notificationsEnabled: permission === "granted",
        });
      } else {
        await updateDoc(userRef, { notificationsEnabled: false });
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
    } finally {
      onClose();
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <h2 style={styles.formTitle}>Stay Updated!</h2>
        <p style={{ ...styles.p, textAlign: "center" }}>
          Would you like to receive system notifications for new delivery
          opportunities?
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button
            onClick={() => handleResponse(true)}
            style={{ ...styles.btn, flex: 1, background: "#10b981" }}
          >
            Yes, Enable
          </button>
          <button
            onClick={() => handleResponse(false)}
            style={{ ...styles.btn, flex: 1, background: "#6c757d" }}
          >
            No, Thanks
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENTS ---
const Header = ({
  activeTab,
  setActiveTab,
  profile,
  onProfileClick,
  highlightDeliveries,
  onContactClick,
}) => {
  const deliveriesStyle = {
    ...styles.headerNavLink,
    ...(activeTab === "My Deliveries" ? styles.headerNavLinkActive : {}),
    ...(highlightDeliveries ? styles.highlightAnimation : {}),
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <h1 style={{ ...styles.headerLogoText, ...styles.logo, margin: 0 }}>
          Rhino<span style={styles.logoSpan}>Cart</span>
        </h1>
      </div>
      <div style={styles.headerRight}>
        <div style={styles.headerNav}>
          <span onClick={onContactClick} style={styles.headerNavLink}>
            Contact Us
          </span>
          <span
            onClick={() => setActiveTab("My Orders")}
            style={
              activeTab === "My Orders"
                ? { ...styles.headerNavLink, ...styles.headerNavLinkActive }
                : styles.headerNavLink
            }
          >
            My Orders
          </span>
          <span
            onClick={() => setActiveTab("My Deliveries")}
            style={deliveriesStyle}
          >
            My Deliveries
          </span>
        </div>
        <div style={styles.profileIcon} onClick={onProfileClick}>
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Profile"
              style={styles.profileImage}
            />
          ) : (
            <UserIcon />
          )}
        </div>
      </div>
    </header>
  );
};
const DashboardNav = ({ activeTab, setActiveTab }) => (
  <nav style={styles.dashboardNav}>
    <div style={styles.dashboardNavGrid}>
      <button
        onClick={() => setActiveTab("Request to Order")}
        style={
          activeTab === "Request to Order"
            ? { ...styles.primaryTab, ...styles.primaryTabActive }
            : { ...styles.primaryTab, ...styles.primaryTabInactive }
        }
      >
        Request an Order
      </button>
      <button
        onClick={() => setActiveTab("Open for Deliveries")}
        style={
          activeTab === "Open for Deliveries"
            ? { ...styles.primaryTab, ...styles.primaryTabActive }
            : { ...styles.primaryTab, ...styles.primaryTabInactive }
        }
      >
        Open for Deliveries
      </button>
    </div>
  </nav>
);
const AcceptOrderModal = ({ order, user, onClose, onAcceptSuccess }) => {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const handleAccept = async () => {
    if (!price || isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setError("");
    const orderRef = doc(db, "orders", order.id);
    try {
      const deliveryFee = calculateDeliveryFee(order.from, order.to);
      await updateDoc(orderRef, {
        status: "pendingConfirmation",
        itemPrice: Number(price),
        deliveryFee,
        rhinoId: user.uid,
        rhinoEmail: user.email,
      });
      onAcceptSuccess();
      onClose();
    } catch (err) {
      console.error("Error accepting order:", err);
      setError("Failed to accept order. Please try again.");
    }
  };
  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <h2 style={styles.formTitle}>Accept Delivery</h2>
        <p style={styles.p}>Enter the estimated price for: "{order.items}"</p>
        <div style={styles.inputGroup}>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 150"
            style={{ ...styles.inputField, marginTop: "1rem" }}
          />
        </div>
        {error && (
          <p
            style={{
              ...styles.errorMessage,
              marginBottom: "1rem",
              padding: "0.5rem",
            }}
          >
            {error}
          </p>
        )}
        {/* --- NEW: FRAUD WARNING --- */}
        <p
          style={{
            ...styles.p,
            fontSize: "0.8rem",
            color: "#666",
            textAlign: "center",
            marginTop: "0.5rem",
          }}
        >
          Note: Fraudulent price submissions, if reported, can lead to account
          suspension. Please enter the accurate item price.
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button
            onClick={handleAccept}
            style={{ ...styles.btn, flex: 1, background: "#10b981" }}
          >
            Submit Price
          </button>
          <button
            onClick={onClose}
            style={{ ...styles.btn, flex: 1, background: "#6c757d" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactUsModal = ({ onClose }) => (
  <div style={styles.modalBackdrop}>
    <div style={{ ...styles.modalContent, maxWidth: "500px" }}>
      <button onClick={onClose} style={styles.modalCloseButton}>
        &times;
      </button>
      <h2 style={{ ...styles.formTitle, marginBottom: "1rem" }}>Contact Us</h2>
      <p style={{ ...styles.p, textAlign: "center", marginTop: 0 }}>
        For any support, feedback, or issues, please reach out to us.
      </p>
      <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
        <p style={{ ...styles.p, margin: "0.5rem 0" }}>
          <strong>Email:</strong> rhinocart.iitg@gmail.com
        </p>
        <p style={{ ...styles.p, margin: "0.5rem 0" }}>
          <strong>Phone:</strong> +91 8945079412 , +91 9177595164
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSce85Vnm_9yCmHaSoATFR7MjWk-B5BmM3xp31IdN-wHklbHgw/viewform?usp=sharing&ouid=100613513864085592964" // Placeholder
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...styles.btn, textDecoration: "none", textAlign: "center" }}
        >
          Feedback & Suggestions
        </a>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScKN8d2Zn29Eat7WATJ3aCqy5qGAq7m0XcFy37sYqMWuUlEUg/viewform?usp=dialog" // Placeholder
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...styles.btn,
            textDecoration: "none",
            textAlign: "center",
            background: "#6c757d",
          }}
        >
          Complaint (Order-specific)
        </a>
      </div>
    </div>
  </div>
);

const RequestOrderView = ({ user }) => {
  const [orderText, setOrderText] = useState("");
  const [pickupCategory, setPickupCategory] = useState("");
  const [pickupSubLocation, setPickupSubLocation] = useState("");
  const [pickupSubOptions, setPickupSubOptions] = useState([]);
  const [dropCategory, setDropCategory] = useState("");
  const [dropSubLocation, setDropSubLocation] = useState("");
  const [dropSubOptions, setDropSubOptions] = useState([]);
  const [pickupDetails, setPickupDetails] = useState("");
  const [dropoffDetails, setDropoffDetails] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(null);

  const dropOffLocations = Object.keys(locations)
    .filter((key) => key !== "City" && key !== "Out of Station")
    .reduce((obj, key) => ({ ...obj, [key]: locations[key] }), {});

  useEffect(() => {
    const from =
      locations[pickupCategory] &&
      typeof locations[pickupCategory] === "object" &&
      pickupSubLocation
        ? `${pickupCategory} - ${pickupSubLocation}`
        : pickupCategory;
    const to =
      locations[dropCategory] &&
      typeof locations[dropCategory] === "object" &&
      dropSubLocation
        ? `${dropCategory} - ${dropSubLocation}`
        : dropCategory;

    if (
      (pickupSubLocation ||
        !(
          locations[pickupCategory] &&
          typeof locations[pickupCategory] === "object" &&
          locations[pickupCategory] !== null
        )) &&
      pickupCategory &&
      (dropSubLocation ||
        !(
          locations[dropCategory] &&
          typeof locations[dropCategory] === "object" &&
          locations[dropCategory] !== null
        )) &&
      dropCategory
    ) {
      setDeliveryFee(calculateDeliveryFee(from, to));
    } else {
      setDeliveryFee(null);
    }
  }, [pickupCategory, pickupSubLocation, dropCategory, dropSubLocation]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const finalPickupLocation =
      locations[pickupCategory] &&
      typeof locations[pickupCategory] === "object" &&
      locations[pickupCategory] !== null
        ? `${pickupCategory} - ${pickupSubLocation}`
        : pickupCategory;
    const finalDropLocation =
      locations[dropCategory] &&
      typeof locations[dropCategory] === "object" &&
      locations[dropCategory] !== null
        ? `${dropCategory} - ${dropSubLocation}`
        : dropCategory;

    if (!orderText || !finalPickupLocation || !finalDropLocation) return;

    await addDoc(collection(db, "orders"), {
      items: orderText,
      from: finalPickupLocation,
      to: finalDropLocation,
      pickupDetails,
      dropoffDetails,
      status: "searching",
      createdAt: serverTimestamp(),
      requesterId: user.uid,
      buyerEmail: user.email,
    });
    setOrderText("");
    setPickupCategory("");
    setPickupSubLocation("");
    setDropCategory("");
    setDropSubLocation("");
    setPickupDetails("");
    setDropoffDetails("");
  };

  const handleCategoryChange = (
    e,
    setCategory,
    setSubLocation,
    setOptions,
    source,
  ) => {
    const category = e.target.value;
    setCategory(category);
    setSubLocation("");
    if (
      source[category] &&
      typeof source[category] === "object" &&
      source[category] !== null
    ) {
      setOptions(Object.keys(source[category]));
    } else {
      setOptions([]);
    }
  };

  return (
    <div style={styles.contentBox}>
      <h2 style={styles.h2}>Request a New Order</h2>
      <p style={styles.p}>
        Fill out the details below to find a Rhino for your items.
      </p>
      <form
        onSubmit={handleCreateOrder}
        style={{
          marginTop: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <textarea
          value={orderText}
          onChange={(e) => setOrderText(e.target.value)}
          rows="3"
          style={styles.inputField}
          placeholder="e.g., 2 Maggi packets from Khoka..."
          required
        ></textarea>

        {/* Pickup Location Selection */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              pickupSubOptions.length > 0 ? "1fr 1fr" : "1fr",
            gap: "1rem",
          }}
        >
          <select
            value={pickupCategory}
            onChange={(e) =>
              handleCategoryChange(
                e,
                setPickupCategory,
                setPickupSubLocation,
                setPickupSubOptions,
                locations,
              )
            }
            style={styles.inputField}
            required
          >
            <option value="" disabled>
              Select Pickup Category...
            </option>
            {Object.keys(locations).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {pickupSubOptions.length > 0 && (
            <select
              value={pickupSubLocation}
              onChange={(e) => setPickupSubLocation(e.target.value)}
              style={styles.inputField}
              required
            >
              <option value="" disabled>
                Select Specific...
              </option>
              {pickupSubOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          type="text"
          value={pickupDetails}
          onChange={(e) => setPickupDetails(e.target.value)}
          style={styles.inputField}
          placeholder="Pickup Details (Shop name, landmark, etc. - Optional)"
        />

        {/* Drop-off Location Selection */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: dropSubOptions.length > 0 ? "1fr 1fr" : "1fr",
            gap: "1rem",
          }}
        >
          <select
            value={dropCategory}
            onChange={(e) =>
              handleCategoryChange(
                e,
                setDropCategory,
                setDropSubLocation,
                setDropSubOptions,
                dropOffLocations,
              )
            }
            style={styles.inputField}
            required
          >
            <option value="" disabled>
              Select Drop-off Category...
            </option>
            {Object.keys(dropOffLocations).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {dropSubOptions.length > 0 && (
            <select
              value={dropSubLocation}
              onChange={(e) => setDropSubLocation(e.target.value)}
              style={styles.inputField}
              required
            >
              <option value="" disabled>
                Select Specific...
              </option>
              {dropSubOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>
        <input
          type="text"
          value={dropoffDetails}
          onChange={(e) => setDropoffDetails(e.target.value)}
          style={styles.inputField}
          placeholder="Drop-off Details (Room No, Floor, etc. - Required)"
          required
        />

        {deliveryFee !== null && (
          <div style={styles.deliveryFeeDisplay}>
            Estimated Delivery Fee: ₹{deliveryFee}
          </div>
        )}

        <button type="submit" style={{ ...styles.btn, background: "#4a47a3" }}>
          Find a Rhino
        </button>
      </form>
    </div>
  );
};

const OpenForDeliveriesView = ({ user, onAcceptSuccess }) => {
  const [openOrders, setOpenOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["searching", "pendingPayment"]),
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetchedOrders = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // This sort is no longer needed as Firestore doesn't guarantee order without an orderBy clause.
      // We can sort client-side if needed.
      // fetchedOrders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setOpenOrders(fetchedOrders);
    });
    return unsub;
  }, []);
  return (
    <>
      {selectedOrder && (
        <AcceptOrderModal
          order={selectedOrder}
          user={user}
          onClose={() => setSelectedOrder(null)}
          onAcceptSuccess={onAcceptSuccess}
        />
      )}
      <div style={styles.contentBox}>
        <h2 style={styles.h2}>Open Orders ({openOrders.length})</h2>
        <p style={styles.p}>Here are the newest requests from Buyers.</p>
        <div style={{ marginTop: "1.5rem" }}>
          {openOrders.length > 0 ? (
            openOrders.map((order) => (
              <div key={order.id} style={styles.orderCard}>
                <p>
                  <strong>Items:</strong> "{order.items}"
                </p>
                <p>
                  <strong>From:</strong> {order.from}
                </p>
                <p>
                  <strong>To:</strong> {order.to}
                </p>
                <p>
                  <strong>Delivery Fee:</strong> ₹
                  {calculateDeliveryFee(order.from, order.to)}
                </p>
                {order.requesterId !== user.uid &&
                  order.status === "searching" && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={styles.acceptButton}
                    >
                      Accept & Add Price
                    </button>
                  )}
              </div>
            ))
          ) : (
            <p>No open orders right now.</p>
          )}
        </div>
      </div>
    </>
  );
};

const Tabs = ({ tabs, activeTab, setActiveTab }) => (
  <div style={styles.tabsContainer}>
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        style={
          activeTab === tab
            ? { ...styles.tab, ...styles.tabActive }
            : styles.tab
        }
      >
        {tab}
      </button>
    ))}
  </div>
);

const MyOrdersView = ({ orders, onAction, userProfiles }) => {
  const [currentTab, setCurrentTab] = useState("Active");
  const active = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );
  const past = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled",
  );
  const displayedOrders = currentTab === "Active" ? active : past;

  return (
    <div style={styles.contentBox}>
      <h2 style={styles.h2}>My Orders</h2>
      <Tabs
        tabs={["Active", "Past"]}
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
      />
      <div>
        {displayedOrders.length > 0 ? (
          displayedOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              isRhino={false}
              onAction={onAction}
              otherUserProfile={userProfiles[o.rhinoId]}
            />
          ))
        ) : (
          <p>No {currentTab.toLowerCase()} orders.</p>
        )}
      </div>
    </div>
  );
};
const MyDeliveriesView = ({ deliveries, onAction, userProfiles }) => {
  const [currentTab, setCurrentTab] = useState("Active");
  const active = deliveries.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );
  const past = deliveries.filter(
    (o) => o.status === "delivered" || o.status === "cancelled",
  );
  const displayedDeliveries = currentTab === "Active" ? active : past;

  return (
    <div style={styles.contentBox}>
      <h2 style={styles.h2}>My Deliveries</h2>
      <Tabs
        tabs={["Active", "Past"]}
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
      />
      <div>
        {displayedDeliveries.length > 0 ? (
          displayedDeliveries.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              isRhino={true}
              onAction={onAction}
              otherUserProfile={userProfiles[o.requesterId]}
            />
          ))
        ) : (
          <p>No {currentTab.toLowerCase()} deliveries.</p>
        )}
      </div>
    </div>
  );
};

// --- CUSTOMER FLOW & ORDER MANAGEMENT ---
const OrderCard = ({ order, isRhino, onAction, otherUserProfile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusStyle = {
    ...styles.statusBadge,
    ...styles.statusColors[order.status],
  };
  const cardStyle = isHovered
    ? { ...styles.orderCard, ...styles.orderCardHover }
    : styles.orderCard;

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Items:</strong> "{order.items}"
        </p>
        <span style={statusStyle}>
          {order.status.replace(/([A-Z])/g, " $1")}
        </span>
      </div>
      <p>
        <strong>From:</strong> {order.from}
      </p>
      {order.pickupDetails && (
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          {" "}
          ↳ {order.pickupDetails}
        </p>
      )}
      <p>
        <strong>To:</strong> {order.to}
      </p>
      {order.dropoffDetails && (
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          {" "}
          ↳ {order.dropoffDetails}
        </p>
      )}
      {order.itemPrice && (
        <p>
          <strong>Total:</strong> ₹
          {(order.itemPrice + order.deliveryFee).toFixed(2)}
        </p>
      )}

      {order.status === "confirmed" && otherUserProfile && (
        <div
          style={{
            borderTop: "1px solid #eee",
            marginTop: "1rem",
            paddingTop: "1rem",
          }}
        >
          <p>
            <strong>{isRhino ? "Buyer" : "Rhino"}:</strong>{" "}
            {otherUserProfile.fullName}
          </p>
          <p>
            <strong>Contact:</strong> {otherUserProfile.phoneNumber}
          </p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginTop: "0.5rem",
        }}
      >
        {/* Chat Button */}
        {(order.status === "confirmed" ||
          order.status === "pendingConfirmation" ||
          order.status === "deliveryPendingConfirmation") && (
          <button
            onClick={() => onAction("chat", order)}
            style={{
              ...styles.btn,
              flex: "1 1 0px",
              backgroundColor: "#4a47a3",
            }}
          >
            Chat with {isRhino ? "Buyer" : "Rhino"}
          </button>
        )}

        {/* View Details Button */}
        {order.status !== "searching" && (
          <button
            onClick={() => onAction("viewDetails", order)}
            style={{
              ...styles.btn,
              flex: "1 1 0px",
              backgroundColor: "#6c757d",
            }}
          >
            View Details
          </button>
        )}

        {/* Mark as Delivered Button */}
        {isRhino && order.status === "confirmed" && (
          <button
            onClick={() => onAction("rhinoDelivered", order)}
            style={{
              ...styles.btn,
              flex: "1 1 0px",
              backgroundColor: "#25D366",
            }}
          >
            Mark as Delivered
          </button>
        )}

        {/* Confirm Delivery Button */}
        {!isRhino && order.status === "deliveryPendingConfirmation" && (
          <button
            onClick={() => onAction("buyerConfirmDelivery", order)}
            style={{
              ...styles.btn,
              flex: "1 1 0px",
              backgroundColor: "#25D366",
            }}
          >
            Confirm Delivery
          </button>
        )}

        {/* --- NEW: CANCEL BUTTON --- */}
        {(order.status === "confirmed" ||
          order.status === "deliveryPendingConfirmation") && (
          <button
            onClick={() => onAction("cancelOrder", order)}
            style={{
              ...styles.btn,
              flex: "1 1 0px",
              backgroundColor: "#ef4444",
            }}
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

const CompactSearchingView = ({ onCancel }) => (
  <div style={styles.compactSearchingView}>
    <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Searching for a Rhino...</h3>
    <p style={{ margin: "0.5rem 0", color: "#d1d5db" }}>
      Your request is being broadcasted.
    </p>
    <button
      onClick={onCancel}
      style={{
        ...styles.btn,
        background: "rgba(255,255,255,0.2)",
        width: "auto",
        padding: "0.5rem 1rem",
        fontSize: "0.9rem",
      }}
    >
      Cancel Request
    </button>
  </div>
);

const BuyerConfirmationView = ({ order, onAction }) => {
  const total = (order.itemPrice || 0) + (order.deliveryFee || 0);
  return (
    <div style={styles.buyerConfirmationContainer}>
      <div style={styles.priceDetailsCard}>
        <h2 style={styles.h2}>A Rhino Found Your Order!</h2>
        <p>
          <strong>Rhino:</strong> {order.rhinoEmail}
        </p>
        <div style={styles.priceRow}>
          <span>Items: "{order.items}"</span>
        </div>
        <div style={styles.priceRow}>
          <span>Item(s) Price</span>
          <span style={{ fontWeight: "500" }}>
            ₹{order.itemPrice?.toFixed(2)}
          </span>
        </div>
        <div style={styles.priceRow}>
          <span>Delivery Fee</span>
          <span style={{ fontWeight: "500" }}>
            ₹{order.deliveryFee?.toFixed(2)}
          </span>
        </div>
        <div style={styles.totalRow}>
          <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Total</span>
          <span
            style={{ fontWeight: "bold", fontSize: "1.5rem", color: "#4a47a3" }}
          >
            ₹{total.toFixed(2)}
          </span>
        </div>
        {/* --- UPDATED: BUTTON LAYOUT WITH CHAT --- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => onAction("accept", order)}
              style={{ ...styles.btn, flex: 1, background: "#10b981" }}
            >
              Accept & Confirm
            </button>
            <button
              onClick={() => onAction("retry", order)}
              style={{ ...styles.btn, flex: 1, background: "#f59e0b" }}
            >
              Find Another
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => onAction("chat", order)}
              style={{ ...styles.btn, flex: 1, background: "#4a47a3" }}
            >
              Chat with Rhino
            </button>
            <button
              onClick={() => onAction("cancel", order)}
              style={{ ...styles.btn, flex: 1, background: "#ef4444" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmedOrderView = ({ order, isRhino, onAction, userProfiles }) => (
  <div style={styles.contentBox}>
    <h2 style={styles.h2}>Order Confirmed!</h2>
    <OrderCard
      order={order}
      isRhino={isRhino}
      onAction={onAction}
      otherUserProfile={
        userProfiles[isRhino ? order.requesterId : order.rhinoId]
      }
    />
    {!isRhino && (
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Payment Method</h3>
        <p style={{ ...styles.p, marginBottom: "1rem" }}>
          Please note: We currently only support Cash on Delivery.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            style={{
              ...styles.btn,
              flex: 1,
              background: "#6c757d",
              cursor: "not-allowed",
            }}
            disabled
          >
            Pay on Delivery (COD)
          </button>
        </div>
      </div>
    )}
    {isRhino && (
      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Please deliver the items to the Buyer.
      </p>
    )}
  </div>
);

const ChatView = ({ order, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const messagesEndRef = useRef(null);
  const otherUser = order.otherUserProfile; // Get other user profile from order context

  useEffect(() => {
    const q = query(
      collection(db, "orders", order.id, "messages"),
      orderBy("timestamp"),
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => d.data())),
    );
    return unsub;
  }, [order.id]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" && !imageFile) return;
    const messagesRef = collection(db, "orders", order.id, "messages");
    let fileToUpload = imageFile;
    if (fileToUpload) {
      const storageRef = ref(
        storage,
        `chat_images/${order.id}/${Date.now()}_${fileToUpload.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
      uploadTask.on(
        "state_changed",
        null,
        (err) => console.error(err),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(messagesRef, {
            text: newMessage,
            imageUrl: downloadURL,
            senderId: user.uid,
            timestamp: serverTimestamp(),
          });
        },
      );
    } else {
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
    }
    setNewMessage("");
    setImageFile(null);
    if (document.getElementById("gallery-upload"))
      document.getElementById("gallery-upload").value = "";
    if (document.getElementById("camera-upload"))
      document.getElementById("camera-upload").value = "";
  };
  return (
    <div style={styles.chatViewContainer}>
      <div style={styles.chatHeader}>
        {/* --- UPDATED: DYNAMIC CHAT HEADER --- */}
        <h3>Chat with {otherUser?.fullName || "User"}</h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
        >
          &times;
        </button>
      </div>
      <div style={styles.chatMessages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={
              msg.senderId === user.uid
                ? { ...styles.messageBubble, ...styles.messageSent }
                : { ...styles.messageBubble, ...styles.messageReceived }
            }
          >
            {msg.text}
            {msg.imageUrl && (
              <img src={msg.imageUrl} alt="upload" style={styles.chatImage} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={styles.chatInputForm}>
        <label htmlFor="gallery-upload" style={styles.imageUploadLabel}>
          <GalleryIcon />
        </label>
        <input
          id="gallery-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <label htmlFor="camera-upload" style={styles.imageUploadLabel}>
          <CameraIcon />
        </label>
        <input
          id="camera-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ ...styles.inputField, flex: 1 }}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          style={{
            ...styles.btn,
            width: "auto",
            padding: "0.5rem 1rem",
            background: "#4a47a3",
          }}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

const OrderDetailsModal = ({ order, otherUserProfile, onClose, isRhino }) => (
  <div style={styles.modalBackdrop}>
    <div style={styles.modalContent}>
      <button onClick={onClose} style={styles.modalCloseButton}>
        &times;
      </button>
      <h2 style={styles.formTitle}>Order Details</h2>

      <div style={styles.orderDetailsProfileContainer}>
        <img
          src={
            otherUserProfile?.photoURL ||
            "https://placehold.co/60x60/e5e7eb/333?text=User"
          }
          alt="Profile"
          style={styles.orderDetailsProfileImage}
        />
        <div>
          <h3 style={{ margin: 0, border: "none" }}>
            {isRhino ? "Buyer Details" : "Rhino Details"}
          </h3>
          <p style={{ margin: 0 }}>{otherUserProfile?.fullName}</p>
          <p style={{ margin: 0 }}>
            {otherUserProfile?.hostel} - {otherUserProfile?.roomNumber}
          </p>
          <p style={{ margin: 0 }}>Contact: {otherUserProfile?.phoneNumber}</p>
        </div>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Pickup & Drop-off</h3>
      <p>
        <strong>From:</strong> {order.from}
      </p>
      {order.pickupDetails && (
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          {" "}
          ↳ {order.pickupDetails}
        </p>
      )}
      <p>
        <strong>To:</strong> {order.to}
      </p>
      {order.dropoffDetails && (
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          {" "}
          ↳ {order.dropoffDetails}
        </p>
      )}

      <button onClick={onClose} style={{ ...styles.btn, marginTop: "1.5rem" }}>
        Close
      </button>
    </div>
  </div>
);

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <style>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            `}</style>
      <div style={styles.notificationPopup}>
        <ChatIcon /> {message}
      </div>
    </>
  );
};

// --- MAIN DASHBOARD & APP ---
function RhinocartDashboard({ user, onLogout, profile }) {
  const [activeTab, setActiveTab] = useState("Request to Order");
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContextOrder, setChatContextOrder] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [notification, setNotification] = useState(null);
  const [highlightDeliveries, setHighlightDeliveries] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false); // New state for notification prompt
  const isInitialOpenOrdersLoad = useRef(true);

  const activeOrderForBuyer = orders.find(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );
  const allUserOrdersAndDeliveries = [...orders, ...deliveries];

  const fetchUserProfile = async (userId) => {
    if (!userId || userProfiles[userId]) return;
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      setUserProfiles((prev) => ({ ...prev, [userId]: userDoc.data() }));
    }
  };

  // Check for notification permission prompt on profile load
  useEffect(() => {
    if (profile && profile.notificationsEnabled === null) {
      setShowNotificationPrompt(true);
    }
  }, [profile]);

  useEffect(() => {
    // Listener for new open orders
    const openOrdersQuery = query(
      collection(db, "orders"),
      where("status", "==", "searching"),
    );
    const unsubOpenOrders = onSnapshot(openOrdersQuery, (snapshot) => {
      if (isInitialOpenOrdersLoad.current) {
        isInitialOpenOrdersLoad.current = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const orderData = change.doc.data();
          if (orderData.requesterId !== user.uid) {
            // In-app notification
            setNotification("New delivery available!");

            // System notification
            if (
              profile?.notificationsEnabled &&
              Notification.permission === "granted"
            ) {
              new Notification("New RhinoCart Delivery!", {
                body: `Items: "${orderData.items}" from ${orderData.from}.`,
                tag: "new-order", // Prevents spamming notifications
              });
            }
          }
        }
      });
    });

    return () => unsubOpenOrders();
  }, [user.uid, profile]);

  useEffect(() => {
    const userIdsToFetch = new Set();
    allUserOrdersAndDeliveries.forEach((order) => {
      if (order.rhinoId) userIdsToFetch.add(order.rhinoId);
      if (order.requesterId) userIdsToFetch.add(order.requesterId);
    });
    userIdsToFetch.forEach((id) => fetchUserProfile(id));
  }, [orders, deliveries]);

  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      where("requesterId", "==", user.uid),
    );
    const deliveriesQuery = query(
      collection(db, "orders"),
      where("rhinoId", "==", user.uid),
    );
    const unsubOrders = onSnapshot(ordersQuery, (snap) =>
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    const unsubDeliveries = onSnapshot(deliveriesQuery, (snap) =>
      setDeliveries(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubOrders();
      unsubDeliveries();
    };
  }, [user.uid]);

  const onAcceptSuccess = () => {
    setHighlightDeliveries(true);
    setNotification("Delivery accepted! Check 'My Deliveries'.");
    setTimeout(() => {
      setHighlightDeliveries(false);
    }, 4000);
  };

  const handleOrderAction = async (action, order) => {
    if (action === "chat") {
      const otherUserId =
        user.uid === order.requesterId ? order.rhinoId : order.requesterId;
      const otherUserProfile = userProfiles[otherUserId];
      setChatContextOrder({ ...order, otherUserProfile }); // Pass profile inside context
      setIsChatOpen(true);
      return;
    }
    if (action === "viewDetails") {
      setSelectedOrderForDetails(order);
      return;
    }

    const orderRef = doc(db, "orders", order.id);
    if (action === "cancel") await deleteDoc(orderRef);
    if (action === "cancelOrder")
      await updateDoc(orderRef, { status: "cancelled" }); // New cancel action
    if (action === "retry")
      await updateDoc(orderRef, {
        status: "searching",
        rhinoId: null,
        rhinoEmail: null,
        itemPrice: null,
        deliveryFee: null,
      });
    if (action === "accept") await updateDoc(orderRef, { status: "confirmed" });
    if (action === "rhinoDelivered")
      await updateDoc(orderRef, { status: "deliveryPendingConfirmation" });
    if (action === "buyerConfirmDelivery")
      await updateDoc(orderRef, { status: "delivered" });
  };

  const renderActiveOrderStatus = () => {
    if (!activeOrderForBuyer) return null;
    switch (activeOrderForBuyer.status) {
      case "searching":
        return (
          <div style={styles.activeOrderBanner}>
            <CompactSearchingView
              onCancel={() => handleOrderAction("cancel", activeOrderForBuyer)}
            />
          </div>
        );
      case "pendingConfirmation":
        return (
          <div style={styles.activeOrderBanner}>
            <BuyerConfirmationView
              order={activeOrderForBuyer}
              onAction={handleOrderAction}
            />
          </div>
        );
      case "confirmed":
        return (
          <div style={styles.activeOrderBanner}>
            <ConfirmedOrderView
              order={activeOrderForBuyer}
              isRhino={false}
              onAction={handleOrderAction}
              userProfiles={userProfiles}
            />
          </div>
        );
      case "deliveryPendingConfirmation":
        return (
          <div style={styles.activeOrderBanner}>
            <ConfirmedOrderView
              order={activeOrderForBuyer}
              isRhino={false}
              onAction={handleOrderAction}
              userProfiles={userProfiles}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "Request to Order":
        return <RequestOrderView user={user} />;
      case "Open for Deliveries":
        return (
          <OpenForDeliveriesView
            user={user}
            onAcceptSuccess={onAcceptSuccess}
          />
        );
      case "My Orders":
        return (
          <MyOrdersView
            orders={orders}
            onAction={handleOrderAction}
            userProfiles={userProfiles}
          />
        );
      case "My Deliveries":
        return (
          <MyDeliveriesView
            deliveries={deliveries}
            onAction={handleOrderAction}
            userProfiles={userProfiles}
          />
        );
      default:
        return <RequestOrderView user={user} />;
    }
  };

  const otherUserForDetails = selectedOrderForDetails
    ? userProfiles[
        user.uid === selectedOrderForDetails.requesterId
          ? selectedOrderForDetails.rhinoId
          : selectedOrderForDetails.requesterId
      ]
    : null;

  return (
    <div style={styles.dashboardLayout}>
      <style>{`
          @keyframes pulse-animation {
              0% { box-shadow: 0 0 0 0 rgba(74, 71, 163, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(74, 71, 163, 0); }
              100% { box-shadow: 0 0 0 0 rgba(74, 71, 163, 0); }
          }
      `}</style>
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onProfileClick={() => setIsProfileModalOpen(true)}
        highlightDeliveries={highlightDeliveries}
        onContactClick={() => setIsContactModalOpen(true)}
      />
      {showNotificationPrompt && (
        <NotificationPermissionModal
          user={user}
          onClose={() => setShowNotificationPrompt(false)}
        />
      )}
      {isProfileModalOpen && (
        <ProfileView
          user={user}
          profile={profile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
      {isContactModalOpen && (
        <ContactUsModal onClose={() => setIsContactModalOpen(false)} />
      )}
      {isChatOpen && chatContextOrder && (
        <ChatView
          order={chatContextOrder}
          user={user}
          onClose={() => {
            setIsChatOpen(false);
            setChatContextOrder(null);
          }}
        />
      )}
      {selectedOrderForDetails && otherUserForDetails && (
        <OrderDetailsModal
          order={selectedOrderForDetails}
          otherUserProfile={otherUserForDetails}
          isRhino={user.uid === selectedOrderForDetails.rhinoId}
          onClose={() => setSelectedOrderForDetails(null)}
        />
      )}
      {renderActiveOrderStatus()}
      <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={styles.mainContent}>{renderMainContent()}</main>
      <div onClick={onLogout} style={styles.logoutButton}>
        Logout
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState("");
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      const unsubProfile = onSnapshot(
        doc(db, "users", currentUser.uid),
        async (userDoc) => {
          await currentUser.reload();
          if (currentUser.emailVerified) {
            if (userDoc.exists() && userDoc.data().profileComplete) {
              setUserProfile(userDoc.data());
              setUser(currentUser);
            } else {
              setUser(currentUser);
              setUserProfile({ profileComplete: false });
            }
          } else {
            await signOut(auth);
            setError("Please verify your email.");
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching profile:", error);
          setUser(currentUser);
          setUserProfile({ profileComplete: false });
          setLoading(false);
        },
      );
      return () => unsubProfile();
    });
    return () => unsubAuth();
  }, []);
  const handleRegister = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setRegistrationEmail(email);
      setView("emailVerification");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await userCredential.user.reload();
      if (!auth.currentUser.emailVerified) {
        await signOut(auth);
        setError("Please verify your email before logging in.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    await signOut(auth);
  };
  const handleProfileComplete = () => {};

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (user) {
      if (userProfile && userProfile.profileComplete) {
        return (
          <RhinocartDashboard
            user={user}
            onLogout={handleLogout}
            profile={userProfile}
          />
        );
      } else {
        return (
          <ProfileSetupView
            user={user}
            onProfileComplete={handleProfileComplete}
          />
        );
      }
    }
    return (
      <div style={styles.authPage}>
        {error && <div style={styles.errorMessage}>{error}</div>}
        {view === "login" && (
          <LoginView setView={setView} onLogin={handleLogin} />
        )}
        {view === "register" && (
          <RegisterView setView={setView} onRegister={handleRegister} />
        )}
        {view === "emailVerification" && (
          <EmailVerificationView setView={setView} email={registrationEmail} />
        )}
      </div>
    );
  };
  return <div style={styles.appContainer}>{renderContent()}</div>;
}
