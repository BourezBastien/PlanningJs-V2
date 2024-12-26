import { NextRequest, NextResponse } from 'next/server';
import { globalPrisma, projectPrisma } from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  try {
    let users;

    if (username && username.trim() !== '') {
      users = await globalPrisma.user.findMany({
        where: {
          username: {
            contains: username,
          },
        },
      });
    } else {
      users = await globalPrisma.user.findMany();
    }

    const filteredResponse = await Promise.all(
      users.map(async (user) => {
        const parrams = await projectPrisma.userParrams.findUnique({
          where: { userId: user.userId },
        });
        if (!parrams) {
          return null;
        }
        Object.assign(user, parrams);
        return user;
      })
    );
    users = filteredResponse.filter((user) => user !== null);
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Erreur côté serveur:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs ou des événements' }, { status: 500 });
  }
}