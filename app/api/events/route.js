import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Les dates de début et de fin sont requises' }, { status: 400 });
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59Z`);

  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            debutAt: {
              gte: start,
              lte: end,
            },
          },
          {
            finAt: {
              gte: start,
              lte: end,
            },
          }
        ]
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des événements' }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, isFullDay, userId, address, typeView } = body;

    if (!title || !startDate || !endDate || !userId || (startDate && startDate == "Invalid Date")) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    console.log(startDate);
    const getDayStart = startDate.split('T')[0].split('-')[2]
    const getDayEnd = endDate.split('T')[0].split('-')[2]

    const getHoursStart = startDate.split('T')[1].split(':')[0]
    const getHoursEnd = endDate.split('T')[1].split(':')[0]
    

    const debutAt = new Date(Date.UTC(
      new Date(startDate).getUTCFullYear(),
      new Date(startDate).getUTCMonth(),
      getDayStart,
      getHoursStart,
      new Date(startDate).getMinutes()
    ));
    
    const finAt = new Date(Date.UTC(
      new Date(endDate).getUTCFullYear(),
      new Date(endDate).getUTCMonth(),
      getDayEnd,
      getHoursEnd,
      new Date(endDate).getMinutes()
    ));

    const newEvent = await prisma.event.create({
      data: {
        title,
        subtitle: description || '',
        debutAt,
        finAt,
        fullDay: isFullDay,
        userId,
        address: address || null,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ message: 'Error creating event' }, { status: 500 });
  }
}
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, description, startDate, endDate, isFullDay, userId, address } = body;

    if (!id) {
      return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const getDayStart = startDate.split('T')[0].split('-')[2]
    const getDayEnd = endDate.split('T')[0].split('-')[2]
    
    const getHoursStart = startDate.split('T')[1].split(':')[0]
    const getHoursEnd = endDate.split('T')[1].split(':')[0]

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        subtitle: description || '',
        debutAt: new Date(Date.UTC(
          new Date(startDate).getUTCFullYear(),
          new Date(startDate).getUTCMonth(),
          getDayStart,
          getHoursStart,
          new Date(startDate).getUTCMinutes(),
          new Date(startDate).getUTCSeconds()
        )),
        finAt: new Date(Date.UTC(
          new Date(endDate).getUTCFullYear(),
          new Date(endDate).getUTCMonth(),
          getDayEnd,
          getHoursEnd,
          new Date(endDate).getUTCMinutes(),
          new Date(endDate).getUTCSeconds()
        )),
        fullDay: isFullDay,
        userId,
        address: address || null,
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error editing event:', error);
    return NextResponse.json({ message: 'Error editing event' }, { status: 500 });
  }
}