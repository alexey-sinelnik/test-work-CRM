export type IReportResult = {
    date?: any;
    sum: number;
    name?: string;
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
