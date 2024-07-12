// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDV447G0fPHuVoITWjXMJ-_uoZJ8LhA994",
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
navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
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

// Ajustar o tamanho do canvas para corresponder à resolução desejada
function adjustCanvasSize() {
    const frameCanvas = document.getElementById('frame-canvas');
    const captureCanvas = document.getElementById('canvas');
    
    // Definindo uma proporção quadrada baseada no menor lado
    const size = Math.min(video.videoWidth, video.videoHeight);
    frameCanvas.width = size;
    frameCanvas.height = size;
    captureCanvas.width = size;
    captureCanvas.height = size;

    const frameContext = frameCanvas.getContext('2d');
    const frameImage = new Image();
    frameImage.src = 'moldura.svg';
    frameImage.onload = () => {
        frameContext.drawImage(frameImage, 0, 0, size, size);
    };
}

// Tirar a foto e aplicar a moldura sem esticar a imagem
const captureCanvas = document.getElementById('canvas');
const captureContext = captureCanvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    captureContext.clearRect(0, 0, captureCanvas.width, captureCanvas.height); // Clear canvas first

    // Definindo uma proporção quadrada baseada no menor lado
    const size = Math.min(video.videoWidth, video.videoHeight);
    const aspectRatio = video.videoWidth / video.videoHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (aspectRatio > 1) {
        // Wide image
        drawHeight = size;
        drawWidth = size * aspectRatio;
        offsetX = -(drawWidth - size) / 2;
        offsetY = 0;
    } else {
        // Tall image
        drawWidth = size;
        drawHeight = size / aspectRatio;
        offsetX = 0;
        offsetY = -(drawHeight - size) / 2;
    }

    captureContext.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

    const frameImage = new Image();
    frameImage.src = 'moldura.svg';
    frameImage.onload = () => {
        captureContext.drawImage(frameImage, 0, 0, captureCanvas.width, captureCanvas.height);
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
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
                showMessage(`Upload is ${progress}% done`);
            },
            (error) => {
                showMessage(`Erro ao salvar o arquivo: ${error.message}`);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    showMessage(`Arquivo salvo com sucesso! URL: <a href="${downloadURL}" target="_blank">${downloadURL}</a>`);
                }).catch(err => {
                    showMessage(`Erro ao obter o URL de download: ${err.message}`);
                });
            }
        );
    }, 'image/png'); // Especifica 'image/png' para qualidade máxima
});
