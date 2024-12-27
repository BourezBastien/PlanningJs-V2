import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Nom d'utilisateur et mot de passe requis" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    let isPasswordValid = false;
    let isTempPasswordValid = false;

    // Vérifiez si les champs password et temp_password existent avant la comparaison
    if (user.password) {
      isPasswordValid = await bcrypt.compare(password.trim(), user.password);
    }
    if (user.temp_password) {
      isTempPasswordValid = await bcrypt.compare(password.trim(), user.temp_password);
    }

    if (!isPasswordValid && !isTempPasswordValid) {
      return NextResponse.json({ error: 'Identifiants ou mot de passe incorrects' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const response = NextResponse.json({
      message: 'Connexion réussie',
      user: { id: user.id, username: user.username },
      isTempPassword: isTempPasswordValid,
    });

    // Définir le cookie avec le token JWT
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur lors de la connexion :', error.message, error.stack);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
