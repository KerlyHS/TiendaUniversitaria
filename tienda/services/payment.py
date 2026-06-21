import stripe
from django.conf import settings
from decimal import Decimal

# Configure stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripePaymentService:
    @staticmethod
    def create_checkout_session(pedido, success_url, cancel_url):
        """
        Crea una sesión de Checkout en Stripe para un Pedido específico.
        """
        line_items = []
        for detalle in pedido.detalles_venta.all():
            # Stripe expects amounts in cents for USD
            # Convertimos a string primero para evitar problemas de precisión si es un float
            unit_amount_cents = int(Decimal(str(detalle.precio_unitario)) * Decimal('100'))
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': detalle.nombre_producto,
                    },
                    'unit_amount': unit_amount_cents,
                },
                'quantity': detalle.cantidad,
            })
            
        # Añadir impuesto como line item separado si es mayor a 0
        if pedido.impuesto > 0:
            impuesto_cents = int(Decimal(str(pedido.impuesto)) * Decimal('100'))
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'IVA (12%)',
                    },
                    'unit_amount': impuesto_cents,
                },
                'quantity': 1,
            })

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=str(pedido.id),
            customer_email=pedido.cliente.email,
        )
        return session

    @staticmethod
    def create_payment_intent(pedido):
        """
        Crea un PaymentIntent en Stripe para usar con Stripe Elements.
        """
        total_cents = int(Decimal(str(pedido.total)) * Decimal('100'))
        
        intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency='usd',
            metadata={
                'pedido_id': str(pedido.id),
                'cliente_email': pedido.cliente.email,
            }
        )
        return intent

    @staticmethod
    def construct_webhook_event(payload, sig_header):
        """
        Valida la firma y construye el evento del Webhook.
        """
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        if endpoint_secret:
            return stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            # Fallback en desarrollo si no hay secret (inseguro en prod)
            import json
            event_data = json.loads(payload)
            return stripe.Event.construct_from(event_data, stripe.api_key)
