import { db, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const fileInput = document.getElementById('fileInput');
const guestNameInput = document.getElementById('guestName');
const guestMessageInput = document.getElementById('guestMessage');
const submitBtn = document.getElementById('submitBtn');
const gallery = document.getElementById('gallery');

submitBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const guestName = guestNameInput.value.trim();
  const guestMessage = guestMessageInput.value.trim();

  if (!file) return alert("Please select a photo first!");
  if (!guestName || !guestMessage) return alert("Please enter your name and message!");

  try {
    // Upload to Storage
    const storageRef = ref(storage, `photos/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Save to Firestore
    await addDoc(collection(db, "photos"), {
      imageUrl: url,
      name: guestName,
      message: guestMessage,
      timestamp: new Date().toISOString()
    });

    alert("✅ Photo and message uploaded successfully!");
    fileInput.value = '';
    guestNameInput.value = '';
    guestMessageInput.value = '';

    loadGallery(); // refresh gallery
  } catch (err) {
    console.error(err);
    alert("❌ Error uploading photo. Check console.");
  }
});

// Load all photos from Firestore
async function loadGallery() {
  gallery.innerHTML = '';
  const q = query(collection(db, "photos"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.className = 'polaroid';
    div.innerHTML = `
      <img src="${data.imageUrl}" alt="Guest Photo">
      <p><strong>${data.name}</strong></p>
      <p>${data.message}</p>
    `;
    gallery.appendChild(div);
  });
}

// Load gallery on page load
loadGallery();
