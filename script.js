// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDV447G0fPHuVoITWJ-_uoZJ8LhA994",
    authDomain: "testedoteste-d5361.firebaseapp.com",
    projectId: "testedoteste-d5361",
    storageBucket: "testedoteste-d5361.appspot.com",
    messagingSenderId: "199930490793",
    appId: "1:199930490793:web:c79d02d9ddd2635e2e9eb8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Função para exibir mensagens
function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'block';
    messageDiv.innerHTML = message;
}

// Configurar a câmera
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            adjustCanvasSize();
        };
    })
    .catch(err => {
        console.error("Erro ao acessar a câmera: " + err);
        showMessage("Erro ao acessar a câmera: " + err.message);
    });

// Ajustar o tamanho do canvas para corresponder ao vídeo
function adjustCanvasSize() {
    const video = document.getElementById('video');
    const frameCanvas = document.getElementById('frame-canvas');
    const captureCanvas = document.getElementById('canvas');
    frameCanvas.width = video.videoWidth;
    frameCanvas.height = video.videoHeight;
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    // Carregar a moldura
    const frameContext = frameCanvas.getContext('2d');
    const frameImage = new Image();
    frameImage.src = 'frame'; // Este deveria ser o caminho para sua imagem de moldura
    frameImage.onload = () => {
        frameContext.drawImage(frameImage, 0, 0, frameCanvas.width, frameCanvas.height);
    };
}

// Tirar a foto e aplicar a moldura
const captureCanvas = document.getElementById('canvas');
const captureContext = captureCanvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    // Adicionar a moldura
    const frameImage = new Image();
    frameImage.src = 'frame'; // Este deveria ser o caminho para sua imagem de moldura
    frameImage.onload = () => {
        captureContext.drawImage(frameImage, 0, 0, captureCanvas.width, captureCanvas.height);

        // Adicionar legenda
        captureContext.font = '30px Arial';
        captureContext.fillStyle = 'white';
        captureContext.fillText('XV MaFer', 10, captureCanvas.height - 20);
        captureCanvas.style.display = 'block';
    };
});

// Salvar no Firebase Storage
document.getElementById('save').addEventListener('click', () => {
    captureCanvas.toBlob(blob => {
        const storageRef = ref(storage, `selfies/${Date.now()}_selfie_com_moldura.png`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Progresso da upload
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                showMessage(`Erro ao salvar o arquivo: ${error.message}`);
            },
            () => {
                getDownloadURL(uploadTask.sn
