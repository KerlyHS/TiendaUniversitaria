export const generateInvoiceHTML = (order: any) => {
    const {
        numero_pedido = '001-001-000000001',
        detalles = [],
        cliente_nombre = 'Consumidor Final',
        cliente_email = '',
        total = 0,
        subtotal = 0,
        impuesto = 0
    } = order;

    const numTotal = Number(total) || 0;
    const numSubtotal = Number(subtotal) || 0;
    const numImpuesto = Number(impuesto) || 0;

    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    // SRI Specifics (Professional simulation of RIDE format)
    const ruc = "1791712765001";

    // Generate a valid-looking 49-digit access key
    const sequential = numero_pedido.split('-').pop()?.padStart(9, '0') || "000000001";
    const dateKey = formattedDate.replace(/\//g, '');
    const accessKey = `${dateKey}01${ruc}1001001${sequential}123456781`.padEnd(49, '0');

    const authNumber = accessKey;
    const environment = "PRODUCCIÓN";
    const emission = "NORMAL";
    const addressMatriz = "AV. UNIVERSITARIA S/N Y CALLE MAXIMILIANO RODRIGUEZ";
    const addressSucursal = "LOJA - CAMPUS UNIVERSITARIO GUILLERMO FALCONI ESPINOSA";
    const obligadoContabilidad = "SI";

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${accessKey}`;
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${accessKey}&scale=2&height=10&includetext=false`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; color: #000; font-size: 9px; margin: 0; padding: 10px; line-height: 1.2; }
        .container { width: 100%; max-width: 800px; margin: 0 auto; }

        .header-section { display: flex; gap: 10px; margin-bottom: 10px; }
        .logo-box { width: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 0.5px solid #000; border-radius: 10px; padding: 10px; }
        .info-box { width: 50%; border: 0.5px solid #000; border-radius: 10px; padding: 10px; }

        .ruc-text { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
        .doc-type { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
        .doc-num { font-size: 12px; margin-bottom: 10px; }

        .company-info { width: 50%; border: 0.5px solid #000; border-radius: 10px; padding: 10px; margin-top: 10px; font-size: 8px; }
        .company-name { font-weight: bold; font-size: 10px; margin-bottom: 10px; text-transform: uppercase; }

        .client-section { width: 100%; border: 0.5px solid #000; border-radius: 0px; padding: 8px; margin-top: 10px; margin-bottom: 10px; }
        .client-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 5px; }

        table.items-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        table.items-table th { border: 0.5px solid #000; padding: 4px; text-align: center; background-color: #eee; font-size: 8px; }
        table.items-table td { border: 0.5px solid #000; padding: 4px; font-size: 8px; }

        .bottom-section { display: flex; margin-top: 10px; }
        .extra-info { width: 60%; border: 0.5px solid #000; padding: 10px; font-size: 8px; margin-right: 10px; }
        .totals-section { width: 40%; }

        table.totals-table { width: 100%; border-collapse: collapse; }
        table.totals-table td { border: 0.5px solid #000; padding: 3px; font-size: 8px; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }

        .barcode-container { text-align: center; margin-top: 10px; }
        .barcode-img { width: 100%; height: 40px; }
        .clave-acceso { font-size: 7px; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-section">
            <div style="width: 50%;">
                <div class="logo-box" style="border: none; align-items: flex-start; padding-left: 0;">
                    <h1 style="color: #005e26; margin: 0; font-size: 32px;">UNL</h1>
                    <div style="font-weight: bold; font-size: 11px;">UNIVERSIDAD NACIONAL DEL LITORAL</div>
                </div>

                <div class="company-info" style="width: 100%; box-sizing: border-box;">
                    <div class="company-name">UNIVERSIDAD NACIONAL DEL LITORAL</div>
                    <div><span class="bold">Dirección Matriz:</span> ${addressMatriz}</div>
                    <div><span class="bold">Dirección Sucursal:</span> ${addressSucursal}</div>
                    <div style="margin-top: 5px;"><span class="bold">Contribuyente Especial:</span> 000</div>
                    <div><span class="bold">OBLIGADO A LLEVAR CONTABILIDAD:</span> ${obligadoContabilidad}</div>
                </div>
            </div>

            <div class="info-box">
                <div class="ruc-text">R.U.C.: ${ruc}</div>
                <div class="doc-type">FACTURA</div>
                <div class="doc-num">No. ${numero_pedido}</div>
                <div><span class="bold">NÚMERO DE AUTORIZACIÓN:</span></div>
                <div style="font-size: 7.5px; margin-bottom: 5px;">${authNumber}</div>
                <div><span class="bold">FECHA Y HORA DE AUTORIZACIÓN:</span> ${formattedDate} ${formattedTime}</div>
                <div><span class="bold">AMBIENTE:</span> ${environment}</div>
                <div><span class="bold">EMISIÓN:</span> ${emission}</div>

                <div class="barcode-container">
                    <span class="bold">CLAVE DE ACCESO</span><br/>
                    <img src="${barcodeUrl}" class="barcode-img" alt="barcode"/>
                    <div class="clave-acceso">${accessKey}</div>
                </div>
            </div>
        </div>

        <div class="client-section">
            <div class="client-grid">
                <div><span class="bold">Razón Social / Nombres y Apellidos:</span> ${cliente_nombre}</div>
                <div><span class="bold">Identificación:</span> ${order.cliente_identificacion || '9999999999'}</div>
            </div>
            <div class="client-grid" style="margin-top: 3px;">
                <div><span class="bold">Fecha Emisión:</span> ${formattedDate}</div>
                <div><span class="bold">Guía Remisión:</span></div>
            </div>
            <div style="margin-top: 3px;"><span class="bold">Dirección:</span> ${order.cliente_direccion || 'LOJA, ECUADOR'}</div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Cod. Principal</th>
                    <th>Cant</th>
                    <th>Descripción</th>
                    <th>Detalle Adicional</th>
                    <th>Precio Unitario</th>
                    <th>Descuento</th>
                    <th>Precio Total</th>
                </tr>
            </thead>
            <tbody>
                ${detalles.map((item: any) => `
                    <tr>
                        <td style="text-align: center;">${item.producto || 'SKU'}</td>
                        <td style="text-align: center;">${parseFloat(item.cantidad).toFixed(2)}</td>
                        <td>${item.nombre_producto} ${item.variacion_nombre ? `- ${item.variacion_nombre}` : ''}</td>
                        <td></td>
                        <td class="text-right">${parseFloat(item.precio_unitario).toFixed(2)}</td>
                        <td class="text-right">0.00</td>
                        <td class="text-right">${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="bottom-section">
            <div class="extra-info">
                <div class="bold" style="font-size: 9px; margin-bottom: 5px;">Información Adicional</div>
                <div><span class="bold">Dirección:</span> ${order.cliente_direccion || 'LOJA, ECUADOR'}</div>
                <div><span class="bold">Email:</span> ${cliente_email}</div>
                <div><span class="bold">Referencia:</span> PEDIDO TIENDA VIRTUAL</div>

                <div style="margin-top: 10px; border-top: 0.5px solid #000; padding-top: 5px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="border: 0.5px solid #000; background: #eee;">Forma de Pago</th>
                            <th style="border: 0.5px solid #000; background: #eee;">Valor</th>
                        </tr>
                        <tr>
                            <td style="border: 0.5px solid #000;">OTROS CON UTILIZACION DEL SISTEMA FINANCIERO</td>
                            <td style="border: 0.5px solid #000;" class="text-right">${numTotal.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin-top: 10px;">
                    <img src="${qrUrl}" style="width: 70px; height: 70px;" alt="QR"/>
                </div>
            </div>

            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td>SUBTOTAL 12%</td>
                        <td class="text-right">${numSubtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>SUBTOTAL 0%</td>
                        <td class="text-right">0.00</td>
                    </tr>
                    <tr>
                        <td>SUBTOTAL NO OBJETO DE IVA</td>
                        <td class="text-right">0.00</td>
                    </tr>
                    <tr>
                        <td>SUBTOTAL EXENTO DE IVA</td>
                        <td class="text-right">0.00</td>
                    </tr>
                    <tr>
                        <td>SUBTOTAL SIN IMPUESTOS</td>
                        <td class="text-right">${numSubtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>TOTAL DESCUENTO</td>
                        <td class="text-right">0.00</td>
                    </tr>
                    <tr>
                        <td>ICE</td>
                        <td class="text-right">0.00</td>
                    </tr>
                    <tr>
                        <td>IVA 12%</td>
                        <td class="text-right">${numImpuesto.toFixed(2)}</td>
                    </tr>
                    <tr class="bold">
                        <td>VALOR TOTAL</td>
                        <td class="text-right">${numTotal.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};
