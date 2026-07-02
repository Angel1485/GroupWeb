// ==================== ALMACENAMIENTO DE DATOS ====================
let clientesRegistrados = [];
let siguienteIdCliente = 1;

function guardarDatosEnLocalStorage() {
    localStorage.setItem('mathFinance_clientes', JSON.stringify(clientesRegistrados));
    localStorage.setItem('siguienteIdCliente', siguienteIdCliente);
}

function cargarDatosDesdeLocalStorage() {
    const clientesGuardados = localStorage.getItem('mathFinance_clientes');
    if (clientesGuardados) clientesRegistrados = JSON.parse(clientesGuardados);

    const idGuardado = localStorage.getItem('siguienteIdCliente');
    if (idGuardado) siguienteIdCliente = parseInt(idGuardado);

    if (clientesRegistrados.length === 0) {
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

// ==================== HELPERS DE PAGOS ====================
// pagosRealizados: array de { cuota: N, fechaPago: "YYYY-MM-DD" }
function numeroCuotasPagadas(pagosRealizados) {
    return (pagosRealizados || []).length;
}

function esCuotaPagadaReal(pagosRealizados, numeroCuota) {
    // Solo pagada si el usuario registró el pago manualmente
    return (pagosRealizados || []).some(p => p.cuota === numeroCuota);
}

function getFechaPago(pagosRealizados, numeroCuota) {
    const p = (pagosRealizados || []).find(p => p.cuota === numeroCuota);
    return p ? p.fechaPago : null;
}

// ==================== FUNCIONES DE INTERFAZ ====================
function actualizarSelectoresDeClientes() {
    const selectorPagos = document.getElementById('paymentClientSelect');
    const selectorSolicitud = document.getElementById('loanClientSelect');

    if (selectorPagos) selectorPagos.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    if (selectorSolicitud) selectorSolicitud.innerHTML = '<option value="">-- Seleccionar cliente --</option>';

    clientesRegistrados.forEach(cliente => {
        const textoOpcion = `${cliente.nombre} (${cliente.cedula})${cliente.credito ? ' - Crédito activo' : ' - Sin crédito'}`;

        if (selectorPagos) {
            const op = document.createElement('option');
            op.value = cliente.id;
            op.textContent = textoOpcion;
            selectorPagos.appendChild(op);
        }
        if (selectorSolicitud) {
            const op = document.createElement('option');
            op.value = cliente.id;
            op.textContent = `${cliente.nombre} (${cliente.cedula})`;
            selectorSolicitud.appendChild(op);
        }
    });

    actualizarEstadoCreditoEnPantalla();
    mostrarSiguienteCuota();
}

function mostrarListaDeClientes() {
    const contenedor = document.getElementById('clientListSimple');
    const contador = document.getElementById('clientCount');
    contador.innerText = clientesRegistrados.length;
    if (contenedor) {
        contenedor.innerHTML = clientesRegistrados.slice(0, 4).map(c => `<li>${c.nombre} (${c.cedula})</li>`).join('');
        if (clientesRegistrados.length > 4) contenedor.innerHTML += `<li>+${clientesRegistrados.length - 4} más</li>`;
    }
}

function actualizarEstadoCreditoEnPantalla() {
    const selector = document.getElementById('paymentClientSelect');
    const infoDiv = document.getElementById('activeCreditInfo');
    if (!selector || !infoDiv) return;

    const idCliente = parseInt(selector.value);
    if (!idCliente) { infoDiv.innerText = "Selecciona un cliente para ver estado de crédito."; return; }

    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) {
        infoDiv.innerText = `🧑 ${cliente.nombre} - Sin crédito activo. Simule un crédito primero.`;
        return;
    }

    const credito = cliente.credito;
    const pagosRealizados = credito.pagosRealizados || [];
    const totalCuotas = credito.tablaAmortizacion.filter(f => f.cuota !== "TOTAL").length;
    const cuotasPagadas = numeroCuotasPagadas(pagosRealizados);

    let saldoPendiente = 0;
    for (let i = 0; i < credito.tablaAmortizacion.length; i++) {
        const fila = credito.tablaAmortizacion[i];
        if (fila.cuota === "TOTAL") continue;
        if (!esCuotaPagadaReal(pagosRealizados, fila.cuota)) {
            saldoPendiente = fila.saldo;
            break;
        }
    }

    let estado = credito.estado || "ACTIVO";
    if (cuotasPagadas === totalCuotas) estado = "CANCELADO";
    else if (cuotasPagadas > 0) {
        const hoy = new Date();
        let tieneAtraso = false;
        for (let i = 0; i < credito.tablaAmortizacion.length; i++) {
            const fila = credito.tablaAmortizacion[i];
            if (fila.cuota === "TOTAL") continue;
            if (!esCuotaPagadaReal(pagosRealizados, fila.cuota)) {
                if (hoy > new Date(fila.fecha)) tieneAtraso = true;
            }
        }
        estado = tieneAtraso ? "CON PAGOS ATRASADOS" : "ACTIVO AL DÍA";
    }

    infoDiv.innerHTML = `🧑 <strong>${cliente.nombre}</strong><br>
    💳 Crédito: $${credito.monto} | Plazo: ${credito.plazoMeses} meses<br>
    📊 Cuotas pagadas: ${cuotasPagadas}/${totalCuotas}<br>
    💰 Saldo pendiente: $${saldoPendiente.toFixed(2)}<br>
    📌 Estado: <strong>${estado}</strong>`;
    if (cuotasPagadas === totalCuotas && totalCuotas > 0) infoDiv.innerHTML += "<br>✅ CRÉDITO CANCELADO";
}

function mostrarSiguienteCuota() {
    const selector = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selector.value);
    const infoDiv = document.getElementById('siguienteCuotaInfo');
    if (!idCliente || !infoDiv) { if (infoDiv) infoDiv.innerHTML = ''; return; }

    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) { infoDiv.innerHTML = ''; return; }

    const pagosRealizados = cliente.credito.pagosRealizados || [];
    const totalCuotas = cliente.credito.tablaAmortizacion.filter(f => f.cuota !== "TOTAL").length;

    let siguienteCuota = null;
    for (let i = 1; i <= totalCuotas; i++) {
        if (!esCuotaPagadaReal(pagosRealizados, i)) { siguienteCuota = i; break; }
    }

    if (siguienteCuota) {
        infoDiv.innerHTML = `⏳ <strong>Próxima cuota a pagar: #${siguienteCuota}</strong>`;
        document.getElementById('paymentQuotaNum').placeholder = `Ej: ${siguienteCuota} (siguiente)`;
    } else if (totalCuotas > 0 && numeroCuotasPagadas(pagosRealizados) === totalCuotas) {
        infoDiv.innerHTML = '🎉 <strong style="color:#2c6e49;">¡Crédito cancelado!</strong>';
        document.getElementById('paymentQuotaNum').placeholder = 'Ej: 1';
    } else {
        infoDiv.innerHTML = '';
    }
}

// ==================== FUNCIONES MATEMÁTICAS ====================
function calcularCuotaFijaFrances(monto, tasaMensual, numeroMeses) {
    if (tasaMensual === 0) return monto / numeroMeses;
    const factor = Math.pow(1 + tasaMensual, numeroMeses);
    return monto * (tasaMensual * factor) / (factor - 1);
}

function generarTablaAmortizacionFrancesa(monto, tasaMensual, numeroMeses, fechaInicio = new Date()) {
    let saldo = monto;
    const cuotaFija = calcularCuotaFijaFrances(monto, tasaMensual, numeroMeses);
    let tabla = [];

    for (let i = 1; i <= numeroMeses; i++) {
        let interes = saldo * tasaMensual;
        let capital = cuotaFija - interes;
        if (i === numeroMeses) capital = saldo;
        if (capital > saldo) capital = saldo;
        interes = cuotaFija - capital;
        if (interes < 0) interes = 0;
        let saldoRestante = saldo - capital;
        if (saldoRestante < 0) saldoRestante = 0;

        let fecha = new Date(fechaInicio);
        fecha.setMonth(fecha.getMonth() + i);

        tabla.push({
            cuota: i,
            fecha: fecha.toISOString().slice(0, 10),
            capital: +capital.toFixed(2),
            interes: +interes.toFixed(2),
            cuotaTotal: +(capital + interes).toFixed(2),
            saldo: +saldoRestante.toFixed(2),
            fechaPago: null
        });

        saldo = saldoRestante;
        if (saldo <= 0.01) break;
    }

    let totalCapital = 0, totalInteres = 0, totalCuota = 0;
    for (let i = 0; i < tabla.length; i++) {
        totalCapital += tabla[i].capital;
        totalInteres += tabla[i].interes;
        totalCuota += tabla[i].cuotaTotal;
    }
    tabla.push({ cuota: "TOTAL", fecha: "", capital: +totalCapital.toFixed(2), interes: +totalInteres.toFixed(2), cuotaTotal: +totalCuota.toFixed(2), saldo: 0, fechaPago: null });
    return tabla;
}

function generarTablaAmortizacionAlemana(monto, tasaMensual, numeroMeses, fechaInicio = new Date()) {
    const capitalConstante = monto / numeroMeses;
    let saldo = monto;
    let tabla = [];

    for (let i = 1; i <= numeroMeses; i++) {
        let interes = saldo * tasaMensual;
        let capitalPagado = capitalConstante;
        if (i === numeroMeses) capitalPagado = saldo;
        let cuotaMes = capitalPagado + interes;
        let saldoNuevo = saldo - capitalPagado;
        if (saldoNuevo < 0) saldoNuevo = 0;

        let fecha = new Date(fechaInicio);
        fecha.setMonth(fecha.getMonth() + i);

        tabla.push({
            cuota: i,
            fecha: fecha.toISOString().slice(0, 10),
            capital: +capitalPagado.toFixed(2),
            interes: +interes.toFixed(2),
            cuotaTotal: +cuotaMes.toFixed(2),
            saldo: +saldoNuevo.toFixed(2),
            fechaPago: null
        });

        saldo = saldoNuevo;
        if (saldo <= 0) break;
    }
    return tabla;
}

// ==================== FUNCIONES DEL CRÉDITO ====================
function simularCreditoParaCliente(idCliente, monto, plazoMeses, tasaAnual, tipoAmortizacion) {
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente) return { error: "Cliente no existe" };

    const tasaMensual = (tasaAnual / 100) / 12;
    let tablaAmortizacion = tipoAmortizacion === 'frances'
        ? generarTablaAmortizacionFrancesa(monto, tasaMensual, plazoMeses)
        : generarTablaAmortizacionAlemana(monto, tasaMensual, plazoMeses);

    cliente.credito = {
        monto, plazoMeses, tasaAnual, tipoAmortizacion,
        tablaAmortizacion,
        pagosRealizados: [],
        estado: "ACTIVO",
        fechaCreacion: new Date().toISOString()
    };

    guardarDatosEnLocalStorage();
    actualizarSelectoresDeClientes();
    return { success: true, tabla: tablaAmortizacion };
}

function registrarPagoDeCuota(idCliente, numeroCuota) {
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) return { error: "❌ Cliente sin crédito activo" };

    const credito = cliente.credito;
    const cuotas = credito.tablaAmortizacion;
    const pagosRealizados = credito.pagosRealizados || [];
    const totalCuotas = cuotas.filter(f => f.cuota !== "TOTAL").length;

    if (numeroCuota < 1 || numeroCuota > totalCuotas) return { error: "❌ Número de cuota inválido" };
    if (esCuotaPagadaReal(pagosRealizados, numeroCuota)) return { error: "❌ Esta cuota ya fue pagada" };

    let siguienteCuotaNum = 1;
    for (let i = 1; i <= totalCuotas; i++) {
        if (!esCuotaPagadaReal(pagosRealizados, i)) { siguienteCuotaNum = i; break; }
    }
    if (numeroCuota !== siguienteCuotaNum) {
        return { error: `⚠️ La siguiente cuota a pagar es la #${siguienteCuotaNum}. Pague las cuotas en orden.` };
    }

    const fechaPago = new Date().toISOString().slice(0, 10);
    credito.pagosRealizados.push({ cuota: numeroCuota, fechaPago });
    credito.pagosRealizados.sort((a, b) => a.cuota - b.cuota);

    const filaTabla = credito.tablaAmortizacion.find(f => f.cuota === numeroCuota);
    if (filaTabla) filaTabla.fechaPago = fechaPago;

    credito.estado = credito.pagosRealizados.length === totalCuotas ? "CANCELADO" : "ACTIVO";

    guardarDatosEnLocalStorage();
    actualizarSelectoresDeClientes();
    actualizarEstadoCreditoEnPantalla();
    mostrarSiguienteCuota();

    return {
        success: true,
        message: `✅ Pago cuota ${numeroCuota} registrado correctamente.`,
        fechaPago,
        siguienteCuota: siguienteCuotaNum + 1 <= totalCuotas ? siguienteCuotaNum + 1 : null
    };
}

// Pagar desde botón en la tabla
window.pagarCuotaDesdeTabla = function (numeroCuota) {
    const selector = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selector.value);
    if (!idCliente) { alert("⚠️ Seleccione un cliente en el selector de pagos primero."); return; }

    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) { alert("⚠️ Cliente sin crédito activo."); return; }
    if (esCuotaPagadaReal(cliente.credito.pagosRealizados, numeroCuota)) { alert(`La cuota #${numeroCuota} ya fue pagada.`); return; }

    const resultado = registrarPagoDeCuota(idCliente, numeroCuota);
    const mensajeDiv = document.getElementById('paymentStatusMsg');
    const detalleDiv = document.getElementById('paymentDetailsMsg');

    if (resultado.error) {
        mensajeDiv.innerHTML = `<span style="color:#bc6c25;">${resultado.error}</span>`;
        detalleDiv.innerHTML = '';
    } else {
        mensajeDiv.innerHTML = `<span style="color:#2c6e49;">${resultado.message}</span>`;
        const credito = cliente.credito;
        const cuotaPagada = credito.tablaAmortizacion.find(c => c.cuota === numeroCuota);
        const saldoReal = calcularSaldoPendienteReal(credito);
        const totalPagado = numeroCuotasPagadas(credito.pagosRealizados);
        const totalCuotas = credito.tablaAmortizacion.filter(f => f.cuota !== "TOTAL").length;
        const cuotasRestantes = totalCuotas - totalPagado;
        let siguienteCuota = null;
        for (let i = 1; i <= totalCuotas; i++) {
            if (!esCuotaPagadaReal(credito.pagosRealizados, i)) { siguienteCuota = i; break; }
        }

        detalleDiv.innerHTML = `
            <strong>🧑 Cliente: ${cliente.nombre}</strong><br>
            <strong>💳 Detalle del pago:</strong><br>
            • Cuota número <span style="color:#2c6e49; font-size:1.1rem;">${numeroCuota}</span> pagada ✅<br>
            • Fecha de pago: <strong>${resultado.fechaPago}</strong><br>
            • Monto pagado: $${cuotaPagada.cuotaTotal}<br>
            • Capital abonado: $${cuotaPagada.capital}<br>
            • Interés pagado: $${cuotaPagada.interes}<br>
            • <strong>Saldo restante: $${saldoReal.toFixed(2)}</strong><br>
            • Progreso: ${totalPagado}/${totalCuotas} cuotas | Pendientes: ${cuotasRestantes}
            ${siguienteCuota ? `<br>• ⏳ <strong style="color:#2c7da0;">Próxima: #${siguienteCuota}</strong>` : '<br>• 🎉 <strong style="color:#2c6e49;">¡CRÉDITO CANCELADO!</strong>'}
        `;

        refrescarTablaActual();
        const resumenDiv = document.getElementById('simulationSummary');
        resumenDiv.innerHTML = `<strong>📌 Crédito de ${cliente.nombre} actualizado</strong><br>Pagos: ${totalPagado}/${totalCuotas}<br>Saldo: $${saldoReal.toFixed(2)}`;
        document.getElementById('paymentQuotaNum').value = '';
    }
};

// ==================== MOSTRAR TABLA ====================
// fechaConsulta: "YYYY-MM-DD" o null → si se da, columna estado muestra pagada/no pagada según esa fecha
function mostrarTablaAmortizacionEnPantalla(tabla, clienteNombre = "", fechaConsulta = null) {
    const contenedor = document.getElementById('amortTableContainer');
    const resumenDiv = document.getElementById('resumenPagos');
    const resumenTexto = document.getElementById('resumenPagosTexto');

    if (!tabla || tabla.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:#5e6f8d;">👉 Simula un crédito para generar la tabla de amortización</p>';
        if (resumenDiv) resumenDiv.style.display = 'none';
        return;
    }

    const selector = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selector.value);
    let pagosRealizados = [];
    let nombreFinal = clienteNombre;

    if (idCliente) {
        const cliente = clientesRegistrados.find(c => c.id === idCliente);
        if (cliente && cliente.credito) {
            pagosRealizados = cliente.credito.pagosRealizados || [];
            if (!nombreFinal) nombreFinal = cliente.nombre;
        }
    }

    // Fecha de referencia para marcar como pagada por fecha
    let fechaRef = null;
    if (fechaConsulta) {
        fechaRef = new Date(fechaConsulta + 'T00:00:00');
    }

    let html = `<div style="margin-bottom:0.6rem; font-size:0.85rem; color:#2c5e6e; display:flex; flex-wrap:wrap; gap:1rem; align-items:center;">
        <span>📌 <strong>Cliente:</strong> ${nombreFinal || '—'}</span>
        ${fechaConsulta ? `<span>📅 <strong>Fecha consulta:</strong> ${fechaConsulta}</span>` : ''}
        ${numeroCuotasPagadas(pagosRealizados) > 0 ? `<span>✅ <strong>Pagos reales registrados:</strong> ${numeroCuotasPagadas(pagosRealizados)}</span>` : ''}
    </div>`;

    html += `<table><thead><tr>
        <th># Cuota</th>
        <th>Fecha Venc.</th>
        <th>Capital ($)</th>
        <th>Interés ($)</th>
        <th>Cuota Total ($)</th>
        <th>Saldo Restante ($)</th>
        <th>Fecha de Pago</th>
        <th style="text-align:center;">Estado / Acción</th>
    </tr></thead><tbody>`;

    let totalPagadas = 0;
    let totalNoPagadas = 0;
    let siguienteCuotaReal = null;

    // Calcular cuál es la siguiente cuota real (sin pagar)
    const soloFilas = tabla.filter(f => f.cuota !== "TOTAL");
    for (let i = 0; i < soloFilas.length; i++) {
        if (!esCuotaPagadaReal(pagosRealizados, soloFilas[i].cuota)) {
            siguienteCuotaReal = soloFilas[i].cuota;
            break;
        }
    }

    tabla.forEach(fila => {
        if (fila.cuota === "TOTAL") {
            html += `<tr style="background:#eef2f9; font-weight:bold;">
                <td style="text-align:center">TOTAL</td>
                <td>—</td>
                <td>${fila.capital}</td>
                <td>${fila.interes}</td>
                <td><strong>${fila.cuotaTotal}</strong></td>
                <td>—</td>
                <td>—</td>
                <td style="text-align:center;">—</td>
            </tr>`;
            return;
        }

        // ¿Está pagada realmente (pago registrado manualmente)?
        const pagadaReal = esCuotaPagadaReal(pagosRealizados, fila.cuota);
        const fechaPagoRegistrada = getFechaPago(pagosRealizados, fila.cuota) || fila.fechaPago || null;

        // ¿Está pagada según la fecha de consulta?
        let pagadaPorFecha = false;
        if (fechaRef) {
            const fechaVenc = new Date(fila.fecha + 'T00:00:00');
            pagadaPorFecha = fechaVenc <= fechaRef;
        }

        // Estado final: pagada si fue registrada manualmente O si la fecha de vencimiento <= fecha consulta
        const estaPagada = pagadaReal || pagadaPorFecha;

        if (estaPagada) totalPagadas++;
        else totalNoPagadas++;

        const esSiguienteReal = (fila.cuota === siguienteCuotaReal);

        let rowBg, borderStyle, accionHtml, fechaPagoHtml;

        if (pagadaReal) {
            // Pagada manualmente → verde sólido con fecha real
            rowBg = '#eaf6ef';
            borderStyle = 'border-left: 4px solid #2c6e49;';
            fechaPagoHtml = `<span style="color:#2c6e49; font-weight:bold;">📅 ${fechaPagoRegistrada}</span>`;
            accionHtml = `<span style="color:#2c6e49; font-weight:bold;">✅ Pagada</span>`;
        } else if (pagadaPorFecha) {
            // Vence antes de la fecha consulta pero no tiene pago registrado → amarillo advertencia
            rowBg = '#fff8e1';
            borderStyle = 'border-left: 4px solid #f5b042;';
            fechaPagoHtml = `<span style="color:#bc6c25; font-size:0.75rem;">⚠️ Sin registrar</span>`;
            accionHtml = `<span style="color:#bc6c25; font-weight:bold;">⚠️ No pagada</span>`;
        } else {
            // No pagada y aún no vence
            rowBg = '#fff5ee';
            borderStyle = '';
            fechaPagoHtml = `<span style="color:#aaa;">—</span>`;

            if (esSiguienteReal) {
                rowBg = '#e8f0fe';
                accionHtml = `
                    <button onclick="pagarCuotaDesdeTabla(${fila.cuota})"
                        style="padding:0.3rem 0.7rem;margin:0;width:auto;font-size:0.75rem;
                               background:#2c6e49;border-radius:0.6rem;color:white;cursor:pointer;
                               border:none;font-weight:bold;white-space:nowrap;"
                        title="Registrar pago de cuota ${fila.cuota}">
                        💰 Pagar
                    </button>`;
            } else {
                accionHtml = `<span style="color:#bc6c25; font-weight:bold; font-size:0.8rem;">❌ No pagada</span>`;
            }
        }

        html += `<tr style="background:${rowBg}; ${borderStyle}">
            <td style="text-align:center; font-weight:${esSiguienteReal && !pagadaReal ? 'bold' : 'normal'};">
                ${fila.cuota}${esSiguienteReal && !pagadaReal ? ' ⬅️' : ''}
            </td>
            <td>${fila.fecha}</td>
            <td>${fila.capital}</td>
            <td>${fila.interes}</td>
            <td><strong>${fila.cuotaTotal}</strong></td>
            <td>${fila.saldo}</td>
            <td style="text-align:center; font-size:0.8rem;">${fechaPagoHtml}</td>
            <td style="text-align:center;">${accionHtml}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    // Resumen
    if (totalPagadas > 0 || totalNoPagadas > 0) {
        if (resumenDiv) {
            resumenDiv.style.display = 'block';
            let textoResumen = `
                ✅ Pagadas: <strong style="color:#2c6e49;">${totalPagadas}</strong> &nbsp;|&nbsp;
                ❌ No pagadas: <strong style="color:#bc6c25;">${totalNoPagadas}</strong> &nbsp;|&nbsp;
                📊 Total: <strong>${totalPagadas + totalNoPagadas}</strong> cuotas
            `;
            if (siguienteCuotaReal && totalNoPagadas > 0) {
                textoResumen += ` &nbsp;|&nbsp; ⏳ <strong style="color:#2c7da0;">Próxima: #${siguienteCuotaReal}</strong>`;
            }
            if (totalNoPagadas === 0 && totalPagadas > 0) {
                textoResumen += ` &nbsp;|&nbsp; 🎉 <strong style="color:#2c6e49;">¡CRÉDITO CANCELADO!</strong>`;
            }
            resumenTexto.innerHTML = textoResumen;
        }
    } else {
        if (resumenDiv) resumenDiv.style.display = 'none';
    }
}

// Refresca la tabla con la fecha de consulta actual (si hay una ingresada)
function refrescarTablaActual() {
    const selector = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selector.value);
    if (!idCliente) return;
    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) return;

    const fechaInput = document.getElementById('fechaReferencia').value;
    mostrarTablaAmortizacionEnPantalla(cliente.credito.tablaAmortizacion, cliente.nombre, fechaInput || null);
}

// ==================== CONSULTAR POR FECHA ====================
function consultarPorFecha() {
    const selector = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selector.value);
    const fechaConsulta = document.getElementById('fechaReferencia').value;

    if (!idCliente) {
        alert("⚠️ Primero seleccione un cliente en el selector de pagos.");
        return;
    }
    if (!fechaConsulta) {
        alert("⚠️ Seleccione una fecha para consultar.");
        return;
    }

    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) {
        alert(`⚠️ El cliente ${cliente ? cliente.nombre : 'seleccionado'} no tiene crédito activo.`);
        return;
    }

    // Mostrar la tabla completa con la fecha de consulta aplicada
    mostrarTablaAmortizacionEnPantalla(cliente.credito.tablaAmortizacion, cliente.nombre, fechaConsulta);
}

function calcularSaldoPendienteReal(credito) {
    const pagosRealizados = credito.pagosRealizados || [];
    for (let i = 0; i < credito.tablaAmortizacion.length; i++) {
        const fila = credito.tablaAmortizacion[i];
        if (fila.cuota === "TOTAL") continue;
        if (!esCuotaPagadaReal(pagosRealizados, fila.cuota)) return fila.saldo;
    }
    return 0;
}

// ==================== MANEJADORES ====================
function manejarSimulacionCredito() {
    const selectorCliente = document.getElementById('loanClientSelect');
    const idCliente = parseInt(selectorCliente.value);
    const nombreCliente = selectorCliente.options[selectorCliente.selectedIndex]?.text || "Cliente";

    if (!idCliente) { alert("Por favor, selecciona un cliente en 'Solicitar Crédito'"); return; }

    const monto = parseFloat(document.getElementById('loanAmount').value);
    const plazoMeses = parseInt(document.getElementById('loanMonths').value);
    const tasaAnual = parseFloat(document.getElementById('interestRate').value);
    const tipoAmortizacion = document.getElementById('amortType').value;

    if (isNaN(monto) || isNaN(plazoMeses) || isNaN(tasaAnual) || monto <= 0 || plazoMeses <= 0) {
        alert("Ingrese valores válidos");
        return;
    }

    const resultado = simularCreditoParaCliente(idCliente, monto, plazoMeses, tasaAnual, tipoAmortizacion);

    if (resultado.error) {
        alert(resultado.error);
    } else {
        mostrarTablaAmortizacionEnPantalla(resultado.tabla, nombreCliente, null);
        document.getElementById('resumenPagos').style.display = 'none';

        const cuotaEjemplo = resultado.tabla[0].cuotaTotal;
        document.getElementById('simulationSummary').innerHTML =
            `<strong>✅ Simulación exitosa - ${nombreCliente}</strong><br>
             📌 Cuota mensual: $${cuotaEjemplo} (${tipoAmortizacion === 'frances' ? 'fija' : 'variable'})<br>
             📊 Plazo: ${plazoMeses} meses`;

        actualizarSelectoresDeClientes();
        actualizarEstadoCreditoEnPantalla();
        mostrarSiguienteCuota();
        document.getElementById('paymentStatusMsg').innerHTML = '';
        document.getElementById('paymentDetailsMsg').innerHTML = '';
    }
}

function manejarRegistroPago() {
    const selectorCliente = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selectorCliente.value);
    if (!idCliente) { alert("⚠️ Seleccione un cliente en el selector de pagos"); return; }

    const numeroCuota = parseInt(document.getElementById('paymentQuotaNum').value);
    if (isNaN(numeroCuota) || numeroCuota <= 0) { alert("⚠️ Ingrese un número de cuota válido"); return; }

    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (!cliente || !cliente.credito) { alert("⚠️ Cliente sin crédito activo"); return; }

    if (esCuotaPagadaReal(cliente.credito.pagosRealizados, numeroCuota)) {
        document.getElementById('paymentStatusMsg').innerHTML = `<span style="color:#bc6c25;">❌ La cuota #${numeroCuota} ya fue pagada</span>`;
        document.getElementById('paymentDetailsMsg').innerHTML = '';
        return;
    }

    const resultado = registrarPagoDeCuota(idCliente, numeroCuota);
    const mensajeDiv = document.getElementById('paymentStatusMsg');
    const detalleDiv = document.getElementById('paymentDetailsMsg');

    if (resultado.error) {
        mensajeDiv.innerHTML = `<span style="color:#bc6c25;">${resultado.error}</span>`;
        detalleDiv.innerHTML = '';
    } else {
        mensajeDiv.innerHTML = `<span style="color:#2c6e49;">${resultado.message}</span>`;

        const credito = cliente.credito;
        const cuotaPagada = credito.tablaAmortizacion.find(c => c.cuota === numeroCuota);
        const saldoReal = calcularSaldoPendienteReal(credito);
        const totalPagado = numeroCuotasPagadas(credito.pagosRealizados);
        const totalCuotas = credito.tablaAmortizacion.filter(f => f.cuota !== "TOTAL").length;
        const cuotasRestantes = totalCuotas - totalPagado;
        let siguienteCuota = null;
        for (let i = 1; i <= totalCuotas; i++) {
            if (!esCuotaPagadaReal(credito.pagosRealizados, i)) { siguienteCuota = i; break; }
        }

        detalleDiv.innerHTML = `
            <strong>🧑 Cliente: ${cliente.nombre}</strong><br>
            <strong>💳 Detalle del pago:</strong><br>
            • Cuota número <span style="color:#2c6e49; font-size:1.1rem;">${numeroCuota}</span> pagada ✅<br>
            • Fecha de pago: <strong>${resultado.fechaPago}</strong><br>
            • Monto pagado: $${cuotaPagada.cuotaTotal}<br>
            • Capital abonado: $${cuotaPagada.capital}<br>
            • Interés pagado: $${cuotaPagada.interes}<br>
            • <strong>Saldo restante: $${saldoReal.toFixed(2)}</strong><br>
            • Progreso: ${totalPagado}/${totalCuotas} cuotas | Pendientes: ${cuotasRestantes}
            ${siguienteCuota ? `<br>• ⏳ <strong style="color:#2c7da0;">Próxima: #${siguienteCuota}</strong>` : '<br>• 🎉 <strong style="color:#2c6e49;">¡CRÉDITO CANCELADO!</strong>'}
        `;

        refrescarTablaActual();
        document.getElementById('simulationSummary').innerHTML =
            `<strong>📌 Crédito de ${cliente.nombre} actualizado</strong><br>Pagos: ${totalPagado}/${totalCuotas}<br>Saldo: $${saldoReal.toFixed(2)}`;

        document.getElementById('paymentQuotaNum').value = '';
        if (siguienteCuota) document.getElementById('paymentQuotaNum').placeholder = `Ej: ${siguienteCuota} (siguiente)`;
    }
}

function manejarReinicioCredito() {
    const selectorCliente = document.getElementById('paymentClientSelect');
    const idCliente = parseInt(selectorCliente.value);
    if (!idCliente) { alert("Seleccione un cliente"); return; }

    const cliente = clientesRegistrados.find(c => c.id === idCliente);
    if (cliente && cliente.credito) {
        cliente.credito = null;
        guardarDatosEnLocalStorage();
        actualizarSelectoresDeClientes();
        document.getElementById('amortTableContainer').innerHTML = '<p style="text-align:center;">Crédito eliminado, simule nuevamente.</p>';
        document.getElementById('simulationSummary').innerHTML = '';
        actualizarEstadoCreditoEnPantalla();
        document.getElementById('paymentStatusMsg').innerHTML = '';
        document.getElementById('paymentDetailsMsg').innerHTML = '';
        document.getElementById('resumenPagos').style.display = 'none';
        mostrarSiguienteCuota();
    } else {
        alert("El cliente no tiene crédito activo");
    }
}

function manejarRegistroCliente() {
    const nombre = document.getElementById('clientName').value.trim();
    const cedula = document.getElementById('clientId').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    if (!nombre || !cedula) { alert("Nombre e identificación son obligatorios"); return; }

    clientesRegistrados.push({ id: siguienteIdCliente++, nombre, cedula, email, credito: null });
    guardarDatosEnLocalStorage();
    actualizarSelectoresDeClientes();
    mostrarListaDeClientes();
    document.getElementById('clientName').value = '';
    document.getElementById('clientId').value = '';
    document.getElementById('clientEmail').value = '';
    alert(`Cliente ${nombre} registrado con éxito.`);
}

// ==================== TEST ====================
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

function scrollToTest() {
    document.getElementById('testSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const testContent = document.getElementById('testContent');
    const toggleBtn = document.getElementById('toggleTestBtn');
    if (testContent.style.display === 'none') {
        testContent.style.display = 'block';
        toggleBtn.textContent = '📋 Ocultar Test';
        toggleBtn.style.background = '#bc6c25';
    }
}

function mostrarTestEvaluacion() {
    const contenedor = document.getElementById('quizContainer');
    let html = '';
    preguntasTest.forEach((pregunta, indice) => {
        html += `<div class="question"><p><strong>${indice + 1}. ${pregunta.texto}</strong></p>`;
        pregunta.opciones.forEach((opcion, idxOpcion) => {
            html += `<label style="display:block;margin-left:1rem;"><input type="radio" name="pregunta${indice}" value="${idxOpcion}"> ${opcion}</label>`;
        });
        html += `</div>`;
    });
    contenedor.innerHTML = html;
}

function corregirTestEvaluacion() {
    let puntaje = 0;
    for (let i = 0; i < preguntasTest.length; i++) {
        const sel = document.querySelector(`input[name="pregunta${i}"]:checked`);
        if (sel && parseInt(sel.value) === preguntasTest[i].correcta) puntaje++;
    }
    const resultadoDiv = document.getElementById('quizResult');
    resultadoDiv.innerHTML = `<strong>🎯 Puntaje: ${puntaje}/${preguntasTest.length}</strong> - ${puntaje >= 3 ? "¡Excelente!" : "Repasa los conceptos."}`;
    resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const preguntasTest = [
    { texto: "¿Qué representa el valor futuro en interés compuesto?", opciones: ["El capital inicial", "El monto acumulado después de n periodos", "La tasa de interés", "La inflación"], correcta: 1 },
    { texto: "En el sistema de amortización francés, las cuotas son:", opciones: ["Decrecientes", "Crecientes", "Constantes (fijas)", "Variables según saldo"], correcta: 2 },
    { texto: "Fórmula para calcular interés simple:", opciones: ["I = C * i * t", "I = C * (1+i)^n", "VF = VP*(1+i)^n", "i = VF/VP -1"], correcta: 0 },
    { texto: "Si una tasa anual es 12% capitalizable mensual, la tasa mensual es:", opciones: ["1%", "2%", "0.5%", "12%"], correcta: 0 },
    { texto: "En la tabla de amortización alemana, ¿qué componente permanece constante?", opciones: ["El interés", "La cuota total", "El abono a capital", "El saldo deudor"], correcta: 2 }
];

// ==================== INICIALIZACIÓN ====================
cargarDatosDesdeLocalStorage();
mostrarTestEvaluacion();

document.getElementById('simulateBtn').addEventListener('click', manejarSimulacionCredito);
document.getElementById('registerClientBtn').addEventListener('click', manejarRegistroCliente);
document.getElementById('registerPaymentBtn').addEventListener('click', manejarRegistroPago);
document.getElementById('resetLoanStatusBtn').addEventListener('click', manejarReinicioCredito);
document.getElementById('submitQuizBtn').addEventListener('click', corregirTestEvaluacion);
document.getElementById('toggleTestBtn').addEventListener('click', toggleTestVisibility);
document.getElementById('floatingTestBtn').addEventListener('click', scrollToTest);
document.getElementById('filtrarPorFechaBtn').addEventListener('click', consultarPorFecha);

// Al cambiar fecha se refresca automáticamente si hay cliente con crédito
document.getElementById('fechaReferencia').addEventListener('change', function () {
    refrescarTablaActual();
});

// Poner fecha de hoy por defecto
const fechaInput = document.getElementById('fechaReferencia');
if (fechaInput) {
    const hoy = new Date();
    fechaInput.value = hoy.toISOString().slice(0, 10);
}

// Al cambiar cliente → mostrar su tabla automáticamente
document.getElementById('paymentClientSelect').addEventListener('change', function () {
    actualizarEstadoCreditoEnPantalla();
    mostrarSiguienteCuota();
    const idCliente = parseInt(this.value);
    if (idCliente) {
        const cliente = clientesRegistrados.find(c => c.id === idCliente);
        if (cliente && cliente.credito) {
            const fechaActual = document.getElementById('fechaReferencia').value;
            mostrarTablaAmortizacionEnPantalla(cliente.credito.tablaAmortizacion, cliente.nombre, fechaActual || null);
        }
    }
});

actualizarSelectoresDeClientes();
actualizarEstadoCreditoEnPantalla();
mostrarSiguienteCuota();