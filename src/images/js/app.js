// Variáveis globais
let nameInput;
let modelInput;
let startBtn;
let stopBtn;
let mapContainer;
let map;
let marker;
let watchId;
let isTracking = false;

// Objeto para armazenar marcadores de outros usuários
const userMarkers = new Map();

// Dados simulados de outros usuários (para teste)
const mockUsers = [
    { id: 'user1', name: 'João', model: 'Honda CB 500', lat: -23.550520, lng: -46.633308 },
    { id: 'user2', name: 'Maria', model: 'Yamaha MT-07', lat: -23.555994, lng: -46.639825 },
    { id: 'user3', name: 'Pedro', model: 'Kawasaki Z400', lat: -23.548091, lng: -46.638738 }
];

// Sobrescreve a função initMap do placeholder
window.initMap = function() {
    // Coordenadas iniciais (centro do Brasil)
    const initialPosition = { lat: -15.7801, lng: -47.9292 };

    mapContainer = document.getElementById('map');
    
    // Criação do mapa
    map = new google.maps.Map(mapContainer, {
        zoom: 5,
        center: initialPosition,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Criação do marcador inicial
    marker = new google.maps.Marker({
        position: initialPosition,
        map: map,
        title: 'Sua localização',
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
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

    // Adiciona marcadores de outros usuários
    addMockUsers();

    console.log('Mapa inicializado com sucesso!');
}

// Função para adicionar usuários simulados
function addMockUsers() {
    mockUsers.forEach(user => {
        const position = { lat: user.lat, lng: user.lng };
        addUserMarker(user.id, user.name, user.model, position);
    });
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

    // Adiciona animação ao passar o mouse
    marker.addListener('mouseover', () => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    });

    marker.addListener('mouseout', () => {
        marker.setAnimation(null);
    });

    // Abre a janela de informações ao clicar
    marker.addListener('click', () => {
        // Fecha todas as outras janelas de informação
        userMarkers.forEach((value) => {
            value.infowindow.close();
        });
        infowindow.open(map, marker);
    });

    userMarkers.set(userId, { marker, infowindow });
}

// Função para atualizar posição de um usuário
function updateUserPosition(userId, position) {
    const userMarker = userMarkers.get(userId);
    if (userMarker) {
        userMarker.marker.setPosition(position);
    }
}

// Função para remover marcador de um usuário
function removeUserMarker(userId) {
    const userMarker = userMarkers.get(userId);
    if (userMarker) {
        userMarker.marker.setMap(null);
        userMarkers.delete(userId);
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

    isTracking = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    stopBtn.style.display = 'block';
    
    // Atualizar status visual
    startBtn.classList.add('disabled');
    stopBtn.classList.remove('disabled');

    // Opções de geolocalização
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    watchId = navigator.geolocation.watchPosition(
        updatePosition,
        handleError,
        options
    );

    // Salvar dados do usuário
    localStorage.setItem('userData', JSON.stringify({
        name: nameInput.value,
        model: modelInput.value
    }));

    // Simular movimento dos outros usuários
    startMockUsersMovement();
}

// Função para atualizar a posição
function updatePosition(position) {
    const { latitude, longitude } = position.coords;
    const newPosition = { lat: latitude, lng: longitude };

    // Atualiza o marcador e centraliza o mapa
    marker.setPosition(newPosition);
    map.panTo(newPosition);
    
    if (map.getZoom() < 15) {
        map.setZoom(15);
    }
}

// Função para simular movimento dos outros usuários
function startMockUsersMovement() {
    mockUsers.forEach(user => {
        setInterval(() => {
            if (isTracking) {
                // Simula pequenas mudanças na posição
                const newLat = user.lat + (Math.random() - 0.5) * 0.001;
                const newLng = user.lng + (Math.random() - 0.5) * 0.001;
                updateUserPosition(user.id, { lat: newLat, lng: newLng });
            }
        }, 3000);
    });
}

// Função para parar o compartilhamento
function stopSharing() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    isTracking = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    stopBtn.style.display = 'none';

    // Atualizar status visual
    startBtn.classList.remove('disabled');
    stopBtn.classList.add('disabled');
}

// Função para lidar com erros de geolocalização
function handleError(error) {
    let message = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Permissão para geolocalização negada.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível.';
            break;
        case error.TIMEOUT:
            message = 'Tempo esgotado ao obter localização.';
            break;
        default:
            message = 'Erro desconhecido ao obter localização.';
    }

    alert(message);
    stopSharing();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos do DOM
    nameInput = document.getElementById('nameInput');
    modelInput = document.getElementById('modelInput');
    startBtn = document.getElementById('startBtn');
    stopBtn = document.getElementById('stopBtn');

    // Carregar dados salvos
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        nameInput.value = userData.name;
        modelInput.value = userData.model;
    }

    // Adicionar listeners aos botões
    startBtn.addEventListener('click', startSharing);
    stopBtn.addEventListener('click', stopSharing);

    // Configurar estado inicial dos botões
    stopBtn.disabled = true;
    stopBtn.style.display = 'none';
    stopBtn.classList.add('disabled');
});

// Limpar rastreamento ao fechar/recarregar a página
window.addEventListener('beforeunload', () => {
    if (isTracking) {
        stopSharing();
    }
}); 