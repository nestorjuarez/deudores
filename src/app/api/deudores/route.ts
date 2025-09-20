import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const deudas = await prisma.deuda.findMany({
      where: {
        comercioId: currentUser.id,
      },
      include: {
        deudor: true, // Incluir los datos del deudor en cada deuda
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(deudas);
  } catch (error) {
    console.error('Error al obtener las deudas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { dni, nombre, apellido, monto, descripcion } = await request.json();

    if (!dni || !nombre || !apellido || !monto || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!currentUser) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Upsert: crea el deudor si no existe, o lo recupera si ya existe por DNI
    const deudor = await prisma.deudor.upsert({
      where: { dni },
      update: {},
      create: { dni, nombre, apellido },
    });

    // Crear la nueva deuda
    const nuevaDeuda = await prisma.deuda.create({
      data: {
        monto,
        descripcion,
        comercio: {
          connect: { id: currentUser.id },
        },
        deudor: {
          connect: { id: deudor.id },
        },
      },
    });

    return NextResponse.json(nuevaDeuda, { status: 201 });
  } catch (error) {
    console.error('Error al crear la deuda:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
