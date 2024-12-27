import { NextResponse } from 'next/server';

function differenceInCalendarDays(date1, date2) {
  const normalizedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const normalizedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const msDifference = normalizedDate2 - normalizedDate1;
  return msDifference / (1000 * 60 * 60 * 24);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function copyTime(sourceDate, targetDate) {
  const result = new Date(targetDate);
  result.setHours(
    sourceDate.getHours(),
    sourceDate.getMinutes(),
    sourceDate.getSeconds(),
    sourceDate.getMilliseconds()
  );
  return result;
}

function calculateTimeDifference(startDate, endDate) {
  return endDate.getTime() - startDate.getTime();
}

import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  const eventId = parseInt(params.id);
  const { date, updateWithDrag = false } = await request.json();

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const daysDifference = differenceInCalendarDays(new Date(existingEvent.finAt), new Date(existingEvent.debutAt));
    const timeDifference = calculateTimeDifference(new Date(existingEvent.debutAt), new Date(existingEvent.finAt));

    const debutAt = new Date(date);
    const finAt = new Date(debutAt.getTime() + timeDifference);

    let debutAtWithTime = copyTime(new Date(existingEvent.debutAt), debutAt);
    let finAtWithTime = copyTime(new Date(existingEvent.finAt), finAt);

    if (updateWithDrag) {
      debutAtWithTime = debutAt;
      finAtWithTime = new Date(debutAt.getTime() + timeDifference);
    }

    const updatedData = {
      debutAt: debutAtWithTime,
      finAt: finAtWithTime,
    };

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updatedData,
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'événement' },
      { status: 500 }
    );
  }
}
