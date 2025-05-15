import { PrismaClient } from '@prisma/client';
import { Session } from 'next-auth';
import { NextRequest } from 'next/server';

export interface Context {
  req?: NextRequest;
  session: Session | null;
  prisma: PrismaClient;
}