import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const token = req.cookies.get('authToken');

  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        userId: true
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable ou rôle manquant' }, { status: 404 });
    }
    try {
      let parrams = await prisma.userParrams.findUnique({
        where: {userId: user.userId}
      })
      if(!parrams) {
        parrams = await prisma.userParrams.create({
          data: {
              userId: user.userId
          },
      });
      }
      Object.assign(user, parrams);
    } catch (error) {
      return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 404 });
    }
    const roleIds = user.role.split('/').map(Number).filter(Boolean);

    if (roleIds.length !== 0) {
      
    }

    const grades = await prisma.grade.findMany({
      where: { id: { in: roleIds } },
      select: { listDroit: true },
    });

    if (grades.length === 0) {
      return NextResponse.json({ error: 'Aucun grade associé trouvé' }, { status: 406 });
    }

    const uniqueDroits = new Set();

    grades.forEach((grade) => {
      if (grade.listDroit) {
        grade.listDroit.split('/').forEach((droitId) => {
          uniqueDroits.add(Number(droitId));
        });
      }
    });

    if (uniqueDroits.size === 0) {
      return NextResponse.json({ error: 'Aucun droit trouvé' }, { status: 404 });
    }

    user.listDroits = Array.from(uniqueDroits);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Erreur JWT ou serveur :', error);
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }
}
