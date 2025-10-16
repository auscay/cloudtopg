import { BaseRepository } from '../../user/repositories/BaseRepository';
import { PaymentPlan } from '../models/PaymentPlan';
import { IPaymentPlan, PaymentPlanType } from '../../../types';

export class PaymentPlanRepository extends BaseRepository<IPaymentPlan> {
  constructor() {
    super(PaymentPlan);
  }

  async findActivePlans(): Promise<IPaymentPlan[]> {
    return this.model.find({ isActive: true });
  }

  async findByType(type: PaymentPlanType): Promise<IPaymentPlan | null> {
    return this.model.findOne({ type, isActive: true });
  }

  async deactivatePlan(id: string): Promise<IPaymentPlan | null> {
    return this.model.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async activatePlan(id: string): Promise<IPaymentPlan | null> {
    return this.model.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  }
}

