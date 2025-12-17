import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'alisheryondoshaliyev77@gmail.com';
    const existingAdmin = await prisma.user.findUnique({
        where: {email: adminEmail},
    });

    if(!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin123!',10);
        const admin = await prisma.user.create({
            data: {
                user_name: 'SuperAdmin',
                email: adminEmail,
                password_hash: hashedPassword,
                role: Role.SUPERADMIN,
                is_active: true,
            },
        });
        console.log(`SuperAdmin yaratiladi!`);
    }

    const freePlan = await prisma.subscriptionPlan.findFirst({where: {name: 'Free'}});
    if(!freePlan){
        await prisma.subscriptionPlan.create({
            data: {
                name: 'Free',
                price: 0.00,
                duration_days: 30,
                features: ["SD Sifat", "Reklamali", "Cheklangan katalog"],
                is_active: 'ACTIVE'
            }
        });
        console.log('✅ Free plan yaratildi');
    }

    const premiumPlan = await prisma.subscriptionPlan.findFirst({where: {name: 'Premium'}});
    if(!premiumPlan){
        await prisma.subscriptionPlan.create({
            data: {
                name: 'Premium',
                price: 49.99,
                duration_days: 30,
                features: ["HD Sifat", "Reklamasiz", "To'liq katalog", "Offline ko'rish"],
                is_active: 'ACTIVE'
            }
        });
        console.log('✅ Premium plan yaratildi');
    }
}

main()
    .catch((e)=>{
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect();
    })