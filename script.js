// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your_api_key",
    authDomain: "your_project_id.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project_id.appspot.com",
    messagingSenderId: "your_sender_id",
    appId: "1:your_sender_id:web:your_app_id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

document.getElementById('snap').addEventListener('click', () => {
    const video = document.getElementById('video');
    const previewCanvas = document.getElementById('preview');
    previewCanvas.style.display = 'block'; // Show the canvas
    const context = previewCanvas.getContext('2d');
    context.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
    video.style.display = 'none'; // Hide the video element
});

document.getElementById('save').addEventListener('click', () => {
    const previewCanvas = document.getElementById('preview');
    previewCanvas.toBlob(blob => {
        const storageRef = ref(storage, `selfies/${Date.now()}_selfie_com_moldura.png`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error(`Erro ao salvar o arquivo: ${error.message}`);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log(`Arquivo salvo com sucesso! URL: ${downloadURL}`);
                });
            }
        );
    }, 'image/png');
});
