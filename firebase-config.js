// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1pSEnOZaqPczZj-mUwWlxjJQTv29CfS4",
  authDomain: "weddingportraitalbum.firebaseapp.com",
  databaseURL: "https://weddingportraitalbum-default-rtdb.firebaseio.com",
  projectId: "weddingportraitalbum",
  storageBucket: "weddingportraitalbum.firebasestorage.app",
  messagingSenderId: "292563754821",
  appId: "1:292563754821:web:42d167f3e8deb3159e282c"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

