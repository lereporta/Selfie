// script.js

const CLIENT_ID = '586803069885-pbd20dijc609bom99brjjmcb95iqfu56.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_ID = '1JETlmonTdflu23qtdmzTe9gkn2rdry9J'; // ID da sua pasta

let tokenClient;
let gapiInited = false;
let gisInited = false;

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

// Carregar a API do Google Drive
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        'apiKey': 'YOUR_API_KEY', // Adicione sua API Key aqui
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    });
    gapiInited = true;
    maybeEnableButtons();
}

// Carregar a Google Identity Services API
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // O manipulador de resposta será definido mais tarde
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('save').disabled = false;
    }
}

document.getElementById('save').addEventListener('click', () => {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            showMessage('Erro ao fazer login: ' + resp.error);
            return;
        }
        saveFile();
    };

    if (gapi.client.getToken() === null) {
        // Solicitar acesso ao usuário
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Já autorizado, apenas salvar o arquivo
        saveFile();
    }
});

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
                'Authorization': 'Bearer ' + gapi.client.getToken().access_token
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
            showMessage("Erro ao carregar o arquivo: " + err.message);
        });
    });
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
}

// Carregar as APIs
window.onload = function() {
    gapiLoaded();
    gisLoaded();
};
