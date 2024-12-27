import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function PUT(request) {
    const token = request.cookies.get('authToken');

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
                role: true,
                color: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable ou rôle manquant' }, { status: 404 });
        }

        const { username, color } = await request.json();

        if (!username || !color) {
            return NextResponse.json({ error: 'Les champs username et color sont requis' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                username,
                color,
            },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
    }
}
