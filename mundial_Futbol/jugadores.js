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

// ========================================
// DEV B — DATOS GRUPOS A y B
// ========================================

function cargarDatosGrupoAB() {
    const datos = [
        {
            id: 1,
            nombre: "Enner Valencia",
            pais: "Ecuador",
            posicion: "Delantero",
            urlImagen: "imagenes/enner.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/ec.svg",
            colorFondoHex: "#0039a6",
            estadisticas: { goles: 40, partidos: 78 },
            destacado: true,
            curiosidad: "Máximo goleador histórico de la selección ecuatoriana."
        },
        {
            id: 2,
            nombre: "Moisés Caicedo",
            pais: "Ecuador",
            posicion: "Mediocampista",
            urlImagen: "imagenes/moises.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/ec.svg",
            colorFondoHex: "#0039a6",
            estadisticas: { goles: 8, partidos: 45 },
            destacado: false,
            curiosidad: "Jugador ecuatoriano más joven en marcar en un Mundial."
        },
        {
            id: 3,
            nombre: "Harry Kane",
            pais: "Inglaterra",
            posicion: "Delantero",
            urlImagen: "imagenes/kane.webp",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/gb-eng.svg",
            colorFondoHex: "#1a2c5a",
            estadisticas: { goles: 65, partidos: 95 },
            destacado: true,
            curiosidad: "Máximo goleador histórico de la selección inglesa."
        },
        {
            id: 4,
            nombre: "Cody Gakpo",
            pais: "Países Bajos",
            posicion: "Delantero",
            urlImagen: "imagenes/cody.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/nl.svg",
            colorFondoHex: "#e25822",
            estadisticas: { goles: 15, partidos: 30 },
            destacado: false,
            curiosidad: "Joven promesa del fútbol neerlandés."
        },
        {
            id: 5,
            nombre: "Virgil van Dijk",
            pais: "Países Bajos",
            posicion: "Defensa",
            urlImagen: "imagenes/virgil.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/nl.svg",
            colorFondoHex: "#e25822",
            estadisticas: { goles: 7, partidos: 70 },
            destacado: false,
            curiosidad: "Considerado uno de los mejores defensas del mundo."
        },
        {
            id: 6,
            nombre: "Ali Al-Hassan",
            pais: "Catar",
            posicion: "Mediocampista",
            urlImagen: "imagenes/ali.webp",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/qa.svg",
            colorFondoHex: "#8a1538",
            estadisticas: { goles: 3, partidos: 25 },
            destacado: false,
            curiosidad: "Jugador clave en la histórica clasificación de Catar."
        }
    ];

    datos.forEach(jugador => {
        cromosMundial.push(jugador);
    });

    console.log(`✅ DEV B: ${datos.length} jugadores agregados (Grupos A y B)`);
}

// ========================================
// DEV C — DATOS GRUPOS C y D
// ========================================

function cargarDatosGrupoCD() {
    const datos = [
        {
            id: 7,
            nombre: "Lionel Messi",
            pais: "Argentina",
            posicion: "Delantero",
            urlImagen: "imagenes/messi.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/ar.svg",
            colorFondoHex: "#75aadb",
            estadisticas: { goles: 106, partidos: 185 },
            destacado: true,
            curiosidad: "Máximo ganador del Balón de Oro con 8 trofeos."
        },
        {
            id: 8,
            nombre: "Kylian Mbappé",
            pais: "Francia",
            posicion: "Delantero",
            urlImagen: "imagenes/mbape.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/fr.svg",
            colorFondoHex: "#002395",
            estadisticas: { goles: 46, partidos: 78 },
            destacado: true,
            curiosidad: "Jugador más joven en marcar en una final de Mundial."
        },
        {
            id: 9,
            nombre: "Antoine Griezmann",
            pais: "Francia",
            posicion: "Delantero",
            urlImagen: "imagenes/antonie.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/fr.svg",
            colorFondoHex: "#002395",
            estadisticas: { goles: 44, partidos: 127 },
            destacado: false,
            curiosidad: "Máximo asistidor en la historia de la selección francesa."
        },
        {
            id: 10,
            nombre: "Christian Eriksen",
            pais: "Dinamarca",
            posicion: "Mediocampista",
            urlImagen: "imagenes/christian.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/dk.svg",
            colorFondoHex: "#c60c30",
            estadisticas: { goles: 42, partidos: 135 },
            destacado: false,
            curiosidad: "Regresó a jugar después de un paro cardíaco en la Euro 2020."
        },
        {
            id: 11,
            nombre: "Andreas Christensen",
            pais: "Dinamarca",
            posicion: "Defensa",
            urlImagen: "imagenes/andreas.webp",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/dk.svg",
            colorFondoHex: "#c60c30",
            estadisticas: { goles: 2, partidos: 70 },
            destacado: false,
            curiosidad: "Defensa titular en la selección danesa."
        },
        {
            id: 12,
            nombre: "Christian Pulisic",
            pais: "Estados Unidos",
            posicion: "Delantero",
            urlImagen: "imagenes/christian2.jpg",
            urlBandera: "https://flagicons.lipis.dev/flags/4x3/us.svg",
            colorFondoHex: "#3c3b6e",
            estadisticas: { goles: 28, partidos: 68 },
            destacado: false,
            curiosidad: "Primer estadounidense en ganar la Champions League."
        }
    ];

    datos.forEach(jugador => {
        cromosMundial.push(jugador);
    });

    console.log(`✅ DEV C: ${datos.length} jugadores agregados (Grupos C y D)`);
    
    const totalGoles = datos.reduce((sum, j) => sum + j.estadisticas.goles, 0);
    console.log(`⚽ Total de goles (Grupos C y D): ${totalGoles}`);
    return totalGoles;
}

// ========================================
// CARGAR DATOS
// ========================================

cargarDatosGrupoAB();
const totalGolesCD = cargarDatosGrupoCD();

// ========================================
// FUNCIÓN DE RENDERIZADO
// ========================================

function renderizarAlbum() {
    const container = document.getElementById('albumContainer');
    if (!container) {
        console.error('❌ No se encontró el contenedor del álbum');
        return;
    }

    if (cromosMundial.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; color:#888; padding:2rem;">
                ⏳ No hay datos para mostrar. Verifica que los datos se cargaron correctamente.
            </p>
        `;
        return;
    }

    container.innerHTML = '';

    cromosMundial.forEach((jugador, index) => {
        const card = document.createElement('div');
        card.className = `card-cromo ${jugador.desbloqueado ? 'desbloqueado' : 'bloqueado'}`;
        card.dataset.index = index;

        // Aplicar color de fondo dinámico
        card.style.backgroundColor = jugador.colorFondoHex || '#1a1a2e';
        card.style.backgroundImage = `linear-gradient(135deg, ${jugador.colorFondoHex || '#1a1a2e'}, rgba(0,0,0,0.7))`;

        const destacadoBadge = jugador.destacado ? '<span class="badge-destacado">⭐ Destacado</span>' : '';

        card.innerHTML = `
            ${destacadoBadge}
            <img src="${jugador.urlBandera}" alt="${jugador.pais}" class="bandera-mini" />
            <img src="${jugador.urlImagen}" alt="${jugador.nombre}" />
            <h3>${jugador.nombre}</h3>
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
    console.log(`✅ Álbum renderizado: ${cromosMundial.length} cromos`);
}

// ========================================
// FUNCIÓN PARA DESBLOQUEAR CROMO
// ========================================

function desbloquearCromo(index) {
    if (cromosMundial[index].desbloqueado) {
        const cards = document.querySelectorAll('.card-cromo');
        const card = cards[index];
        if (card) {
            card.style.borderColor = '#FFD700';
            setTimeout(() => {
                card.style.borderColor = '';
            }, 500);
        }
        return;
    }
    
    cromosMundial[index].desbloqueado = true;
    
    const cards = document.querySelectorAll('.card-cromo');
    const card = cards[index];
    
    if (card) {
        card.classList.remove('bloqueado');
        card.classList.add('desbloqueado');
        card.style.animation = 'flash 0.6s ease';
        
        setTimeout(() => {
            card.classList.remove('desbloqueado');
            card.style.animation = '';
        }, 700);
    }
    
    actualizarProgreso();
    
    const total = cromosMundial.length;
    const desbloqueados = cromosMundial.filter(j => j.desbloqueado).length;
    
    if (desbloqueados === total && total > 0) {
        setTimeout(() => {
            alert('🎉 ¡FELICIDADES! Has desbloqueado todos los cromos del álbum.');
        }, 500);
    }
}

// ========================================
// FUNCIÓN PARA ACTUALIZAR PROGRESO
// ========================================

function actualizarProgreso() {
    const total = cromosMundial.length;
    if (total === 0) {
        const progreso = document.getElementById('progreso');
        if (progreso) progreso.textContent = '0% (0/0)';
        return;
    }
    
    const desbloqueados = cromosMundial.filter(j => j.desbloqueado).length;
    const porcentaje = Math.round((desbloqueados / total) * 100);
    const progreso = document.getElementById('progreso');
    
    if (progreso) {
        progreso.textContent = `${porcentaje}% (${desbloqueados}/${total})`;
    }
}

// ========================================
// FUNCIÓN PARA FILTRAR ÁLBUM
// ========================================

function filtrarAlbum() {
    const busqueda = document.getElementById('buscador')?.value.toLowerCase().trim() || '';
    const paisFiltro = document.getElementById('filtroPais')?.value || 'todos';

    const cards = document.querySelectorAll('.card-cromo');
    let visibles = 0;

    cards.forEach((card, index) => {
        const jugador = cromosMundial[index];
        if (!jugador) return;

        const coincideNombre = jugador.nombre.toLowerCase().includes(busqueda);
        const coincidePais = paisFiltro === 'todos' || jugador.pais === paisFiltro;

        const visible = coincideNombre && coincidePais;
        card.style.display = visible ? 'block' : 'none';
        if (visible) visibles++;
    });

    const container = document.getElementById('albumContainer');
    const mensajeExistente = document.querySelector('.mensaje-filtro');
    
    if (visibles === 0 && container) {
        if (!mensajeExistente) {
            const mensaje = document.createElement('p');
            mensaje.className = 'mensaje-filtro';
            mensaje.style.cssText = `
                text-align: center;
                color: #888;
                font-size: 1.2rem;
                width: 100%;
                padding: 2rem;
            `;
            mensaje.textContent = '🔍 No se encontraron jugadores que coincidan con tu búsqueda';
            container.appendChild(mensaje);
        }
    } else if (mensajeExistente) {
        mensajeExistente.remove();
    }
}

// ========================================
// FUNCIÓN PARA POBLAR FILTRO DE PAÍSES
// ========================================

function poblarFiltroPaises() {
    const select = document.getElementById('filtroPais');
    if (!select) return;

    const paises = [...new Set(cromosMundial.map(j => j.pais))];
    paises.sort();

    paises.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais;
        option.textContent = pais;
        select.appendChild(option);
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Álbum de Cromos - Mundial 2026');
    
    // Mostrar total de goles en la página
    const container = document.getElementById('albumContainer');
    if (container && totalGolesCD > 0) {
        const infoGoles = document.createElement('div');
        infoGoles.style.cssText = `
            text-align: center;
            width: 100%;
            padding: 1rem;
            margin: 1rem 0;
            background: rgba(255,215,0,0.1);
            border-radius: 15px;
            border: 1px solid rgba(255,215,0,0.3);
        `;
        infoGoles.innerHTML = `
            <p style="color: #FFD700; font-size: 1.2rem;">
                ⚽ Goles totales (Grupos C y D): <strong>${totalGolesCD}</strong>
            </p>
        `;
        container.prepend(infoGoles);
    }
    
    // Renderizar álbum
    renderizarAlbum();
    
    // Poblar filtros
    poblarFiltroPaises();
    
    // Configurar eventos
    const buscador = document.getElementById('buscador');
    const filtroPais = document.getElementById('filtroPais');
    
    if (buscador) {
        buscador.addEventListener('input', filtrarAlbum);
    }
    
    if (filtroPais) {
        filtroPais.addEventListener('change', filtrarAlbum);
    }
    
    console.log(`✅ Álbum inicializado con ${cromosMundial.length} jugadores`);
});

// Función para desbloquear todos (modo desarrollador)
function desbloquearTodos() {
    cromosMundial.forEach((jugador) => {
        jugador.desbloqueado = true;
    });
    
    const cards = document.querySelectorAll('.card-cromo');
    cards.forEach(card => {
        card.classList.remove('bloqueado');
        card.classList.add('desbloqueado');
        setTimeout(() => {
            card.classList.remove('desbloqueado');
        }, 600);
    });
    
    actualizarProgreso();
    alert('🎯 Todos los cromos han sido desbloqueados!');
}

console.log('✅ Archivo jugadores.js cargado correctamente');