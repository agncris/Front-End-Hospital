if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    console.log('Service Worker registrado con éxito:', registration);

    // Escuchar actualizaciones del Service Worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Notificar al usuario sobre la nueva versión
          if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
            newWorker.postMessage('SKIP_WAITING');
          }
        }
      });
    });
  }).catch((error) => {
    console.error('Error al registrar el Service Worker:', error);
  });
}

// Función para acceder a la cámara
function accessCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const videoElement = document.querySelector('#camera');
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play();
        }
      })
      .catch((error) => {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Verifica los permisos.');
      });
  } else {
    alert('La cámara no es compatible con este dispositivo.');
  }
}

// Función para obtener la geolocalización
function accessGeolocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Ubicación obtenida: Latitud ${latitude}, Longitud ${longitude}`);
        alert(`Tu ubicación actual es: Latitud ${latitude}, Longitud ${longitude}`);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo obtener la ubicación. Verifica los permisos.');
      }
    );
  } else {
    alert('La geolocalización no es compatible con este dispositivo.');
  }
}

// Función para consumir la API externa
async function fetchMedicalData() {
  const apiUrl = 'https://api.example.com/medical-data'; // Reemplaza con la URL real de la API

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    displayMedicalData(data);
  } catch (error) {
    console.error('Error al consumir la API:', error);
    alert('No se pudo obtener la información médica. Intenta nuevamente más tarde.');
  }
}

// Función para mostrar los datos obtenidos de la API
function displayMedicalData(data) {
  const container = document.querySelector('#medicalDataContainer');
  if (!container) return;

  container.innerHTML = ''; // Limpiar contenido previo

  data.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'medical-item';
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
    `;
    container.appendChild(div);
  });
}

// Event listeners para botones de cámara y geolocalización
document.querySelector('#cameraButton')?.addEventListener('click', accessCamera);
document.querySelector('#geolocationButton')?.addEventListener('click', accessGeolocation);

// Event listener para cargar datos médicos al hacer clic en un botón
document.querySelector('#fetchMedicalDataButton')?.addEventListener('click', fetchMedicalData);

