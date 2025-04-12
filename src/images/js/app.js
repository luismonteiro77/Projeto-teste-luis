// Variáveis globais
let nameInput;
let modelInput;
let startBtn;
let stopBtn;
let centerMapBtn;
let mapContainer;
let map;
let marker;
let watchId;
let isTracking = false;
let currentPosition = null;

// Objeto para armazenar marcadores de outros usuários
const userMarkers = new Map();

// Inicialização do mapa
window.initMap = function() {
    // Elementos do DOM
    nameInput = document.getElementById('nameInput');
    modelInput = document.getElementById('modelInput');
    startBtn = document.getElementById('startBtn');
    stopBtn = document.getElementById('stopBtn');
    centerMapBtn = document.getElementById('centerMapBtn');
    mapContainer = document.getElementById('map');

    // Configurar estado inicial dos botões
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    centerMapBtn.style.display = 'none';

    // Adicionar event listeners aos botões
    startBtn.addEventListener('click', startSharing);
    stopBtn.addEventListener('click', stopSharing);
    centerMapBtn.addEventListener('click', centerMap);

    // Carregar dados salvos
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        nameInput.value = userData.name;
        modelInput.value = userData.model;
    }

    // Coordenadas iniciais (Portugal continental)
    const initialPosition = { lat: 39.5, lng: -8.0 };
    
    // Criação do mapa
    map = new google.maps.Map(mapContainer, {
        zoom: 7,
        center: initialPosition,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Adiciona legenda ao mapa
    const legendDiv = document.createElement('div');
    legendDiv.innerHTML = `
        <div style="
            position: absolute;
            bottom: 30px;
            left: 10px;
            background: #222222;
            padding: 12px;
            border-radius: 5px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            font-size: 12px;
            border: 2px solid #FF6B00;
            color: white;
        ">
            <div style="margin-bottom: 8px;">
                <img src="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" width="20" height="20" style="vertical-align: middle;">
                <span style="margin-left: 5px; vertical-align: middle;">Sua localização</span>
            </div>
            <div>
                <img src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" width="20" height="20" style="vertical-align: middle;">
                <span style="margin-left: 5px; vertical-align: middle;">Outros motociclistas</span>
            </div>
        </div>
    `;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendDiv);

    // Tenta obter a localização inicial
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                map.setZoom(12);
            },
            (error) => {
                console.warn('Erro ao obter localização:', error);
            }
        );
    }

    console.log('Mapa inicializado com sucesso!');
}

// Função para adicionar marcador de outro usuário
function addUserMarker(userId, userName, userModel, position) {
    const infowindow = new google.maps.InfoWindow({
        content: `
            <div style="
                padding: 15px;
                font-family: Arial, sans-serif;
                max-width: 200px;
                background-color: #222222;
                color: #f5f5f5;
            ">
                <h3 style="
                    margin: 0 0 8px 0;
                    color: #FF6B00;
                    font-size: 16px;
                    border-bottom: 2px solid #FF6B00;
                    padding-bottom: 5px;
                    text-transform: uppercase;
                ">${userName}</h3>
                <p style="
                    margin: 0;
                    color: #f5f5f5;
                    font-size: 14px;
                ">
                    <strong style="color: #FF6B00;">Moto:</strong> ${userModel}
                </p>
                <p style="
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    color: #FF6B00;
                ">Online agora</p>
            </div>
        `
    });

    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: userName,
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    marker.addListener('click', () => {
        userMarkers.forEach((value) => {
            value.infowindow.close();
        });
        infowindow.open(map, marker);
    });

    userMarkers.set(userId, { marker, infowindow });
}

// Função para centralizar o mapa
function centerMap() {
    if (currentPosition) {
        map.panTo(currentPosition);
        map.setZoom(15);
    }
}

// Função para iniciar o compartilhamento
function startSharing() {
    if (!nameInput.value || !modelInput.value) {
        alert('Por favor, preencha seu nome e modelo da moto.');
        return;
    }

    if (!navigator.geolocation) {
        alert('Seu navegador não suporta geolocalização.');
        return;
    }

    // Salvar dados do usuário
    localStorage.setItem('userData', JSON.stringify({
        name: nameInput.value,
        model: modelInput.value
    }));

    isTracking = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    stopBtn.disabled = false;

    // Criar marcador se ainda não existe
    if (!marker) {
        marker = new google.maps.Marker({
            map: map,
            title: 'Sua localização',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });
    }

    // Mostrar botão de centralizar
    centerMapBtn.style.display = 'flex';

    // Iniciar rastreamento
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            currentPosition = pos; // Atualizar posição atual
            marker.setPosition(pos);
            map.panTo(pos);

            console.log('Localização atualizada:', pos);
        },
        (error) => {
            console.error('Erro ao obter localização:', error);
            stopSharing();
            alert('Erro ao obter sua localização. Por favor, verifique as permissões do navegador.');
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Função para parar o compartilhamento
function stopSharing() {
    console.log('Parando compartilhamento...');
    
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    isTracking = false;
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    centerMapBtn.style.display = 'none'; // Esconder botão de centralizar
    currentPosition = null;

    if (marker) {
        marker.setMap(null);
        marker = null;
    }

    console.log('Compartilhamento parado com sucesso!');
}

// Limpar rastreamento ao fechar/recarregar a página
window.addEventListener('beforeunload', () => {
    if (isTracking) {
        stopSharing();
    }
}); 