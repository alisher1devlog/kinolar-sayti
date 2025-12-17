import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
    constructor(private readonly prisma: PrismaService) {}

    async getPlans(){
        const plan  = await this.prisma.subscriptionPlan.
    }
}
