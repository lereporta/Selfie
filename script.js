// script.js

const CLIENT_ID = 'SEU_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

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
const frame = document.getElementById('frame');

document.getElementById('snap').addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.drawImage(frame, 0, 0, canvas.width, canvas.height);
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
            });
        });
    }

    function saveFile() {
        canvas.toBlob(blob => {
            const file = new File([blob], "selfie_com_moldura.png", { type: 'image/png' });

            const metadata = {
                'name': file.name,
                'mimeType': file.type
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
            .then(value => console.log(value))
            .catch(err => console.error("Erro ao carregar o arquivo: " + err));
        });
    }
});
