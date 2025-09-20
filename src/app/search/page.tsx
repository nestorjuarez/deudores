'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Deudor {
  dni: string;
  nombre: string;
  apellido: string;
}

interface Comercio {
  name: string | null;
}

interface Deuda {
  id: string;
  monto: number;
  descripcion: string;
  fecha: string;
  deudor: Deudor;
  comercio: Comercio;
}

export default function SearchPage() {
  const [dni, setDni] = useState('');
  const [results, setResults] = useState<Deuda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    try {
      const response = await fetch(`/api/search?dni=${dni}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error en la búsqueda');
      }
      
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Buscar Deudor por DNI</h1>
          <Link href="/" className="text-blue-500 hover:text-blue-800 font-medium">
            Volver al Panel de Control
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSearch}>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ingrese DNI sin puntos"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isLoading}>
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            {isLoading && <p>Buscando...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {searched && !isLoading && !error && results.length === 0 && (
              <p>No se encontraron deudas para el DNI ingresado.</p>
            )}
            {results.length > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-2xl font-semibold mb-4">Resultados</h2>
                <ul className="divide-y divide-gray-200">
                  {results.map((deuda) => (
                    <li key={deuda.id} className="py-4">
                      <p><strong>Deudor:</strong> {deuda.deudor.nombre} {deuda.deudor.apellido}</p>
                      <p><strong>DNI:</strong> {deuda.deudor.dni}</p>
                      <p><strong>Monto:</strong> ${deuda.monto}</p>
                      <p><strong>Registrado por:</strong> {deuda.comercio.name || 'Comercio no especificado'}</p>
                      <p><strong>Descripción:</strong> {deuda.descripcion}</p>
                      <p><strong>Fecha de deuda:</strong> {new Date(deuda.fecha).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
