import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { nom, prenom, email } = await request.json();

    if (!nom || !prenom || !email) {
      return NextResponse.json({ error: 'Le nom d\'utilisateur et la couleur sont requis' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        username: `${nom} ${prenom}`,
        color: "gray",
        role: "1",
        exterieur: true,
        temp_password: '',
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Erreur côté serveur:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
  }
}