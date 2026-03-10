import { PaymentRecord, ReturnRecord, AnalysisResult } from '../types';

/**
 * 计算现值性价比算法
 * 付出公式: ∑(amount * γ^i * f(age))
 * 回报公式: ∑(value * 3^((now-t)/365))
 */
export class ValueCalculator {
  private gamma: number = 0.95; // 时间衰减系数

  /**
   * 年龄权重函数 f(age)
   * 年龄越大，付出的价值权重越高
   */
  private ageWeightFunction(ageAtTime: number): number {
    return 1 + (ageAtTime / 100);
  }

  /**
   * 计算时间加权的付出总值
   */
  calculateWeightedPayment(records: PaymentRecord[], currentAge: number): number {
    const now = new Date();
    let total = 0;

    records.forEach((record, index) => {
      const daysPassed = Math.floor((now.getTime() - record.date.getTime()) / (1000 * 60 * 60 * 24));
      const yearsPassed = daysPassed / 365;
      const ageAtTime = currentAge - yearsPassed;

      const timeDecay = Math.pow(this.gamma, index);
      const ageWeight = this.ageWeightFunction(ageAtTime);

      total += record.amount * timeDecay * ageWeight;
    });

    return total;
  }

  /**
   * 计算时间加权的回报总值
   * 使用指数增长模型，越早的回报价值越低
   */
  calculateWeightedReturn(records: ReturnRecord[]): number {
    const now = new Date();
    let total = 0;

    records.forEach((record) => {
      const daysPassed = Math.floor((now.getTime() - record.date.getTime()) / (1000 * 60 * 60 * 24));
      const yearsPassed = daysPassed / 365;

      // 使用3-8之间的基数，这里取中间值5
      const base = 5;
      const timeWeight = Math.pow(base, yearsPassed);

      total += record.value * timeWeight;
    });

    return total;
  }

  /**
   * 综合分析
   */
  analyze(
    payments: PaymentRecord[],
    returns: ReturnRecord[],
    currentAge: number
  ): AnalysisResult {
    const totalPayment = payments.reduce((sum, r) => sum + r.amount, 0);
    const totalReturn = returns.reduce((sum, r) => sum + r.value, 0);

    const timeWeightedPayment = this.calculateWeightedPayment(payments, currentAge);
    const ageWeightedReturn = this.calculateWeightedReturn(returns);

    // 性价比 = 回报 / 付出
    let roi: number;
    if (totalPayment > 0) {
      roi = (totalReturn / totalPayment) * 100;
    } else if (totalReturn > 0) {
      // 只有回报没有付出 = 白嫖成功，给予极高分数
      roi = 999;
    } else {
      // 既没有付出也没有回报
      roi = 0;
    }

    // 最终得分 = 加权回报 / 加权付出
    let finalScore: number;
    if (timeWeightedPayment > 0) {
      finalScore = (ageWeightedReturn / timeWeightedPayment) * 100;
    } else if (ageWeightedReturn > 0) {
      // 只有回报没有付出 = 白嫖成功，给予极高分数
      finalScore = 999;
    } else {
      // 既没有付出也没有回报
      finalScore = 0;
    }

    return {
      totalPayment,
      totalReturn,
      roi,
      timeWeightedPayment,
      ageWeightedReturn,
      finalScore
    };
  }
}
