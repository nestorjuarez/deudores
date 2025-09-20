'use client';

import { useState, useEffect } from 'react';
import { Deuda } from '@/types';

interface EditDeudaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeudaUpdated: (updatedDeuda: Deuda) => void;
  deudaToEdit: Deuda | null;
}

export default function EditDeudaModal({ isOpen, onClose, onDeudaUpdated, deudaToEdit }: EditDeudaModalProps) {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deudaToEdit) {
      setMonto(deudaToEdit.monto.toString());
      setDescripcion(deudaToEdit.descripcion);
    }
  }, [deudaToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deudaToEdit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/deudores/${deudaToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: parseFloat(monto), descripcion }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar la deuda.');
      }
      
      onDeudaUpdated(data);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Editar Deuda</h2>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Monto</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
