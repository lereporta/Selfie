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
    frameCanvas.width = video.videoWidth;
    frameCanvas.height = video.videoHeight;
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    // Carregar a moldura
    const frameContext = frameCanvas.getContext('2d');
    const frameImage = new Image();
    frameImage.src = 'frame'; // Verifique se o caminho da imagem está correto
    frameImage.onload = () => {
        frameContext.drawImage(frameImage, 0, 0, frameCanvas.width, frameCanvas.height);
        console.log("Moldura carregada");
    };
}

// Tirar a foto e aplicar a moldura
const captureCanvas = document.getElementById('canvas');
const captureContext = captureCanvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    console.log("Botão Tirar Foto clicado");
    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    // Adicionar a moldura
    const frameImage = new Image();
    frameImage.src = 'frame'; // Verifique se o caminho da imagem está correto
    frameImage.onload = () => {
        captureContext.drawImage(frameImage, 0, 0, captureCanvas.width, captureCanvas.height);

        // Adicionar legenda
        captureContext.font = '30px Arial';
        captureContext.fillStyle = 'white';
        captureContext.fillText('XV MaFer', 10, captureCanvas.height - 20);
        captureCanvas.style.display = 'block';
        console.log("Foto tirada e moldura aplicada");
    };
});

// Salvar no Firebase Storage
document.getElementById('save').addEventListener('click', () => {
    console.log("Botão Salvar clicado");
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
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    showMessage(`Arquivo salvo com sucesso! URL: <a href="${downloadURL}" target="_blank">${downloadURL}</a>`);
                }).catch(err => {
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
