import { BaseRepository } from '../../user/repositories/BaseRepository';
import { Subscription } from '../models/Subscription';
import { ISubscription, SubscriptionStatus } from '../../../types';

export class SubscriptionRepository extends BaseRepository<ISubscription> {
  constructor() {
    super(Subscription);
  }

  async findByUserId(userId: string): Promise<ISubscription[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }

  async findActiveByUserId(userId: string): Promise<ISubscription | null> {
    return this.model.findOne({
      userId,
      status: SubscriptionStatus.ACTIVE,
      endDate: { $gt: new Date() }
    });
  }

  async findByStatus(status: SubscriptionStatus): Promise<ISubscription[]> {
    return this.model.find({ status }).sort({ createdAt: -1 });
  }

  async findDuePayments(): Promise<ISubscription[]> {
    return this.model.find({
      status: SubscriptionStatus.ACTIVE,
      nextPaymentDue: { $lte: new Date() }
    });
  }

  async updatePaymentInfo(
    id: string,
    totalAmountPaid: number,
    amountRemaining: number,
    currentSemester: number,
    nextPaymentDue?: Date,
    nextPaymentAmount?: number
  ): Promise<ISubscription | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        totalAmountPaid,
        amountRemaining,
        currentSemester,
        nextPaymentDue,
        nextPaymentAmount,
        lastPaymentDate: new Date(),
        status: amountRemaining === 0 ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING
      },
      { new: true }
    );
  }

  async cancelSubscription(id: string, reason?: string): Promise<ISubscription | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason
      },
      { new: true }
    );
  }

  async findAll(): Promise<ISubscription[]> {
    return this.model.find({}).sort({ createdAt: -1 });
  }
}

