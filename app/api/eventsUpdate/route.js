import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function PUT(request) {
  try {
    const { id, debutAt, finAt, afterDay } = await request.json();

    if (!id && (!debutAt || !finAt)) {
      return NextResponse.json({ error: 'Les heures de début et de fin sont requises' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    let updatedEvent;
    if (debutAt) {
      const [debutHours, debutMinutes] = debutAt.split(':').map(Number);
      const updatedDebutAt = new Date(event.debutAt);
      updatedDebutAt.setUTCHours(debutHours);
      updatedDebutAt.setUTCMinutes(debutMinutes);

      let updatedFinAt = new Date(event.finAt);
      if ((updatedFinAt.getTime() - updatedDebutAt.getTime()) < 30 * 60 * 1000) {
        updatedFinAt = new Date(updatedDebutAt.getTime() + 30 * 60 * 1000);
      }

      updatedEvent = await prisma.event.update({
        where: { id: parseInt(id, 10) },
        data: {
          debutAt: updatedDebutAt,
          finAt: updatedFinAt,
        },
      });
    }

    if (finAt) {
      let updatedFinAt;
      if (afterDay) {
        updatedFinAt = new Date(event.finAt);
        updatedFinAt.setUTCDate(updatedFinAt.getUTCDate() + 1);
        updatedFinAt.setUTCHours(0);
        updatedFinAt.setUTCMinutes(0);
      } else {
        const [finHours, finMinutes] = finAt.split(':').map(Number);
        updatedFinAt = new Date(event.finAt);
        updatedFinAt.setUTCHours(finHours);
        updatedFinAt.setUTCMinutes(finMinutes);
      }

      let updatedDebutAt = new Date(event.debutAt);
      if ((updatedFinAt.getTime() - updatedDebutAt.getTime()) < 30 * 60 * 1000) {
        updatedDebutAt = new Date(updatedFinAt.getTime() - 30 * 60 * 1000);
      }

      updatedEvent = await prisma.event.update({
        where: { id: parseInt(id, 10) },
        data: {
          debutAt: updatedDebutAt,
          finAt: updatedFinAt,
        },
      });
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'événement' }, { status: 500 });
  }
}
