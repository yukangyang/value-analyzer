export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
}

export interface ReturnRecord {
  id: string;
  date: Date;
  value: number;
  description: string;
  category: string;
}

export interface AnalysisResult {
  totalPayment: number;
  totalReturn: number;
  roi: number;
  timeWeightedPayment: number;
  ageWeightedReturn: number;
  finalScore: number;
}
