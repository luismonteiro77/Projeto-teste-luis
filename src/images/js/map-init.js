let map;
let markers = [];

function initMap() {
    // Configuração inicial do mapa
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 38.7223, lng: -9.1393 }, // Centro em Lisboa
        zoom: 8,
        mapTypeId: 'hybrid', // Modo híbrido (satélite + etiquetas)
        mapTypeControl: false // Desativa o controle de tipo de mapa temporariamente
    });

    // Tenta obter a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(location);
                map.setZoom(12);
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
            }
        );
    }
} 