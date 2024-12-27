import bcrypt from 'bcryptjs';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function PUT(req) {
  // Parse les cookies pour extraire le token
  const cookies = parse(req.headers.get('cookie') || '');
  const token = cookies.authToken;

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
  }

  const { newPassword, confirmPassword } = await req.json();

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
        temp_password: '',
      },
    });

    // Générer un nouveau token valide
    const newToken = jwt.sign(
      { userId: updatedUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Mettre à jour le cookie avec le nouveau token
    const response = NextResponse.json(
      { message: 'Mot de passe mis à jour avec succès' },
      { status: 200 }
    );

    response.cookies.set('authToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe :', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    } else if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
