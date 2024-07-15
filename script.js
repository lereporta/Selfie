// Importe as funções necessárias dos SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

//  Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDV447G0fPHuVoITWjXMJ-_uoZJ8LhA994",
    authDomain: "testedoteste-d5361.firebaseapp.com",
    projectId: "testedoteste-d5361",
    storageBucket: "testedoteste-d5361.appspot.com",
    messagingSenderId: "199930490793",
    appId: "1:199930490793:web:c79d02d9ddd2635e2e9eb8"
};

// Iniciaa Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// exibir mensagens
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

// Ajustar o tamanho do canvas 
function adjustCanvasSize() {
    const frameCanvas = document.getElementById('frame-canvas');
    const captureCanvas = document.getElementById('capture-canvas');
    
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

// Tirar a foto e aplicar a moldura
const captureCanvas = document.getElementById('capture-canvas');
const captureContext = captureCanvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    captureContext.clearRect(0, 0, captureCanvas.width, captureCanvas.height); // Clear canvas first

    // Espelhar o contexto de captura para corresponder à visualização
    captureContext.save();
    captureContext.scale(-1, 1);
    captureContext.drawImage(video, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height);
    captureContext.restore();

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
    document.getElementById('progress').style.display = 'none';
    document.getElementById('visualize').style.display = 'none';
});

// Salvar no Firebase Storage
document.getElementById('save').addEventListener('click', () => {
    document.getElementById('progress').style.display = 'block';
    captureCanvas.toBlob(blob => {
        const storageRef = ref(storage, `selfies/${Date.now()}_selfie_com_moldura.png`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed', 
            (snapshot) => {
                // Progresso do upload
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                const progressBar = document.getElementById('progress-bar');
                progressBar.style.width = progress + '%';
                progressBar.innerHTML = progress.toFixed(0) + '%';
            },
            (error) => {
                showMessage(`Erro ao salvar o arquivo: ${error.message}`);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    showMessage(`Foto salva!`);
                    const visualizeButton = document.getElementById('visualize');
                    visualizeButton.style.display = 'flex';
                    visualizeButton.style.padding = '15px';
                    visualizeButton.style.fontSize = '1rem';
                    visualizeButton.style.border = 'none';
                    visualizeButton.style.backgroundColor = 'white';
                    visualizeButton.style.color = 'black';
                    visualizeButton.style.cursor = 'pointer';
                    visualizeButton.style.borderRadius = '50%';
                    visualizeButton.style.width = '60px';
                    visualizeButton.style.height = '60px';
                    visualizeButton.style.justifyContent = 'center';
                    visualizeButton.style.alignItems = 'center';
                    visualizeButton.onclick = () => window.open(downloadURL, '_blank');
                }).catch(err => {
                    showMessage(`Erro ao obter o URL de download: ${err.message}`);
                });
            }
        );
    }, 'image/png', 1.0); //'image/png'  1.0 para máxima qualidade
});
