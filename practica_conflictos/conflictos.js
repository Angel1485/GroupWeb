// ==========================================================================
// ESTRUCTURA DE DATOS Y LÓGICA - JAVASCRIPT (KRAKEDEV)
// Instrucciones para los alumnos: Modificar o agregar objetos al arreglo 
// al mismo tiempo alterará la estructura lógica. ¡Cuidado con romper la sintaxis!
// ==========================================================================

const integrantes = [
    {
        id: 1,
        nombre: "Profesor Guía",
        rol: "Tech Lead / Git Instructor",
        bio: "Encargado de evaluar el control de versiones y la resolución quirúrgica de los conflictos de código."
    },
    {
        id: 2,
        nombre: "Desarrollador Base",
        rol: "Fullstack Developer",
        bio: "Estructura inicial del sistema lista para recibir las tarjetas de los nuevos ingenieros del equipo."
    }
];

// Función para renderizar las tarjetas dinámicamente en el HTML
function renderTeam(teamList) {
    const container = document.getElementById('team-container');
    // Control de seguridad si el contenedor no existe
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar contenedor antes de pintar
    
    teamList.forEach(integrante => {
        const cardHTML = `
            <div class="card" data-id="${integrante.id}">
                <h2>${integrante.nombre}</h2>
                <span class="role">${integrante.rol}</span>
                <p class="bio">${integrante.bio}</p>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Ejecutar renderizado cuando el DOM esté completamente cargado e instalado
document.addEventListener('DOMContentLoaded', () => {
    renderTeam(integrantes);
    
    // 💡 Tip para la Sesión 5: Recuerden revisar la consola (F12) 
    // para verificar que no existan SyntaxErrors tras los merges.
    console.log("KRAKEDEV: Datos cargados y sistema de renderizado listo.");
});