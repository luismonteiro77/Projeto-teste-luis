let map;
let markers = [];

function initMap() {
    // Configuração inicial do mapa
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -23.550520, lng: -46.633308 }, // Centro em São Paulo
        zoom: 8
    });
}

// Função para adicionar marcador no mapa
function addMarker(location, name, motoBrand) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: `${name} - ${motoBrand}`
    });

    // Adiciona uma janela de informação ao clicar no marcador
    const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${name}</strong><br>Moto: ${motoBrand}`
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    markers.push(marker);
}

// Função para obter a localização do usuário
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                return location;
            },
            (error) => {
                alert('Erro ao obter localização: ' + error.message);
                return null;
            }
        );
    } else {
        alert('Geolocalização não é suportada pelo seu navegador.');
        return null;
    }
}

// Manipulador do formulário
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const motoBrand = document.getElementById('motoBrand').value;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Adiciona o marcador no mapa
                addMarker(location, name, motoBrand);
                
                // Centraliza o mapa na nova localização
                map.setCenter(location);
                
                alert('Localização compartilhada com sucesso!');
            },
            (error) => {
                alert('Erro ao obter localização: ' + error.message);
            }
        );
    } else {
        alert('Geolocalização não é suportada pelo seu navegador.');
    }
}); 