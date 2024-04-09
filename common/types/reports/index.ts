export type IReportResult = {
    product: string;
    sum: number;
    cost: number;
    profit: number;
    profitability: number;
};

export type IReportTotal = {
    totalSum: number;
    totalCost: number;
    totalProfitability: number;
    totalProfit: number;
};

export type Report = IReportTotal | IReportResult;
