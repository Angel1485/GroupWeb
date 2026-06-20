// ==================== ALMACENAMIENTO DE DATOS ====================
let clientesRegistrados = [];
let siguienteIdCliente = 1;

// Guardar todos los datos en localStorage
function guardarDatosEnLocalStorage() {
    localStorage.setItem('mathFinance_clientes', JSON.stringify(clientesRegistrados));
    localStorage.setItem('siguienteIdCliente', siguienteIdCliente);
}

// Cargar datos guardados previamente
function cargarDatosDesdeLocalStorage() {
    const clientesGuardados = localStorage.getItem('mathFinance_clientes');
    if(clientesGuardados) clientesRegistrados = JSON.parse(clientesGuardados);
    
    const idGuardado = localStorage.getItem('siguienteIdCliente');
    if(idGuardado) siguienteIdCliente = parseInt(idGuardado);
    
    // Si no hay clientes, crear uno de ejemplo
    if(clientesRegistrados.length === 0) {
        clientesRegistrados.push({
            id: siguienteIdCliente++,
            nombre: "Ana Lucía López",
            cedula: "1723456789",
            email: "ana@example.com",
            credito: null
        });
        guardarDatosEnLocalStorage();
    }
    actualizarSelectoresDeClientes();
    mostrarListaDeClientes();
}

// ==================== FUNCIONES DE INTERFAZ ====================
// Actualizar los dos selectores de clientes (solicitar crédito y pagos)
function actualizarSelectoresDeClientes() {
    const selectorPagos = document.getElementById('paymentClientSelect');
    const selectorSolicitud = document.getElementById('loanClientSelect');
    
    if(selectorPagos) {
        selectorPagos.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    }
    if(selectorSolicitud) {
        selectorSolicitud.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    }
    
    clientesRegistrados.forEach(cliente => {
        const textoOpcion = `${cliente.nombre} (${cliente.cedula})${cliente.credito ? ' - Crédito activo' : ' - Sin crédito'}`;
        
        if(selectorPagos) {
            const opcion = document.createElement('option');
            opcion.value = cliente.id;
            opcion.textContent = textoOpcion;
            selectorPagos.appendChild(opcion);
        }
        
        if(selectorSolicitud) {
            const opcion = document.createElement('option');
            opcion.value = cliente.id;
            opcion.textContent = `${cliente.nombre} (${cliente.cedula})`;
            selectorSolicitud.appendChild(opcion);
        }
    });
    
    actualizarEstadoCreditoEnPantalla();
}

// Mostrar la lista resumida de clientes registrados
function mostrarListaDeClientes() {
    const contenedor = document.getElementById('clientListSimple');
    const contador = document.getElementById('clientCount');
    contador.innerText = clientesRegistrados.length;
    
    if(contenedor) {
        contenedor.innerHTML = clientesRegistrados.slice(0,4).map(c => `<li>${c.nombre} (${c.cedula})</li>`).join('');
        if(clientesRegistrados.length > 4) contenedor.innerHTML += `<li>+${clientesRegistrados.length - 4} más</li>`;
    }
}

// Mostrar información del crédito activo del cliente seleccionado
function actualizarEstadoCreditoEnPantalla() {
    const selector = document.getElementById('paymentClientSelect');
    const infoDiv = document.getElementById('activeCreditInfo');
    
    if(!selector || !infoDiv) return;
    
    const idCliente = parseInt(selector.value);
    
    if(!idCliente) { 
        infoDiv.innerText = "Selecciona un cliente para ver estado de crédito."; 
        return; 
    }
    
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    
    if(!cliente || !cliente.credito) { 
        infoDiv.innerText = `🧑 ${cliente.nombre} - Sin crédito activo. Simule un crédito primero.`; 
        return; 
    }
    
    const credito = cliente.credito;
    const pagosRealizados = credito.pagosRealizados || [];
    const totalCuotas = credito.tablaAmortizacion.length;
    const cuotasPagadas = pagosRealizados.length;
    
    // Calcular saldo pendiente real
    let saldoPendiente = 0;
    for(let i = 0; i < credito.tablaAmortizacion.length; i++) {
        if(!pagosRealizados.includes(credito.tablaAmortizacion[i].cuota)) {
            saldoPendiente = credito.tablaAmortizacion[i].saldo;
            break;
        }
    }
    
    // Determinar estado del crédito
    let estado = credito.estado || "ACTIVO";
    if(cuotasPagadas === totalCuotas) estado = "CANCELADO";
    else if(cuotasPagadas > 0) {
        const hoy = new Date();
        let tieneAtraso = false;
        for(let i = 0; i < credito.tablaAmortizacion.length; i++) {
            if(!pagosRealizados.includes(i+1)) {
                const fechaCuota = new Date(credito.tablaAmortizacion[i].fecha);
                if(hoy > fechaCuota) tieneAtraso = true;
            }
        }
        if(tieneAtraso) estado = "CON PAGOS ATRASADOS";
        else estado = "ACTIVO AL DÍA";
    }
    
    infoDiv.innerHTML = `🧑 <strong>${cliente.nombre}</strong><br>
    💳 Crédito: $${credito.monto} | Plazo: ${credito.plazoMeses} meses<br>
    📊 Cuotas pagadas: ${cuotasPagadas}/${totalCuotas}<br>
    💰 Saldo pendiente: $${saldoPendiente.toFixed(2)}<br>
    📌 Estado: <strong>${estado}</strong>`;
    
    if(cuotasPagadas === totalCuotas && totalCuotas > 0) infoDiv.innerHTML += "<br>✅ CRÉDITO CANCELADO";
}

// ==================== FUNCIONES MATEMÁTICAS FINANCIERAS ====================
// Calcular cuota fija para sistema francés
function calcularCuotaFijaFrances(monto, tasaMensual, numeroMeses) {
    if(tasaMensual === 0) return monto / numeroMeses;
    const factor = Math.pow(1 + tasaMensual, numeroMeses);
    return monto * (tasaMensual * factor) / (factor - 1);
}

// Generar tabla de amortización - Sistema Francés (cuota fija)
function generarTablaAmortizacionFrancesa(monto, tasaMensual, numeroMeses, fechaInicio = new Date()) {
    let saldo = monto;
    const cuotaFija = calcularCuotaFijaFrances(monto, tasaMensual, numeroMeses);
    let tabla = [];
    
    for(let i = 1; i <= numeroMeses; i++) {
        let interes = saldo * tasaMensual;
        let capital = cuotaFija - interes;
        
        if(i === numeroMeses) capital = saldo;
        if(capital > saldo) capital = saldo;
        
        interes = cuotaFija - capital;
        if(interes < 0) interes = 0;
        
        let saldoRestante = saldo - capital;
        if(saldoRestante < 0) saldoRestante = 0;
        
        let fecha = new Date(fechaInicio);
        fecha.setMonth(fecha.getMonth() + i);
        
        tabla.push({
            cuota: i,
            fecha: fecha.toISOString().slice(0,10),
            capital: +capital.toFixed(2),
            interes: +interes.toFixed(2),
            cuotaTotal: +(capital + interes).toFixed(2),
            saldo: +saldoRestante.toFixed(2)
        });
        
        saldo = saldoRestante;
        if(saldo <= 0.01) break;
    }
     // Calcular totales
    let totalCapital = 0;
    let totalInteres = 0;
    let totalCuota = 0;
    
    for(let i = 0; i < tabla.length; i++) {
        totalCapital += tabla[i].capital;
        totalInteres += tabla[i].interes;
        totalCuota += tabla[i].cuotaTotal;
    }
    
    // Agregar fila TOTAL
    tabla.push({
        cuota: "TOTAL",
        fecha: "",
        capital: +totalCapital.toFixed(2),
        interes: +totalInteres.toFixed(2),
        cuotaTotal: +totalCuota.toFixed(2),
        saldo: 0
    });
    
    return tabla;  

}

// Generar tabla de amortización - Sistema Alemán (capital constante)
function generarTablaAmortizacionAlemana(monto, tasaMensual, numeroMeses, fechaInicio = new Date()) {
    const capitalConstante = monto / numeroMeses;
    let saldo = monto;
    let tabla = [];
    
    for(let i = 1; i <= numeroMeses; i++) {
        let interes = saldo * tasaMensual;
        let capitalPagado = capitalConstante;
        
        if(i === numeroMeses) capitalPagado = saldo;
        
        let cuotaMes = capitalPagado + interes;
        let saldoNuevo = saldo - capitalPagado;
        if(saldoNuevo < 0) saldoNuevo = 0;
        
        let fecha = new Date(fechaInicio);
        fecha.setMonth(fecha.getMonth() + i);
        
        tabla.push({
            cuota: i,
            fecha: fecha.toISOString().slice(0,10),
            capital: +capitalPagado.toFixed(2),
            interes: +interes.toFixed(2),
            cuotaTotal: +cuotaMes.toFixed(2),
            saldo: +saldoNuevo.toFixed(2)
        });
        
        saldo = saldoNuevo;
        if(saldo <= 0) break;
    }
    return tabla;
}

// ==================== FUNCIONES PRINCIPALES DEL CRÉDITO ====================
// Simular un crédito para un cliente específico
function simularCreditoParaCliente(idCliente, monto, plazoMeses, tasaAnual, tipoAmortizacion) {
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if(!cliente) return { error: "Cliente no existe" };
    
    const tasaMensual = (tasaAnual / 100) / 12;
    let tablaAmortizacion = [];
    
    if(tipoAmortizacion === 'frances') {
        tablaAmortizacion = generarTablaAmortizacionFrancesa(monto, tasaMensual, plazoMeses);
    } else {
        tablaAmortizacion = generarTablaAmortizacionAlemana(monto, tasaMensual, plazoMeses);
    }
    
    const nuevoCredito = {
        monto: monto,
        plazoMeses: plazoMeses,
        tasaAnual: tasaAnual,
        tipoAmortizacion: tipoAmortizacion,
        tablaAmortizacion: tablaAmortizacion,
        pagosRealizados: [],
        estado: "ACTIVO",
        fechaCreacion: new Date().toISOString()
    };
    
    cliente.credito = nuevoCredito;
    guardarDatosEnLocalStorage();
    actualizarSelectoresDeClientes();
    
    return { success: true, tabla: tablaAmortizacion };
}

// Registrar el pago de una cuota
function registrarPagoDeCuota(idCliente, numeroCuota) {
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if(!cliente || !cliente.credito) return { error: "Cliente sin crédito activo" };
    
    const credito = cliente.credito;
    const cuotas = credito.tablaAmortizacion;
    
    if(numeroCuota < 1 || numeroCuota > cuotas.length) return { error: "Número de cuota inválido" };
    if(credito.pagosRealizados.includes(numeroCuota)) return { error: "Esta cuota ya fue pagada" };
    
    credito.pagosRealizados.push(numeroCuota);
    credito.pagosRealizados.sort((a, b) => a - b);
    
    if(credito.pagosRealizados.length === cuotas.length) credito.estado = "CANCELADO";
    else credito.estado = "ACTIVO";
    
    guardarDatosEnLocalStorage();
    actualizarSelectoresDeClientes();
    actualizarEstadoCreditoEnPantalla();
    
    return { success: true, message: `Pago cuota ${numeroCuota} registrado.` };
}

// Mostrar la tabla de amortización en el HTML
function mostrarTablaAmortizacionEnPantalla(tabla) {
    const contenedor = document.getElementById('amortTableContainer');
    
    if(!tabla || tabla.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center;">No hay tabla generada. Simule un crédito.</p>';
        return;
    }
    
    let html = `<table><thead><tr><th># Cuota</th><th>Fecha</th><th>Capital ($)</th><th>Interés ($)</th><th>Cuota Total ($)</th><th>Saldo Restante ($)</th></tr></thead><tbody>`;
    
    tabla.forEach(fila => {
        html += `<tr>
                    <td style="text-align:center">${fila.cuota}</td>
                    <td>${fila.fecha}</td>
                    <td>${fila.capital}</td>
                    <td>${fila.interes}</td>
                    <td><strong>${fila.cuotaTotal}</strong></td>
                    <td>${fila.saldo}</td>
                  </tr>`;
    });
    
    html += `</tbody>加上`;
    contenedor.innerHTML = html;
}

// Calcular saldo pendiente real después de los pagos
function calcularSaldoPendienteReal(credito) {
    const pagosRealizados = credito.pagosRealizados || [];
    for(let i = 0; i < credito.tablaAmortizacion.length; i++) {
        if(!pagosRealizados.includes(credito.tablaAmortizacion[i].cuota)) {
            return credito.tablaAmortizacion[i].saldo;
        }
    }
    return 0;
}

// ==================== MANEJADORES DE EVENTOS (BOTONES) ====================
// Cuando el usuario hace clic en "Simular Crédito"
function manejarSimulacionCredito() {
    const selectorCliente = document.getElementById('loanClientSelect');
    const idCliente = parseInt(selectorCliente.value);
    const nombreCliente = selectorCliente.options[selectorCliente.selectedIndex]?.text || "Cliente";

    if(!idCliente) { 
        alert("Por favor, selecciona un cliente en 'Solicitar Crédito'"); 
        return; 
    }
    
    const monto = parseFloat(document.getElementById('loanAmount').value);
    const plazoMeses = parseInt(document.getElementById('loanMonths').value);
    const tasaAnual = parseFloat(document.getElementById('interestRate').value);
    const tipoAmortizacion = document.getElementById('amortType').value;
    
    if(isNaN(monto) || isNaN(plazoMeses) || isNaN(tasaAnual) || monto <= 0 || plazoMeses <= 0) {
        alert("Ingrese valores válidos");
        return;
    }
    
    const resultado = simularCreditoParaCliente(idCliente, monto, plazoMeses, tasaAnual, tipoAmortizacion);
    
    if(resultado.error) {
        alert(resultado.error);
    } else {
        mostrarTablaAmortizacionEnPantalla(resultado.tabla , nombreCliente);
        
        const cuotaEjemplo = resultado.tabla[0].cuotaTotal;
        const resumenDiv = document.getElementById('simulationSummary');
        resumenDiv.innerHTML = `<strong>✅ Simulación exitosa - ${nombreCliente}</strong><br>📌 Cuota mensual aprox: $${cuotaEjemplo} (${tipoAmortizacion === 'frances' ? 'fija' : 'variable decreciente'})<br>📊 Interés compuesto mensual: ${(tasaAnual/12).toFixed(3)}% · Plazo: ${plazoMeses} meses`;
        
        actualizarSelectoresDeClientes();
        actualizarEstadoCreditoEnPantalla();
        
        document.getElementById('paymentStatusMsg').innerHTML = '';
        document.getElementById('paymentDetailsMsg').innerHTML = '';
    }
}

// Cuando el usuario hace clic en "Registrar Pago"
function manejarRegistroPago() {
    const selectorCliente = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selectorCliente.value);
    
    if(!idCliente) { 
        alert("Seleccione un cliente"); 
        return; 
    }
    
    const numeroCuota = parseInt(document.getElementById('paymentQuotaNum').value);
    if(isNaN(numeroCuota)) { 
        alert("Ingrese número de cuota válido"); 
        return; 
    }
    
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if(!cliente || !cliente.credito) {
        alert("Cliente sin crédito activo");
        return;
    }
    
    const resultado = registrarPagoDeCuota(idCliente, numeroCuota);
    const mensajeDiv = document.getElementById('paymentStatusMsg');
    const detalleDiv = document.getElementById('paymentDetailsMsg');
    
    if(resultado.error) {
        mensajeDiv.innerHTML = `<span style="color:#bc6c25;">⚠️ ${resultado.error}</span>`;
        detalleDiv.innerHTML = '';
    } else {
        mensajeDiv.innerHTML = `<span style="color:#2c6e49;">✅ ${resultado.message}</span>`;
        
        const credito = cliente.credito;
        const cuotaPagada = credito.tablaAmortizacion.find(c => c.cuota === numeroCuota);
        const saldoReal = calcularSaldoPendienteReal(credito);
        const totalPagado = credito.pagosRealizados.length;
        const totalCuotas = credito.tablaAmortizacion.length;
        const cuotasRestantes = (totalCuotas - 1) - totalPagado;
        //Cambio para que no se visualzie la cueto total

        detalleDiv.innerHTML = `
            <strong>🧑 Cliente: ${cliente.nombre}</strong><br>
            <strong>💳 Detalle del pago:</strong><br>
            • Cuota número <span style="color:#2c6e49; font-size:1.1rem;">${numeroCuota}</span> pagada<br>
            • Monto pagado: $${cuotaPagada.cuotaTotal}<br>
            • Capital abonado: $${cuotaPagada.capital}<br>
            • Interés pagado: $${cuotaPagada.interes}<br>
            • <strong>Saldo restante del crédito: $${saldoReal.toFixed(2)}</strong><br>
            • Progreso: ${totalPagado}/${totalCuotas - 1} cuotas pagadas<br>  
            • Cuotas pendientes: ${cuotasRestantes}
        `;
        
        mostrarTablaAmortizacionEnPantalla(cliente.credito.tablaAmortizacion);
        
        const resumenDiv = document.getElementById('simulationSummary');
        resumenDiv.innerHTML = `<strong>📌 Crédito de ${cliente.nombre} actualizado</strong><br>Pagos registrados: ${totalPagado}/${totalCuotas - 1}<br>Saldo pendiente: $${saldoReal.toFixed(2)}`;
        
        actualizarEstadoCreditoEnPantalla();
        document.getElementById('paymentQuotaNum').value = '';
    }
}

// Reiniciar/Eliminar el crédito del cliente seleccionado
function manejarReinicioCredito() {
    const selectorCliente = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selectorCliente.value);
    
    if(!idCliente) { 
        alert("Seleccione un cliente"); 
        return; 
    }
    
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    
    if(cliente && cliente.credito) {
        cliente.credito = null;
        guardarDatosEnLocalStorage();
        actualizarSelectoresDeClientes();
        
        document.getElementById('amortTableContainer').innerHTML = '<p style="text-align:center;">Crédito eliminado, simule nuevamente.</p>';
        document.getElementById('simulationSummary').innerHTML = '';
        actualizarEstadoCreditoEnPantalla();
        document.getElementById('paymentStatusMsg').innerHTML = '';
        document.getElementById('paymentDetailsMsg').innerHTML = '';
    } else {
        alert("El cliente no tiene crédito activo");
    }
}

// Registrar un nuevo cliente
function manejarRegistroCliente() {
    const nombre = document.getElementById('clientName').value.trim();
    const cedula = document.getElementById('clientId').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    
    if(!nombre || !cedula) { 
        alert("Nombre e identificación son obligatorios"); 
        return; 
    }
    
    const nuevoCliente = {
        id: siguienteIdCliente++,
        nombre: nombre,
        cedula: cedula,
        email: email,
        credito: null
    };
    
    clientesRegistrados.push(nuevoCliente);
    guardarDatosEnLocalStorage();
    actualizarSelectoresDeClientes();
    mostrarListaDeClientes();
    
    // Limpiar formulario
    document.getElementById('clientName').value = '';
    document.getElementById('clientId').value = '';
    document.getElementById('clientEmail').value = '';
    
    alert(`Cliente ${nombre} registrado con éxito.`);
}

// ==================== FUNCIONES PARA EL TEST ====================
// Mostrar u ocultar el test al hacer clic en el botón
function toggleTestVisibility() {
    const testContent = document.getElementById('testContent');
    const toggleBtn = document.getElementById('toggleTestBtn');
    
    if (testContent.style.display === 'none') {
        testContent.style.display = 'block';
        toggleBtn.textContent = '📋 Ocultar Test';
        toggleBtn.style.background = '#bc6c25';
    } else {
        testContent.style.display = 'none';
        toggleBtn.textContent = '📋 Mostrar Test';
        toggleBtn.style.background = '#2c7da0';
    }
}

// Desplazar suavemente hacia el test
function scrollToTest() {
    const testSection = document.getElementById('testSection');
    testSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Si el test está oculto, mostrarlo automáticamente
    const testContent = document.getElementById('testContent');
    const toggleBtn = document.getElementById('toggleTestBtn');
    
    if (testContent.style.display === 'none') {
        testContent.style.display = 'block';
        toggleBtn.textContent = '📋 Ocultar Test';
        toggleBtn.style.background = '#bc6c25';
    }
}

// Mostrar el test en pantalla
function mostrarTestEvaluacion() {
    const contenedor = document.getElementById('quizContainer');
    let html = '';
    
    preguntasTest.forEach((pregunta, indice) => {
        html += `<div class="question"><p><strong>${indice+1}. ${pregunta.texto}</strong></p>`;
        pregunta.opciones.forEach((opcion, idxOpcion) => {
            html += `<label style="display:block; margin-left:1rem;"><input type="radio" name="pregunta${indice}" value="${idxOpcion}"> ${opcion}</label>`;
        });
        html += `</div>`;
    });
    
    contenedor.innerHTML = html;
}

// Corregir el test y mostrar puntaje
function corregirTestEvaluacion() {
    let puntaje = 0;
    
    for(let i = 0; i < preguntasTest.length; i++) {
        const seleccionada = document.querySelector(`input[name="pregunta${i}"]:checked`);
        if(seleccionada && parseInt(seleccionada.value) === preguntasTest[i].correcta) puntaje++;
    }
    
    const resultadoDiv = document.getElementById('quizResult');
    resultadoDiv.innerHTML = `<strong>🎯 Puntaje: ${puntaje}/${preguntasTest.length}</strong> - ${puntaje >= 3 ? "¡Excelente comprensión financiera!" : "Recomendamos repasar los conceptos de amortización."}`;
    
    // Desplazar suavemente al resultado
    resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==================== PREGUNTAS DEL TEST ====================
const preguntasTest = [
    { texto: "¿Qué representa el valor futuro en interés compuesto?", opciones: ["El capital inicial", "El monto acumulado después de n periodos", "La tasa de interés", "La inflación"], correcta: 1 },
    { texto: "En el sistema de amortización francés, las cuotas son:", opciones: ["Decrecientes", "Crecientes", "Constantes (fijas)", "Variables según saldo"], correcta: 2 },
    { texto: "Fórmula para calcular interés simple:", opciones: ["I = C * i * t", "I = C * (1+i)^n", "VF = VP*(1+i)^n", "i = VF/VP -1"], correcta: 0 },
    { texto: "Si una tasa anual es 12% capitalizable mensual, la tasa mensual es:", opciones: ["1%", "2%", "0.5%", "12%"], correcta: 0 },
    { texto: "En la tabla de amortización alemana, ¿qué componente permanece constante?", opciones: ["El interés", "La cuota total", "El abono a capital", "El saldo deudor"], correcta: 2 }
];

// ==================== INICIALIZACIÓN ====================
// Cargar datos y configurar eventos
cargarDatosDesdeLocalStorage();
mostrarTestEvaluacion();

// Eventos de botones principales
document.getElementById('simulateBtn').addEventListener('click', manejarSimulacionCredito);
document.getElementById('registerClientBtn').addEventListener('click', manejarRegistroCliente);
document.getElementById('registerPaymentBtn').addEventListener('click', manejarRegistroPago);
document.getElementById('resetLoanStatusBtn').addEventListener('click', manejarReinicioCredito);
document.getElementById('submitQuizBtn').addEventListener('click', corregirTestEvaluacion);

// Eventos para el test
const toggleBtn = document.getElementById('toggleTestBtn');
if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTestVisibility);
}

// Botón flotante para ir al test
const floatingBtn = document.getElementById('floatingTestBtn');
if (floatingBtn) {
    floatingBtn.addEventListener('click', scrollToTest);
}

// Actualizar selectores y estado inicial
actualizarSelectoresDeClientes();
actualizarEstadoCreditoEnPantalla();

// Auto-actualizar tabla al cambiar de cliente
setInterval(() => {
    const selector = document.getElementById('paymentClientSelect');
    if(selector && selector.value) {
        const idCliente = parseInt(selector.value);
        const cliente = clientesRegistrados.find(c => c.id === idCliente);
        if(cliente && cliente.credito) mostrarTablaAmortizacionEnPantalla(cliente.credito.tablaAmortizacion);
    }
}, 500);