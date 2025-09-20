import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dni = searchParams.get('dni');

  if (!dni) {
    return NextResponse.json({ error: 'El parámetro DNI es requerido' }, { status: 400 });
  }

  try {
    const deudas = await prisma.deuda.findMany({
      where: {
        deudor: {
          dni: dni,
        },
      },
      include: {
        deudor: true,
        comercio: {
          select: {
            name: true, // Solo seleccionamos el nombre del comercio por privacidad
          },
        },
      },
    });

    if (deudas.length === 0) {
      return NextResponse.json({ message: 'No se encontraron deudas para el DNI proporcionado' }, { status: 404 });
    }

    return NextResponse.json(deudas);
  } catch (error) {
    console.error('Error al buscar las deudas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
