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
navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 } } })
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
    const captureCanvas = document.getElementById('capture-canvas');
    
    // Definindo uma proporção quadrada baseada no menor lado
    const size = Math.min(video.videoWidth, video.videoHeight);
    frameCanvas.width = size;
    frameCanvas.height = size;
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const frameContext = frameCanvas.getContext('2d');
    const frameImage = new Image();
    frameImage.src = 'moldura.svg';
    frameImage.onload = () => {
        frameContext.drawImage(frameImage, 0, 0, size, size);
    };
}

// Tirar a foto e aplicar a moldura sem esticar a imagem
const captureCanvas = document.getElementById('capture-canvas');
const captureContext = captureCanvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    captureContext.clearRect(0, 0, captureCanvas.width, captureCanvas.height); // Clear canvas first

    // Capturar a imagem mantendo a proporção original
    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    const frameImage = new Image();
    frameImage.src = 'moldura.svg';
    frameImage.onload = () => {
        captureContext.drawImage(frameImage, 0, 0, captureCanvas.width, captureCanvas.height);
        captureCanvas.style.display = 'block';
        document.getElementById('video').style.display = 'none';
        document.getElementById('back').style.display = 'block';
    };
});

// Voltar à câmera
document.getElementById('back').addEventListener('click', () => {
    captureCanvas.style.display = 'none';
    document.getElementById('video').style.display = 'block';
    document.getElementById('back').style.display = 'none';
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
    }, 'image/png', 1.0); // Especifica 'image/png' para qualidade máxima e 1.0 para máxima qualidade
});
