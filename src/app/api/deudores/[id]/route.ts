import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const deudaId = params.id;

  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const deuda = await prisma.deuda.findUnique({
      where: { id: deudaId },
    });

    if (!deuda) {
      return NextResponse.json({ error: 'Deuda no encontrada' }, { status: 404 });
    }

    // Security check: Ensure the user owns the debt they are trying to delete
    if (deuda.comercioId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    await prisma.deuda.delete({
      where: { id: deudaId },
    });

    return NextResponse.json({ message: 'Deuda eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la deuda:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const deudaId = params.id;

  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { monto, descripcion } = await request.json();

    if (monto === undefined || descripcion === undefined) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }
    
    const deuda = await prisma.deuda.findUnique({
      where: { id: deudaId },
    });

    if (!deuda) {
      return NextResponse.json({ error: 'Deuda no encontrada' }, { status: 404 });
    }

    if (deuda.comercioId !== session.user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const updatedDeuda = await prisma.deuda.update({
      where: { id: deudaId },
      data: {
        monto: parseFloat(monto),
        descripcion,
      },
      include: {
        deudor: true,
      },
    });

    return NextResponse.json(updatedDeuda, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la deuda:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
