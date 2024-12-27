import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request) {
    const genererChaineAleatoire = (longueur) => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let chaine = '';
        for (let i = 0; i < longueur; i++) {
            chaine += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return chaine;
    };
    const genererNombreAleatoire = (longueur) => {
        const max = Math.pow(10, longueur) - 1; // Le plus grand nombre avec "longueur" chiffres
        const nombreAleatoire = Math.floor(Math.random() * (max + 1)); // Nombre aléatoire entre 0 et max
        return nombreAleatoire.toString().padStart(longueur, '0'); // Ajoute des zéros à gauche si nécessaire
    };
    
    try {
        const body = await request.json();
        const { username, email, color, password } = body;

        const tempPassword = password || genererChaineAleatoire(8);
        const userId = genererNombreAleatoire(10);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                userId: userId,
                email: email || null,
                password: hashedPassword,
                tempPassword: password ? '' : tempPassword,
            },
        });

        return NextResponse.json(
            { user: newUser, tempPassword: password ? null : tempPassword },
            { status: 201 }
        );
    } catch (e) {
        // Gestion des erreurs Prisma
        console.error(e);

        if (e.code === 'P2031') {
            return NextResponse.json(
                { error: 'MongoDB nécessite un Replica Set pour cette opération.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la création du user.' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
