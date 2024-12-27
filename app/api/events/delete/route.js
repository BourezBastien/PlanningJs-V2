import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'événement requis' }, { status: 400 });
    }

    const deletedEvent = await prisma.event.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: 'Événement supprimé avec succès', deletedEvent }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de l\'événement' }, { status: 500 });
  }
}
