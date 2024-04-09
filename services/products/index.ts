import { Products } from "../../models/products/products";
import { ICreateProductDto } from "../../common/types/products";
import { Op, where } from "sequelize";
import { ProductOfIncomingInvoice } from "../../models/products/product-of-incoming-invoice";
import { ProductsCost } from "../../models/products/products-cost";
import moment from "moment";

const createProduct = async (createProductDto: ICreateProductDto): Promise<Products> => {
    return Products.create({ name: createProductDto.name });
};
const findProductByName = async (productName: string): Promise<Products | null> => {
    return Products.findOne({ where: { name: productName } });
};

const findProductOfIncomingInvoiceByDate = async (
    productId: string,
    from: number | Date,
    to: number | Date
): Promise<ProductOfIncomingInvoice[]> => {
    return ProductOfIncomingInvoice.findAll({
        where: {
            product_id: productId,
            createdAt: {
                [Op.between]: [from, to]
            }
        }
    });
};

const calculateProductCost = async (productIds: string[]) => {
    for (const productId of productIds) {
        const currentProductCost: ProductsCost[] = await ProductsCost.findAll({
            where: { product_id: productId }
        });
        const today: Date = new Date();
        const firstDayOfMonth: Date = new Date(today.getFullYear(), today.getMonth(), 1);

        const lastDayOfPreviousMonthTime: number = new Date(
            firstDayOfMonth.getTime() - 1
        ).getTime();
        const firstDayOfPreviousMonthTime: number = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        ).getTime();

        const productsOfPreviousMonth: ProductOfIncomingInvoice[] =
            await findProductOfIncomingInvoiceByDate(
                productId,
                firstDayOfPreviousMonthTime,
                lastDayOfPreviousMonthTime
            );
        const productsOfPreviousMonthAmount: number = productsOfPreviousMonth.reduce(
            (acc: number, currentValue: ProductOfIncomingInvoice) => acc + currentValue.quantity,
            0
        );

        const productsOfCurrentMonth: ProductOfIncomingInvoice[] =
            await findProductOfIncomingInvoiceByDate(productId, firstDayOfMonth, today);
        const productsOfCurrentMonthAmount: number = productsOfCurrentMonth.reduce(
            (acc: number, currentValue: ProductOfIncomingInvoice) => acc + currentValue.quantity,
            0
        );

        const currentPrice: number =
            Number(currentProductCost.at(-1)?.cost) ||
            productsOfCurrentMonth.at(-1)?.price ||
            productsOfPreviousMonth.at(-1)?.price ||
            0;

        const currentStockBalance: number =
            productsOfCurrentMonthAmount + productsOfPreviousMonthAmount;

        const inventoryTotalCostOfPreviousMonth: number =
            currentPrice * productsOfPreviousMonthAmount;

        const inventoryTotalCostOfCurrentMonth: number =
            currentPrice * productsOfCurrentMonthAmount;

        const newCurrentProductCost: number = Math.floor(
            (inventoryTotalCostOfPreviousMonth + inventoryTotalCostOfCurrentMonth) /
                currentStockBalance
        );

        if (currentProductCost.length) {
            await ProductsCost.update(
                {
                    date: moment(today).format("YYYY-MM-DD"),
                    cost: newCurrentProductCost | Number(productsOfCurrentMonth.at(-1)?.price)
                },
                { where: { product_id: productId } }
            );
        } else {
            await ProductsCost.create({
                product_id: productId,
                date: moment(today).format("YYYY-MM-DD"),
                cost: newCurrentProductCost | Number(productsOfCurrentMonth.at(-1)?.price)
            });
        }
    }
};

const getCostByProduct = async (
    product_id: string,
    from: string,
    to: string
): Promise<ProductsCost[]> => {
    return ProductsCost.findAll({
        where: {
            product_id,
            date: { [Op.between]: [from ? from : "", to ? to : new Date(Date.now())] }
        }
    });
};

export { createProduct, findProductByName, calculateProductCost, getCostByProduct };
