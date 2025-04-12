let map;
let marker;
let watchId;
let users = {};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        mapTypeId: 'satellite',
        styles: [
            {
                featureType: 'all',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });

    // Tentar obter a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                
                // Criar marcador inicial
                marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'Sua localização'
                });
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                // Centralizar em uma posição padrão (por exemplo, São Paulo)
                map.setCenter({ lat: -23.550520, lng: -46.633308 });
            }
        );
    }
}

function startSharing() {
    const name = document.getElementById('name').value;
    const moto = document.getElementById('moto').value;
    
    if (!name || !moto) {
        alert('Por favor, preencha seu nome e modelo da moto.');
        return;
    }

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Atualizar marcador
                if (marker) {
                    marker.setPosition(pos);
                } else {
                    marker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        title: name
                    });
                }

                // Atualizar mapa
                map.setCenter(pos);

                // Aqui você pode implementar a lógica para enviar a localização
                // para um servidor ou serviço de tempo real
                console.log(`Compartilhando localização de ${name} com moto ${moto}`);
            },
            (error) => {
                console.error('Erro ao compartilhar localização:', error);
                alert('Erro ao compartilhar localização. Por favor, verifique suas permissões.');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'block';
    } else {
        alert('Geolocalização não é suportada neste navegador.');
    }
}

function stopSharing() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    
    if (marker) {
        marker.setMap(null);
        marker = null;
    }

    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
}

// Inicializar o mapa quando a página carregar
window.initMap = initMap; 