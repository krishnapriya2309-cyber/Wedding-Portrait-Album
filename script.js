import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('submitBtn');

submitBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a photo first!");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result;
    await addDoc(collection(db, "photos"), {
      imageData: base64,
      timestamp: new Date().toISOString()
    });
    alert("✅ Photo uploaded successfully!");
  };

  reader.readAsDataURL(file);
});
