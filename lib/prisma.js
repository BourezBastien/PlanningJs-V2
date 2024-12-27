import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

const prisma =
    globalThis.prismaGlobal ??
    ((globalThis.prismaGlobal = prismaClientSingleton()), globalThis.prismaGlobal)

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma