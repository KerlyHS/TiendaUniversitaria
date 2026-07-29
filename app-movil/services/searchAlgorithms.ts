// --- searchAlgorithms.ts ---

import { Product } from '../types/product';

// 1.1 Fuzzy Search (Distancia de Levenshtein básica)
// Devuelve un valor entre 0 y 1, donde 1 es una coincidencia exacta.
const getSimilarity = (s1: string, s2: string): number => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const editDistance = (str1: string, str2: string) => {
        const costs = [];
        for (let i = 0; i <= str1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= str2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[str2.length] = lastValue;
        }
        return costs[str2.length];
    };

    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
};

// 1.2 Algoritmo TF-IDF
class TFIDF {
    documents: string[];

    constructor(documents: string[]) {
        this.documents = documents.map(doc => doc.toLowerCase());
    }

    // Frecuencia del término en un documento
    getTermFrequency(term: string, document: string): number {
        const words = document.split(/\W+/);
        const count = words.filter(word => word === term).length;
        return count / words.length;
    }

    // Frecuencia inversa de documento
    getInverseDocumentFrequency(term: string): number {
        const docsWithTerm = this.documents.filter(doc => doc.split(/\W+/).includes(term)).length;
        if (docsWithTerm === 0) return 0;
        return Math.log(this.documents.length / docsWithTerm);
    }

    // Calcula el score TF-IDF
    getScore(term: string, document: string): number {
        const tf = this.getTermFrequency(term, document.toLowerCase());
        const idf = this.getInverseDocumentFrequency(term);
        return tf * idf;
    }
}

// 1.3 Función Principal de Búsqueda Combinada
export const searchProducts = (query: string, products: Product[], categoryFilter: string = 'Todos'): Product[] => {
    if (!query.trim() && categoryFilter === 'Todos') return products;

    const lowerQuery = query.toLowerCase().trim();
    const queryTerms = lowerQuery.split(/\W+/);

    // Extraemos los "documentos" (nombres y codes de productos) para TF-IDF
    const corpus = products.map(p => `${p.name} ${p.code} ${p.category}`);
    const tfidf = new TFIDF(corpus);

    const scoredProducts = products.map((product, index) => {
        let score = 0;
        const document = corpus[index];

        // Aplicar filtro de categoría primero
        if (categoryFilter !== 'Todos' && product.category !== categoryFilter) {
            return { product, score: -1 };
        }

        if (lowerQuery) {
            // Puntuación por TF-IDF (búsqueda exacta/relevancia)
            queryTerms.forEach(term => {
                score += tfidf.getScore(term, document) * 2; // Peso extra para TF-IDF
            });

            // Puntuación por Fuzzy Search (tolerancia a errores)
            // Comparamos la query entera contra el nombre del producto
            const fuzzyScore = getSimilarity(lowerQuery, product.name.toLowerCase());
            if (fuzzyScore > 0.4) { // Umbral de similitud
                score += fuzzyScore;
            }

            // Coincidencia de code directo (alta prioridad)
            if (product.code.toLowerCase().includes(lowerQuery)) {
                score += 3;
            }
        } else {
            score = 1; // Si no hay query pero hay filtro, se muestran todos los de la categoría
        }

        return { product, score };
    });

    // Filtramos los que tienen score > 0 y ordenamos de mayor a menor relevancia
    return scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
};
