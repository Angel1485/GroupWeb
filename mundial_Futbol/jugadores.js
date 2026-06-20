// ========================================
// DEV A — ESTRUCTURA BASE DINÁMICA
// ========================================

// Arreglo global de cromos
const cromosMundial = [];

// Función constructora de jugador
function crearJugador(id, nombre, pais, posicion, urlImagen, urlBandera, colorFondoHex, estadisticas, destacado, curiosidad) {
    return {
        id: id,
        nombre: nombre,
        pais: pais,
        posicion: posicion,
        urlImagen: urlImagen,
        urlBandera: urlBandera,
        colorFondoHex: colorFondoHex,
        estadisticas: {
            goles: estadisticas.goles || 0,
            partidos: estadisticas.partidos || 0
        },
        destacado: destacado || false,
        curiosidad: curiosidad || '',
        desbloqueado: false
    };
}

// Función de renderizado del álbum
function renderizarAlbum() {
    const container = document.getElementById('albumContainer');
    if (!container) return;

    container.innerHTML = '';

    cromosMundial.forEach((jugador, index) => {
        const card = document.createElement('div');
        card.className = `card-cromo ${jugador.desbloqueado ? 'desbloqueado' : 'bloqueado'}`;
        card.dataset.index = index;

        // Aplicar color de fondo dinámico
        card.style.backgroundColor = jugador.colorFondoHex || '#1a1a2e';
        card.style.backgroundImage = `linear-gradient(135deg, ${jugador.colorFondoHex || '#1a1a2e'}, rgba(0,0,0,0.7))`;

        card.innerHTML = `
            <img src="${jugador.urlBandera}" alt="${jugador.pais}" class="bandera-mini" />
            <img src="${jugador.urlImagen}" alt="${jugador.nombre}" />
            <h3>${jugador.nombre} ${jugador.destacado ? '⭐' : ''}</h3>
            <p class="pais">${jugador.pais}</p>
            <p class="posicion">${jugador.posicion}</p>
            <div class="estadisticas">
                ⚽ <span>${jugador.estadisticas.goles}</span> goles · 
                🏟️ <span>${jugador.estadisticas.partidos}</span> partidos
            </div>
            ${jugador.curiosidad ? `<p class="curiosidad">📖 ${jugador.curiosidad}</p>` : ''}
            <button class="btn-desbloquear" onclick="desbloquearCromo(${index})">
                🔓 Desbloquear Cromo
            </button>
        `;

        container.appendChild(card);
    });

    actualizarProgreso();
}

// Función para desbloquear cromo (DEV F)
function desbloquearCromo(index) {
    if (cromosMundial[index].desbloqueado) return;
    
    cromosMundial[index].desbloqueado = true;
    
    const cards = document.querySelectorAll('.card-cromo');
    const card = cards[index];
    
    if (card) {
        card.classList.remove('bloqueado');
        card.classList.add('desbloqueado');
        // Remover la animación después de que termine
        setTimeout(() => {
            card.classList.remove('desbloqueado');
        }, 600);
    }
    
    actualizarProgreso();
}

// Función para actualizar contador de progreso
function actualizarProgreso() {
    const total = cromosMundial.length;
    if (total === 0) {
        document.getElementById('progreso').textContent = '0%';
        return;
    }
    
    const desbloqueados = cromosMundial.filter(j => j.desbloqueado).length;
    const porcentaje = Math.round((desbloqueados / total) * 100);
    document.getElementById('progreso').textContent = `${porcentaje}% (${desbloqueados}/${total})`;
}

// ========================================
// FUNCIONES PARA FILTROS (DEV E)
// ========================================

function filtrarAlbum() {
    const busqueda = document.getElementById('buscador')?.value.toLowerCase() || '';
    const paisFiltro = document.getElementById('filtroPais')?.value || 'todos';

    const cards = document.querySelectorAll('.card-cromo');

    cards.forEach((card, index) => {
        const jugador = cromosMundial[index];
        if (!jugador) return;

        const coincideNombre = jugador.nombre.toLowerCase().includes(busqueda);
        const coincidePais = paisFiltro === 'todos' || jugador.pais === paisFiltro;

        card.style.display = (coincideNombre && coincidePais) ? 'block' : 'none';
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Álbum de Cromos - Mundial 2026');
    console.log('Desarrollado por KRAKEDEV');

    // Configurar eventos de filtro
    const buscador = document.getElementById('buscador');
    const filtroPais = document.getElementById('filtroPais');

    if (buscador) {
        buscador.addEventListener('input', filtrarAlbum);
    }

    if (filtroPais) {
        filtroPais.addEventListener('change', filtrarAlbum);
    }
});