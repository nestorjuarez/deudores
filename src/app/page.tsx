'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Importando iconos
import AddDeudorModal from '@/components/AddDeudorModal';
import EditDeudaModal from '@/components/EditDeudaModal';

interface Deudor {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
}
interface Deuda {
  id: string;
  monto: number;
  descripcion: string;
  deudor: Deudor;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deudaToEdit, setDeudaToEdit] = useState<Deuda | null>(null);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchDeudas = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch('/api/deudores');
          if (!response.ok) {
            throw new Error('No se pudieron cargar los datos');
          }
          const data = await response.json();
          setDeudas(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDeudas();
    }
  }, [status]);

  const handleOpenEditModal = (deuda: Deuda) => {
    setDeudaToEdit(deuda);
    setIsEditModalOpen(true);
  };

  const handleDeudaUpdated = (updatedDeuda: Deuda) => {
    setDeudas(deudas.map((d) => (d.id === updatedDeuda.id ? updatedDeuda : d)));
  };

  const handleAddDeudor = (nuevaDeuda: Deuda) => {
    setDeudas([nuevaDeuda, ...deudas]);
  };

  const handleDeleteDeuda = async (deudaId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
      return;
    }

    try {
      const response = await fetch(`/api/deudores/${deudaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar la deuda.');
      }

      setDeudas(deudas.filter((deuda) => deuda.id !== deudaId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
              <p className="text-sm text-gray-500 mt-1">Comercio: {session.user?.name}</p>
            </div>
            <nav className="flex items-center gap-4">
              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin/users" className="text-green-600 hover:text-green-800 font-medium">
                  Gestión de Usuarios
                </Link>
              )}
              <Link href="/search" className="text-blue-500 hover:text-blue-800 font-medium">
                Buscar Deudores
              </Link>
              <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Lista de Deudores
              </h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Agregar Deudor
              </button>
            </div>
            <div className="bg-white shadow rounded-lg">
              <div className="p-4">
                {isLoading && <p>Cargando deudores...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && deudas.length === 0 && (
                  <p className="text-gray-500">
                    No hay deudores registrados todavía.
                  </p>
                )}
                {!isLoading && !error && deudas.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deudas.map((deuda) => (
                        <tr key={deuda.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{deuda.deudor.dni}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{deuda.deudor.nombre} {deuda.deudor.apellido}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${deuda.monto}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{deuda.descripcion}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button
                              onClick={() => handleOpenEditModal(deuda)}
                              className="text-indigo-600 hover:text-indigo-900 transition-transform transform hover:scale-125"
                              title="Editar"
                            >
                              <FiEdit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteDeuda(deuda.id)}
                              className="text-red-600 hover:text-red-900 transition-transform transform hover:scale-125"
                              title="Eliminar"
                            >
                              <FiTrash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <AddDeudorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDeudor={handleAddDeudor}
      />
      <EditDeudaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onDeudaUpdated={handleDeudaUpdated}
        deudaToEdit={deudaToEdit}
      />
    </div>
  );
}
