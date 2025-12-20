import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentMethod,
  PaymentStatus,
  Status,
  SubscriptionStatus,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany({
        where: { is_active: Status.ACTIVE },
        orderBy: { price: 'asc' },
      });

      return {
        success: true,
        data: plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          price: Number(plan.price),
          duration_days: plan.duration_days,
          features: plan.features,
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Planlardi olishda xatolik!`);
    }
  }

  async purchase(userId: string, dto: CreateSubscriptionDto) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: dto.plan_id },
      });

      if (!plan) throw new NotFoundException(`Bunday ta'rif rejasi topilmadi!`);
      console.log(userId);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration_days);

      const result = await this.prisma.$transaction(async (prisma) => {
        const newSubscription = await prisma.userSubscription.create({
          data: {
            user_id: userId,
            plan_id: plan.id,
            start_date: startDate,
            end_date: endDate,
            status: SubscriptionStatus.ACTIVE,
            auto_renew: dto.auto_renew,
          },
        });
        console.log(newSubscription.user_id);
        const payment = await prisma.payment.create({
          data: {
            user_subscription_id: newSubscription.id,
            amount: plan.price,
            payment_method: PaymentMethod.CARD,
            payment_details: dto.payment_details,
            status: PaymentStatus.COMPLETED,
            external_transaction_id: `txn_${Date.now()}`,
          },
        });
        return { subscription: newSubscription, payment };
      });
      return {
        success: true,
        message: `Obuna muvaffaqiyatli sotib olindi`,
        data: {
          subscription: {
            id: result.subscription.id,
            plan: {
              id: plan.id,
              name: plan.name,
            },
            startDate: result.subscription.start_date,
            endDate: result.subscription.end_date,
            status: result.subscription.status,
            auto_renew: result.subscription.auto_renew,
          },
          payment: {
            id: result.payment.id,
            amount: result.payment.amount,
            status: result.payment.status,
            external_transaction_id: result.payment.external_transaction_id,
            payment_method: `card`,
          },
        },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Tolov jarayonida xatolik!`);
    }
  }
}
