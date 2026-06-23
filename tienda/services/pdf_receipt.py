import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from django.utils.timezone import localtime

def generate_receipt_pdf(transaccion):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=1, # Center
        spaceAfter=20,
        textColor=colors.HexColor('#006633')
    )
    normal_style = styles['Normal']
    bold_style = ParagraphStyle('BoldStyle', parent=styles['Normal'], fontName='Helvetica-Bold')
    
    # Title
    elements.append(Paragraph("Comprobante de Pago - Tienda Universitaria UNL", title_style))
    elements.append(Spacer(1, 10))
    
    # General Info
    pedido = transaccion.pedido
    cliente = pedido.cliente
    
    info_text = f"""
    <b>Transacción ID:</b> {transaccion.stripe_session_id or transaccion.id}<br/>
    <b>Pedido #:</b> {pedido.numero_pedido}<br/>
    <b>Fecha:</b> {localtime(transaccion.fecha_actualizacion).strftime('%Y-%m-%d %H:%M:%S')}<br/>
    <b>Cliente:</b> {cliente.nombre_completo} ({cliente.email})<br/>
    <b>Estado de Pago:</b> {transaccion.get_estado_display()}<br/>
    <b>Método de Pago:</b> {transaccion.metodo_pago}
    """
    elements.append(Paragraph(info_text, normal_style))
    elements.append(Spacer(1, 20))
    
    # Table data
    data = [['Producto', 'Variación', 'Cantidad', 'Precio Unit.', 'Subtotal']]
    
    for detalle in pedido.detalles_venta.all():
        var_nombre = detalle.variacion.nombre if detalle.variacion else 'N/A'
        
        # Strip trailing zeros for decimals like 1.00 -> 1 if needed, but it's fine
        cantidad_str = f"{detalle.cantidad:g}"
        
        data.append([
            Paragraph(detalle.nombre_producto, normal_style),
            var_nombre,
            cantidad_str,
            f"${detalle.precio_unitario:.2f}",
            f"${detalle.subtotal:.2f}"
        ])
        
    data.append(['', '', '', 'Subtotal:', f"${pedido.subtotal:.2f}"])
    data.append(['', '', '', 'Impuestos:', f"${pedido.impuesto:.2f}"])
    data.append(['', '', '', 'TOTAL PAGADO:', f"${pedido.total:.2f}"])
    
    # Table formatting
    t = Table(data, colWidths=[200, 100, 60, 80, 80])
    
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#006633')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('ALIGN', (0,1), (0,-1), 'LEFT'), # Left align products
        ('ALIGN', (3,1), (-1,-1), 'RIGHT'), # Right align prices
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('BACKGROUND', (0,1), (-1,-4), colors.HexColor('#F5F5F5')),
        ('GRID', (0,0), (-1,-4), 0.5, colors.grey),
        ('LINEABOVE', (-2,-3), (-1,-1), 1, colors.black),
        ('FONTNAME', (-2,-1), (-1,-1), 'Helvetica-Bold'),
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 40))
    
    msg_style = ParagraphStyle('MsgStyle', parent=styles['Normal'], alignment=1, fontSize=11, fontName='Helvetica-Oblique')
    elements.append(Paragraph("¡Gracias por su compra! Por favor, presente este comprobante impreso o digital al momento de retirar su pedido en la Tienda Universitaria UNL.", msg_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
