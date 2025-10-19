// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Elements
const fileInput = document.getElementById("fileInput");
const guestNameInput = document.getElementById("guestName");
const guestMessageInput = document.getElementById("guestMessage");
const privateMessage = document.getElementById("privateMessage");
const submitBtn = document.getElementById("submitBtn");
const gallery = document.getElementById("gallery");

const startBtn = document.getElementById("startRecording");
const stopBtn = document.getElementById("stopRecording");
const audioPlayback = document.getElementById("audioPlayback");

let mediaRecorder;
let audioChunks = [];

/* ------------------ 📸 Upload Photo + Message ------------------ */
submitBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  const name = guestNameInput.value.trim();
  const message = guestMessageInput.value.trim();
  const isPrivate = privateMessage.checked;

  if (!file || !name || !message) {
    alert("Please fill in all fields and select a photo!");
    return;
  }

  try {
    // Upload image to Storage
    const fileRef = ref(storage, `wedding_photos/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);

    // Save data in Firestore
    await addDoc(collection(db, "photos"), {
      name,
      message,
      imageUrl,
      private: isPrivate,
      timestamp: new Date().toISOString(),
    });

    alert("✅ Your photo & message have been uploaded!");

    // Reset fields
    fileInput.value = "";
    guestNameInput.value = "";
    guestMessageInput.value = "";
    privateMessage.checked = false;

    // Refresh gallery
    loadGallery();
  } catch (error) {
    console.error(error);
    alert("❌ Upload failed. Check the console for details.");
  }
});

/* ------------------ 🖼️ Load Gallery (Public Only) ------------------ */
async function loadGallery() {
  gallery.innerHTML = "";
  const q = query(collection(db, "photos"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.private) {
      const div = document.createElement("div");
      div.classList.add("photo-card");
      div.innerHTML = `
        <img src="${data.imageUrl}" alt="photo">
        <p><strong>${data.name}</strong></p>
        <p>${data.message}</p>
      `;
      gallery.appendChild(div);
    }
  });
}

loadGallery();

/* ------------------ 🎤 Voice Message (Private) ------------------ */
startBtn?.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.start();

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (err) {
    alert("🎤 Microphone access denied!");
    console.error(err);
  }
});

stopBtn?.addEventListener("click", async () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });

    // Upload voice message to Firebase Storage
    const storageRef = ref(storage, `voice/${audioFile.name}`);
    await uploadBytes(storageRef, audioFile);
    const audioUrl = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const name = guestNameInput.value.trim() || "Anonymous";
    await addDoc(collection(db, "voiceMessages"), {
      name,
      audioUrl,
      private: true,
      timestamp: new Date().toISOString(),
    });

    audioPlayback.src = audioUrl;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    alert("✅ Voice message uploaded!");
  };
});

