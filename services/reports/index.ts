import { Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { connection } from "../../connection";
import { findProductCost } from "../products";
import { ProductsOfOutgoingInvoice } from "../../models/products/products-of-expense-invoice";
import { ProductsCost } from "../../models/products/products-cost";

const createReport = async () => {
    const result: any[] = [];
    const productsOfOutgoingInvoice: any = await connection.transaction(
        async (transaction: Transaction) => {
            return ProductsOfOutgoingInvoice.findAll({
                raw: true,
                attributes: [
                    [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
                    [Sequelize.literal("SUM(quantity * price)"), "sum"],
                    [Sequelize.literal("SUM(quantity)"), "quantity"],
                    "price",
                    "product_id",
                    "product_name"
                ],
                group: [
                    Sequelize.fn("DATE", Sequelize.col("createdAt")),
                    "price",
                    "quantity",
                    "product_id",
                    "product_name"
                ],
                transaction
            });
        }
    );

    for (const product of productsOfOutgoingInvoice) {
        const productCost: ProductsCost | null = await findProductCost(product.product_id);
        const sumString: string = Number(product.sum).toFixed(2);
        const costString: string = (Number(product.quantity) * Number(productCost?.cost)).toFixed(
            2
        );
        const profitString: string = (
            product.quantity * product.price -
            product.quantity * Number(productCost?.cost)
        ).toFixed(2);

        result.push({
            date: product.date,
            sum: Number(sumString),
            name: product.product_name,
            cost: Number(costString),
            profit: Number(profitString),
            profitability: Math.round(
                ((product.quantity * product.price - product.quantity * Number(productCost?.cost)) /
                    (product.quantity * Number(productCost?.cost))) *
                    100
            )
        });
    }

    const sums = result.reduce((acc, item) => {
        for (let key in item) {
            if (key !== "date" && key !== "name") {
                if (acc[key]) {
                    acc[key] += item[key];
                } else {
                    acc[key] = item[key];
                }
            }
        }
        return acc;
    }, {});

    result.push({
        date: null,
        ...sums
    });

    return result;
};

export { createReport };
