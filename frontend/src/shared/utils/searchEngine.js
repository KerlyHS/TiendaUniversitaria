/**
 * Tienda Universitaria - Custom Client-Side Search Engine
 * Implementa algoritmos de recuperación de información clásicos sin dependencias externas.
 */

// 1. Distancia de Levenshtein (Fuzzy Search)
// Calcula el número mínimo de operaciones (inserción, eliminación, sustitución) requeridas para transformar str1 en str2.
const levenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

// 2. Generador de N-Gramas (Para autocompletado y coincidencias parciales)
const generateNGrams = (text, min = 2, max = 4) => {
  const ngrams = new Set();
  const normalized = text.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/g, '');
  
  if (normalized.length < min) return new Set([normalized]);
  
  for (let n = min; n <= max; n++) {
    for (let i = 0; i <= normalized.length - n; i++) {
      ngrams.add(normalized.slice(i, i + n));
    }
  }
  return ngrams;
};

// Tokenizador básico
const tokenize = (text) => {
  return text.toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(t => t.length > 2); // Excluir stop words muy cortas
};

export class CustomSearchEngine {
  constructor(documents = []) {
    this.documents = documents;
    this.invertedIndex = {}; // Mapea tokens a arrays de { docId, termFrequency }
    this.documentFrequencies = {}; // Cuántos documentos contienen un token
    this.totalDocs = documents.length;
    this.buildIndex();
  }

  // Construir Índice Invertido y calcular frecuencias para TF-IDF
  buildIndex() {
    this.documents.forEach(doc => {
      // El corpus de búsqueda concatena nombre y categoría
      const textToSearch = `${doc.nombre} ${doc.categoria?.nombre || ''}`;
      const tokens = tokenize(textToSearch);
      
      const termCounts = {};
      tokens.forEach(token => {
        termCounts[token] = (termCounts[token] || 0) + 1;
      });

      // Calcular TF (Frecuencia del término en este documento específico)
      const totalTerms = tokens.length;
      
      Object.keys(termCounts).forEach(token => {
        const tf = termCounts[token] / totalTerms;
        
        if (!this.invertedIndex[token]) {
          this.invertedIndex[token] = [];
          this.documentFrequencies[token] = 0;
        }
        
        this.invertedIndex[token].push({ docId: doc.id, tf });
        this.documentFrequencies[token]++;
      });
    });
  }

  // 3. TF-IDF y Búsqueda
  search(query) {
    if (!query || query.trim().length < 2) return this.documents;

    const queryTokens = tokenize(query);
    const queryNGrams = generateNGrams(queryTokens.join(''));
    const scores = {}; // docId -> score

    // Inicializar scores
    this.documents.forEach(doc => {
      scores[doc.id] = 0;
    });

    queryTokens.forEach(qToken => {
      // a. TF-IDF Exact Match (Búsqueda por Índice Invertido)
      if (this.invertedIndex[qToken]) {
        // IDF = log(Total Documentos / Documentos con este término)
        const idf = Math.log10(this.totalDocs / this.documentFrequencies[qToken]);
        
        this.invertedIndex[qToken].forEach(record => {
          scores[record.docId] += record.tf * idf * 10; // Boost exact matches
        });
      }

      // b. Fuzzy Search (Levenshtein) sobre todos los tokens del índice
      // Para encontrar typos (ej. "chaompa" en vez de "chompa")
      Object.keys(this.invertedIndex).forEach(indexToken => {
        if (Math.abs(indexToken.length - qToken.length) <= 2) {
          const distance = levenshteinDistance(qToken, indexToken);
          // Si es muy similar (distancia 1 o 2 dependiendo de longitud)
          if (distance > 0 && distance <= (qToken.length > 5 ? 2 : 1)) {
            const idf = Math.log10(this.totalDocs / this.documentFrequencies[indexToken]);
            this.invertedIndex[indexToken].forEach(record => {
              scores[record.docId] += record.tf * idf * 5; // Menor peso que el exact match
            });
          }
        }
      });
    });

    // c. Coincidencia de N-Gramas (para autocompletado de prefijos / fragmentos)
    this.documents.forEach(doc => {
      const text = `${doc.nombre}`.toLowerCase();
      // Si el query es substring directo, puntaje altísimo
      if (text.includes(query.toLowerCase())) {
        scores[doc.id] += 50; 
      }
      
      const docNGrams = generateNGrams(text);
      let ngramMatches = 0;
      queryNGrams.forEach(ng => {
        if (docNGrams.has(ng)) ngramMatches++;
      });
      // Añadir proporción de n-gramas coincidentes
      if (queryNGrams.size > 0) {
        scores[doc.id] += (ngramMatches / queryNGrams.size) * 15;
      }
    });

    // Ordenar y devolver resultados relevantes (score > 0)
    const results = this.documents
      .map(doc => ({ ...doc, _score: scores[doc.id] }))
      .filter(doc => doc._score > 0)
      .sort((a, b) => b._score - a._score);

    return results;
  }
}
