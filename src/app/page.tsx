'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Importando iconos
import AddDeudorModal from '@/components/AddDeudorModal';
import EditDeudaModal from '@/components/EditDeudaModal';
import { Deuda } from '@/types';

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
        } catch (err) {
          setError((err as Error).message);
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
    } catch (err) {
      setError((err as Error).message);
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
              <p className="text-sm text-gray-500 mt-1">Comercio: {session.user?.name}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-4">
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
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
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
            <div className="bg-white shadow rounded-lg overflow-x-auto">
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
                    <thead className="bg-gray-50 hidden md:table-header-group">
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
                        <tr key={deuda.id} className="block md:table-row border-b md:border-none p-4 md:p-0">
                          <td className="block md:table-cell px-6 py-4 whitespace-nowrap md:border-b">
                            <span className="font-bold md:hidden">DNI: </span>{deuda.deudor.dni}
                          </td>
                          <td className="block md:table-cell px-6 py-4 whitespace-nowrap md:border-b">
                            <span className="font-bold md:hidden">Nombre: </span>{deuda.deudor.nombre} {deuda.deudor.apellido}
                          </td>
                          <td className="block md:table-cell px-6 py-4 whitespace-nowrap md:border-b">
                            <span className="font-bold md:hidden">Monto: </span>${deuda.monto}
                          </td>
                          <td className="block md:table-cell px-6 py-4 whitespace-nowrap md:border-b">
                            <span className="font-bold md:hidden">Descripción: </span>{deuda.descripcion}
                          </td>
                          <td className="block md:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center gap-4 mt-4 md:mt-0">
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
                            </div>
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
