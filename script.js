// script.js

const CLIENT_ID = '586803069885-pbd20dijc609bom99brjjmcb95iqfu56.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_ID = '1JETlmonTdflu23qtdmzTe9gkn2rdry9J'; // ID da sua pasta

// Configurar a câmera
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Erro ao acessar a câmera: " + err);
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

// Salvar no Google Drive
document.getElementById('save').addEventListener('click', () => {
    gapi.load('client:auth2', initClient);

    function initClient() {
        gapi.client.init({
            clientId: CLIENT_ID,
            scope: SCOPES
        }).then(() => {
            gapi.auth2.getAuthInstance().signIn().then(() => {
                saveFile();
            }).catch(err => {
                showMessage("Erro ao fazer login: " + err);
            });
        }).catch(err => {
            showMessage("Erro ao inicializar cliente: " + err);
        });
    }

    function saveFile() {
        canvas.toBlob(blob => {
            const file = new File([blob], "selfie_com_moldura.png", { type: 'image/png' });

            const metadata = {
                'name': file.name,
                'mimeType': file.type,
                'parents': [FOLDER_ID] // Define a pasta onde o arquivo será salvo
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + gapi.auth.getToken().access_token
                },
                body: form
            }).then(response => response.json())
            .then(value => {
                if (value.id) {
                    showMessage("Arquivo salvo com sucesso!");
                } else {
                    showMessage("Erro ao salvar o arquivo.");
                }
            })
            .catch(err => {
                showMessage("Erro ao carregar o arquivo: " + err);
            });
        });
    }

    function showMessage(message) {
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'block';
        messageDiv.textContent = message;
    }
});
