import mongoose from 'mongoose';
import { PaymentPlan } from '../models/PaymentPlan';
import { PaymentPlanType } from '../../../types';
import { config } from '../../../config';

const paymentPlans = [
  {
    name: 'Early Bird Plan',
    type: PaymentPlanType.EARLY_BIRD,
    description: 'Pay per semester during early registration period. ₦150,000 per semester for 4 semesters.',
    totalAmount: 600000,
    installmentAmount: 150000,
    numberOfInstallments: 4,
    semestersPerInstallment: 1,
    isActive: true
  },
  {
    name: 'Mid Plan (Post-Early Bird)',
    type: PaymentPlanType.MID,
    description: 'Pay for 2 semesters at a time. ₦300,000 per payment, total 2 payments.',
    totalAmount: 600000,
    installmentAmount: 300000,
    numberOfInstallments: 2,
    semestersPerInstallment: 2,
    isActive: true
  },
  {
    name: 'Normal Plan (Late Bird)',
    type: PaymentPlanType.NORMAL,
    description: 'Full upfront payment for all 4 semesters. ₦600,000 paid once.',
    totalAmount: 600000,
    installmentAmount: 600000,
    numberOfInstallments: 1,
    semestersPerInstallment: 4,
    isActive: true
  }
];

async function seedPaymentPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Clear existing payment plans
    await PaymentPlan.deleteMany({});
    console.log('Cleared existing payment plans');

    // Insert new payment plans
    const createdPlans = await PaymentPlan.insertMany(paymentPlans);
    console.log(`Successfully created ${createdPlans.length} payment plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`\n- ${plan.name} (${plan.type})`);
      console.log(`  Total Amount: ₦${plan.totalAmount.toLocaleString()}`);
      console.log(`  Installment Amount: ₦${plan.installmentAmount.toLocaleString()}`);
      console.log(`  Number of Installments: ${plan.numberOfInstallments}`);
      console.log(`  Semesters per Installment: ${plan.semestersPerInstallment}`);
    });

    console.log('\n✅ Payment plans seeded successfully!');
  } catch (error) {
    console.error('Error seeding payment plans:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

// Run the seed function
export default seedPaymentPlans;

