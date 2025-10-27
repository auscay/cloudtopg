import { BaseRepository } from '../../user/repositories/BaseRepository';
import { Transaction } from '../models/Transaction';
import { ITransaction, TransactionStatus } from '../../../types';

export class TransactionRepository extends BaseRepository<ITransaction> {
  constructor() {
    super(Transaction);
  }

  async findByUserId(userId: string): Promise<ITransaction[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }

  async findBySubscriptionId(subscriptionId: string): Promise<ITransaction[]> {
    return this.model.find({ subscriptionId }).sort({ createdAt: -1 });
  }

  async findByReference(reference: string): Promise<ITransaction | null> {
    return this.model.findOne({ paystackReference: reference });
  }

  async findByStatus(status: TransactionStatus): Promise<ITransaction[]> {
    return this.model.find({ status }).sort({ createdAt: -1 });
  }

  async updateTransactionStatus(
    reference: string,
    status: TransactionStatus,
    paymentDate?: Date,
    metadata?: any,
    failureReason?: string
  ): Promise<ITransaction | null> {
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
        $match: { status: TransactionStatus.SUCCESS }
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

  /**
   * Get total revenue from application fees
   */
  async getTotalApplicationFee(): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: { 
          status: TransactionStatus.SUCCESS,
          'metadata.paymentType': 'application_fee'
        }
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

  /**
   * Get total revenue from subscription payments
   */
  async getTotalSubscriptionRevenue(): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: { 
          status: TransactionStatus.SUCCESS,
          $or: [
            { subscriptionId: { $exists: true } },
            { planId: { $exists: true } }
          ],
          'metadata.paymentType': { $ne: 'application_fee' }
        }
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

  /**
   * Get total number of unique users who made payments
   */
  async getTotalUsers(): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: { status: TransactionStatus.SUCCESS }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'total'
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}

