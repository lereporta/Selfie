import { storage, ref, uploadBytesResumable, getDownloadURL } from './index.html';

// Configurar a câmera
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Erro ao acessar a câmera: " + err);
        showMessage("Erro ao acessar a câmera: " + err.message);
    });

// Tirar a foto e aplicar a moldura
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

document.getElementById('snap').addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Adicionar enquadramento
    context.strokeStyle = 'red';
    context.lineWidth = 10;
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Adicionar legenda
    context.font = '30px Arial';
    context.fillStyle = 'white';
    context.fillText('XV MaFer', 10, canvas.height - 20);
});

// Salvar no Firebase Storage
document.getElementById('save').addEventListener('click', () => {
    canvas.toBlob(blob => {
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
                });
            }
        );
    });
});

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'block';
    messageDiv.innerHTML = message;
}
