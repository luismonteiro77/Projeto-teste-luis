// Função para adicionar marcador no mapa
function addMarker(location, name, motoBrand) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: `${name} - ${motoBrand}`
    });

    // Adiciona uma janela de informação ao clicar no marcador
    const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px;">
            <strong>${name}</strong><br>
            Moto: ${motoBrand}
        </div>`
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    markers.push(marker);
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
                map.setZoom(14);
                
                // Limpa o formulário
                document.getElementById('userForm').reset();
                
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