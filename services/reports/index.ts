import { IReportResult, Report } from "../../common/types/reports";
import { ProductsCost } from "../../models/products/products-cost";
import { Op } from "sequelize";
import { OutgoingInvoice } from "../../models/orders/outgoing-invoice";
import { ProductsOfOutgoingInvoice } from "../../models/products/products-of-expense-invoice";

const createReport = async (from: string, to: string): Promise<Report[]> => {
    const result: Report[] = [];
    const productCost: ProductsCost[] = await ProductsCost.findAll({
        where: {
            date: { [Op.between]: [from ? from : "", to ? to : new Date(Date.now())] }
        }
    });

    const outgoingInvoice: OutgoingInvoice[] = await OutgoingInvoice.findAll({
        include: {
            model: ProductsOfOutgoingInvoice
        }
    });

    for (const invoice of outgoingInvoice) {
        invoice.products.forEach((element: ProductsOfOutgoingInvoice) => {
            const currentProduct = productCost.find(
                (productCost: ProductsCost) => productCost.product_id === element.product_id
            );

            if (!currentProduct) return;

            const profit: number =
                element.quantity * element.price - element.quantity * Number(currentProduct?.cost);
            const cost: number = element.quantity * Number(currentProduct?.cost);
            const sum: number = element.quantity * element.price;
            const profitability: number = Math.round((profit / cost) * 100);
            result.push({
                product: String(element.product_name),
                sum,
                cost,
                profit,
                profitability
            });
        });
    }

    const totalSum: number = result.reduce((acc: number, current: any) => acc + current.sum, 0);
    const totalCost: number = result.reduce((acc: number, current: any) => acc + current.cost, 0);
    const totalProfit: number = result.reduce(
        (acc: number, current: any) => acc + current.profit,
        0
    );
    const totalProfitability: number = result.reduce(
        (acc: number, current: any) => acc + current.profitability,
        0
    );

    result.push({
        totalSum,
        totalCost,
        totalProfit,
        totalProfitability
    });

    return result;
};

export { createReport };
