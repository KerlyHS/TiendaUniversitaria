/**
 * Utilidad centralizada para el manejo de errores amigables para el usuario.
 * Transforma errores técnicos y códigos de estado HTTP en mensajes claros.
 */

export interface AppError {
    message: string;
    technicalDetails?: string;
    statusCode?: number;
}

export const getFriendlyErrorMessage = (error: any): string => {
    // Si es un error de red (fetch falló antes de obtener respuesta)
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
        return 'No hay conexión con el servidor. Verifica tu internet e inténtalo de nuevo.';
    }

    // Si recibimos un objeto con código de estado (simulado o real)
    if (error.status || error.statusCode) {
        const status = error.status || error.statusCode;

        switch (status) {
            case 401:
                return 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo para continuar.';
            case 403:
                return 'No tienes permisos para realizar esta acción.';
            case 404:
                return 'La información solicitada no está disponible actualmente.';
            case 500:
                return 'Ocurrió un problema en nuestro servidor. Estamos trabajando para solucionarlo.';
            default:
                if (status >= 500) {
                    return 'Estamos experimentando dificultades técnicas. Inténtalo más tarde.';
                }
        }
    }

    // Manejo de errores específicos de Stripe o pagos (si vienen en el mensaje)
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('payment_intent') || errorMsg.includes('stripe') || errorMsg.includes('pago')) {
        return 'No fue posible procesar el pago. Por favor, verifica los datos de tu tarjeta.';
    }

    if (errorMsg.includes('json') || errorMsg.includes('unexpected character')) {
        return 'Recibimos una respuesta inesperada del servidor. Inténtalo de nuevo.';
    }

    // Mensaje por defecto para errores desconocidos
    return 'Algo salió mal. Por favor, intenta realizar la acción nuevamente.';
};

/**
 * Registra el error técnico en consola pero retorna el mensaje amigable.
 */
export const handleAppError = (error: any, context: string = 'App'): string => {
    console.error(`[Technical Error - ${context}]:`, error);
    return getFriendlyErrorMessage(error);
};
