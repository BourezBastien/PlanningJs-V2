import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const generateRandomPassword = (longueur = 8) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let chaine = '';
  for (let i = 0; i < longueur; i++) {
      chaine += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return chaine;
}

export async function GET(req) {
  try {
    const { userId } = req.nextUrl.searchParams;

    let response;

    if (userId) {
      response = await prisma.user.findUnique({
        where: { id: parseInt(userId, 10) },
        select: {
          id: true,
          username: true,
          userId: true
        },
      });

      let parrams = await prisma.userParrams.findUnique({
        where: {userId: response.userId}
      })
  
      if(!parrams) {
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
      };
  
      Object.assign(response, parrams);

      if (!response) {
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
      }
    } else {
      response = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          userId: true
        },
      });
        const filteredResponse = await Promise.all(
        response.map(async (user) => {
          const parrams = await prisma.userParrams.findUnique({
            where: { userId: user.userId },
          });
          if (!parrams) {
            return null;
          }
          Object.assign(user, parrams);
          return user;
        })
      );
      response = filteredResponse.filter((user) => user !== null);      
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    const { username, color } = await request.json();

    if (!username || !color) {
      return NextResponse.json({ error: 'Le nom d\'utilisateur et la couleur sont requis' }, { status: 400 });
    }

    const tempPassword = generateRandomPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        color,
        role: "1",
        temp_password: hashedTempPassword,
      },
    });

    return NextResponse.json({ user: newUser, tempPassword }, { status: 201 }); // `tempPassword` peut être envoyé pour montrer le mot de passe généré, si besoin
  } catch (error) {
    console.error('Erreur côté serveur:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
  }
}