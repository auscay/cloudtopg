import { BaseRepository } from '../../user/repositories/BaseRepository';
import { ApplicationFee } from '../models/ApplicationFee';
import { IApplicationFee, ApplicationFeeStatus } from '../../../types';

export class ApplicationFeeRepository extends BaseRepository<IApplicationFee> {
  constructor() {
    super(ApplicationFee);
  }

  async findByUserId(userId: string): Promise<IApplicationFee | null> {
    return this.model.findOne({ userId }).sort({ createdAt: -1 });
  }

  async findByReference(reference: string): Promise<IApplicationFee | null> {
    return this.model.findOne({ paystackReference: reference });
  }

  async findByStatus(status: ApplicationFeeStatus): Promise<IApplicationFee[]> {
    return this.model.find({ status }).sort({ createdAt: -1 });
  }

  async hasUserPaid(userId: string): Promise<boolean> {
    const payment = await this.model.findOne({
      userId,
      status: ApplicationFeeStatus.PAID
    });
    return !!payment;
  }

  async updatePaymentStatus(
    reference: string,
    status: ApplicationFeeStatus,
    paymentDate?: Date,
    metadata?: any,
    failureReason?: string
  ): Promise<IApplicationFee | null> {
    return this.model.findOneAndUpdate(
      { paystackReference: reference },
      {
        status,
        paymentDate,
        metadata,
        failureReason
      },
      { new: true }
    );
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: { status: ApplicationFeeStatus.PAID }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async countPaidApplications(): Promise<number> {
    return this.model.countDocuments({ status: ApplicationFeeStatus.PAID });
  }

  async findAll(): Promise<IApplicationFee[]> {
    return this.model.find({}).sort({ createdAt: -1 });
  }
}

