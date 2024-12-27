import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function PUT(request) {
  try {
    const { id, debutAt, finAt } = await request.json();
    if (!id && (!debutAt || !finAt)) {
      return NextResponse.json({ error: 'Les heures de début et de fin sont requises' }, { status: 400 });
    }

    let updatedEvent = await prisma.event.update({
      where: { id: parseInt(id, 10) },
      data: {
        debutAt: debutAt,
        finAt: finAt,
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'événement' }, { status: 500 });
  }
}
