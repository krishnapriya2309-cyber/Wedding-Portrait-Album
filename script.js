const cameraBtn = document.getElementById('cameraBtn');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const submitBtn = document.getElementById('submitBtn');
let files = [];

// Gallery upload preview
fileInput.addEventListener('change', (e) => {
  files = Array.from(e.target.files);
  preview.innerHTML = '';
  files.forEach((file, index) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.width = 120;
    img.style.margin = '10px';
    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.onclick = () => { files.splice(index, 1); img.remove(); delBtn.remove(); };
    preview.appendChild(img);
    preview.appendChild(delBtn);
  });
});

// Submit files and text message
submitBtn.addEventListener('click', async () => {
  const textMsg = document.getElementById('textMsg').value;

  // Upload photos
  files.forEach(async (file) => {
    const storageRef = storage.ref(`wedding_photos/${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    await db.collection('uploads').add({
      type: 'photo',
      url: url,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      visibility: 'public'
    });
  });

  // Upload text message
  if (textMsg) {
    await db.collection('uploads').add({
      type: 'text',
      message: textMsg,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      visibility: 'private'
    });
  }

  alert("Upload Successful!");
});
