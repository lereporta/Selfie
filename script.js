// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your_api_key",
    authDomain: "your_project_id.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project_id.appspot.com",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id"
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

    const ratio = video.videoWidth / video.videoHeight;
    const width = video.clientWidth;
    const height = width / ratio;

    frameCanvas.width = width;
    frameCanvas.height = height;
    captureCanvas.width = width;
    captureCanvas.height = height;

    const frameContext = frameCanvas.getContext('2d');
    if (!window.frameImage) {
        window.frameImage = new Image();
        window.frameImage.src = 'moldura.svg';
        window.frameImage.onload = () => {
            frameContext.drawImage(window.frameImage, 0, 0, width, height);
        };
    } else {
        frameContext.drawImage(window.frameImage, 0, 0, width, height);
    }
}

window.addEventListener('resize', adjustCanvasSize);
window.addEventListener('orientationchange', adjustCanvasSize);

// Tirar a foto e aplicar a moldura
const captureCanvas = document.getElementById('canvas');
const captureContext = captureCanvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    if (window.frameImage) {
        captureContext.drawImage(window.frameImage, 0, 0, captureCanvas.width, captureCanvas.height);
    }
    captureContext.font = '30px Arial';
    captureContext.fillStyle = 'white';
    captureContext.fillText('XV MaFer', 10, captureCanvas.height - 20);
    captureCanvas.style.display = 'block';
});

// Salvar no Firebase Storage
document.getElementById('save').addEventListener('click', () => {
    if (!captureCanvas.getContext('2d')) {
        console.error("Canvas está vazio");
        showMessage("Canvas está vazio");
        return;
    }

    captureCanvas.toBlob(blob => {
        if (!blob) {
            console.error("Falha ao criar imagem para upload");
            showMessage("Falha ao criar imagem para upload");
            return;
        }

        const storageRef = ref(storage, `selfies/${Date.now()}_selfie_com_moldura.png`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
                showMessage(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error(`Erro ao salvar o arquivo: ${error.message}`);
                showMessage(`Erro ao salvar o arquivo: ${error.message}`);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log(`Arquivo salvo com sucesso! URL: ${downloadURL}`);
                    showMessage(`Arquivo salvo com sucesso! URL: <a href="${downloadURL}" target="_blank">${downloadURL}</a>`);
                }).catch(err => {
                    console.error(`Erro ao obter o URL de download: ${err.message}`);
                    showMessage(`Erro ao obter o URL de download: ${err.message}`);
                });
            }
        );
    }, 'image/png');
});

// Ver Galeria
document.getElementById('view-gallery').addEventListener('click', () => {
    const galleryRef = ref(storage, 'selfies/');
    console.log('Tentando listar imagens na pasta selfies/');
    listAll(galleryRef)
        .then(res => {
            console.log('Imagens listadas:', res);
            const galleryDiv = document.getElementById('gallery');
            galleryDiv.innerHTML = ''; // Limpar galeria
            res.items.forEach(itemRef => {
                getDownloadURL(itemRef).then(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.className = 'gallery-image';
                    img.width = 150;
                    galleryDiv.appendChild(img);
                }).catch(err => {
                    console.error('Erro ao obter o URL de download:', err);
                    showMessage(`Erro ao obter o URL de download: ${err.message}`);
                });
            });
        })
        .catch(err => {
            console.error('Erro ao listar imagens:', err);
            showMessage(`Erro ao listar imagens: ${err.message}`);
        });
});
