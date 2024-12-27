import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(req) {
    const token = req.cookies.get('authToken');
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const me = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!me) return NextResponse.json({ error: 'Utilisateur introuvable ou rôle manquant' }, { status: 404 });
        const roleIds = me.role.split('/').map(Number).filter(Boolean);

        const grades = await prisma.grade.findMany({
        where: { id: { in: roleIds } },
        select: { listDroit: true },
        });

        if (grades.length === 0) return NextResponse.json({ error: 'Aucun grade associé trouvé' }, { status: 406 });

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

        me.listDroits = Array.from(uniqueDroits);

        let users;

        // Vérifie si `0` est dans `me.listDroits`
        if (me.listDroits.includes(0) || me.listDroits.includes(4)) {
            users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    societeId: true,
                },
            });
        } else {
            users = await prisma.user.findMany({
                where: {
                    societeId: me.societeId,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    societeId: true,
                },
            });
        }

        users.forEach(user => {
            user.options = []
            if(me.listDroits.includes(0) || me.listDroits.includes(11)) {
                user.options.push("grade")
            }
            if(me.listDroits.includes(0) || me.listDroits.includes(12)) {
                user.options.push("delete")
            }
        })

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
    }
}