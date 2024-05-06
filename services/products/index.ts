import { Op, Transaction } from "sequelize";
import moment from "moment";
import { findOutgoingInvoiceByDate } from "../orders";
import { connection } from "../../connection";
import { Products } from "../../models/products/products";
import { ProductOfIncomingInvoice } from "../../models/products/product-of-incoming-invoice";
import { ProductsCost } from "../../models/products/products-cost";
import { ProductsOfOutgoingInvoice } from "../../models/products/products-of-expense-invoice";
import { AppErrors } from "../../common/data/errors";
import { IFindProductOfIncomingInvoiceByDate, IProduct } from "../../common/types/products";
import { ICreateProductDto } from "../../common/dto/products";
import { APIError } from "../../helpers/errorHandling";
import { HttpErrors } from "../../common/enums/errors";
import { HttpStatusCode } from "../../common/enums";

const createProduct = async (createProductDto: ICreateProductDto): Promise<Products> => {
    try {
        return connection.transaction(async (transaction: Transaction): Promise<Products> => {
            return Products.create(
                { name: createProductDto.name, quantity: createProductDto.quantity },
                { transaction }
            );
        });
    } catch (error) {
        throw new Error(error as string);
    }
};
const findProductByName = async (productName: string): Promise<Products | null> => {
    try {
        return connection.transaction(
            async (transaction: Transaction): Promise<Products | null> => {
                return Products.findOne({ where: { name: productName }, transaction });
            }
        );
    } catch (error) {
        throw new Error(error as string);
    }
};

const findProductById = async (id: string): Promise<Products | null> => {
    try {
        return connection.transaction(
            async (transaction: Transaction): Promise<Products | null> => {
                return Products.findOne({ where: { id }, transaction });
            }
        );
    } catch (error) {
        throw new Error(error as string);
    }
};

const addProductToStock = async (product: IProduct, quantity: number) => {
    try {
        const currentProduct = await findProductByName(product.name);
        const productQuantity: number = currentProduct?.quantity || 0;
        if (currentProduct) {
            return connection.transaction(async (transaction: Transaction) => {
                return Products.update(
                    {
                        name: product.name,
                        quantity: productQuantity + quantity
                    },
                    {
                        where: {
                            id: currentProduct.id
                        },
                        transaction
                    }
                );
            });
        }

        return new APIError(
            HttpErrors.BAD_REQUEST,
            HttpStatusCode.BAD_REQUEST,
            true,
            AppErrors.FAILED_TO_UPDATE_PRODUCT
        );
    } catch (error) {
        console.log(error);
    }
};

const removeProductFromStock = async (product: IProduct, quantity: number) => {
    try {
        const currentProduct: Products | null = await findProductByName(product.name);
        const productQuantity: number = currentProduct?.quantity || 0;
        if (currentProduct) {
            return connection.transaction(async (transaction: Transaction) => {
                return Products.update(
                    {
                        name: product.name,
                        quantity: productQuantity - quantity
                    },
                    {
                        where: {
                            id: currentProduct.id
                        },
                        transaction
                    }
                );
            });
        }

        return new APIError(
            HttpErrors.BAD_REQUEST,
            HttpStatusCode.BAD_REQUEST,
            true,
            AppErrors.FAILED_TO_UPDATE_PRODUCT
        );
    } catch (error) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error as string
        );
    }
};

const findProductOfIncomingInvoiceByDate = async (
    productId: string,
    from: number | Date,
    to: number | Date
): Promise<IFindProductOfIncomingInvoiceByDate> => {
    try {
        const products: ProductOfIncomingInvoice[] = await connection.transaction(
            async (transaction: Transaction): Promise<ProductOfIncomingInvoice[]> => {
                return ProductOfIncomingInvoice.findAll({
                    raw: true,
                    where: {
                        product_id: productId,
                        createdAt: {
                            [Op.between]: [from, to]
                        }
                    },
                    transaction
                });
            }
        );

        const product: Products | null = await findProductById(productId);
        return { products, quantity: product?.quantity };
    } catch (error) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error as string
        );
    }
};

const findProductCostByDate = async (
    productId: string,
    from: number | Date,
    to: number | Date
): Promise<ProductsCost[]> => {
    try {
        return connection.transaction(async (transaction: Transaction): Promise<ProductsCost[]> => {
            return ProductsCost.findAll({
                raw: true,
                where: {
                    product_id: productId,
                    createdAt: {
                        [Op.between]: [from, to]
                    }
                },
                transaction
            });
        });
    } catch (error) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error as string
        );
    }
};

const findProductCost = async (productId: string): Promise<ProductsCost | null> => {
    return ProductsCost.findOne({
        raw: true,
        where: { product_id: productId },
        order: [["createdAt", "DESC"]]
    });
};

const calculateProductCost = async (productIds: string[]): Promise<ProductsCost | undefined> => {
    try {
        for (const productId of productIds) {
            const today: Date = new Date(Date.now());
            const firstDayOfCurrentMonth: Date = new Date(today.getFullYear(), today.getMonth(), 1);
            const firstDayOfPreviousMonth: Date = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
            );

            const firstDayOfPreviousMonthTime: number = firstDayOfPreviousMonth.getTime();
            const firstDayOfCurrentMonthTime: number = firstDayOfCurrentMonth.getTime();

            const productCost: ProductsCost[] = await findProductCostByDate(
                productId,
                firstDayOfPreviousMonthTime,
                firstDayOfCurrentMonthTime
            );

            const currentProductCost: number = productCost.at(-1)?.cost || 0;

            const outgoingInvoices: ProductsOfOutgoingInvoice[] = await findOutgoingInvoiceByDate({
                productId: productId,
                from: firstDayOfCurrentMonth,
                to: today
            });

            const totalInventoryOutgoingProducts: number = outgoingInvoices.reduce(
                (acc: number, item: ProductsOfOutgoingInvoice) => acc + item.price * item.quantity,
                0
            );

            const productsOfPreviousMonth: IFindProductOfIncomingInvoiceByDate =
                await findProductOfIncomingInvoiceByDate(
                    productId,
                    firstDayOfPreviousMonthTime,
                    firstDayOfCurrentMonthTime
                );

            const productsOfPreviousMonthAmount: number = productsOfPreviousMonth.products.reduce(
                (acc: number, item: ProductOfIncomingInvoice) => acc + item.quantity,
                0
            );

            const totalInventory: number = currentProductCost * productsOfPreviousMonthAmount;

            const productsOfCurrentMonth: IFindProductOfIncomingInvoiceByDate =
                await findProductOfIncomingInvoiceByDate(productId, firstDayOfCurrentMonth, today);

            const productCostOfCurrentMonthAmount: number = productsOfCurrentMonth.products.reduce(
                (acc: number, item: ProductOfIncomingInvoice) => acc + item.quantity * item.price,
                0
            );

            if (!productsOfCurrentMonth.quantity) return;

            const currentCostValue: number =
                (totalInventory +
                    (productCostOfCurrentMonthAmount - totalInventoryOutgoingProducts)) /
                productsOfCurrentMonth.quantity;

            return connection.transaction(
                async (transaction: Transaction): Promise<ProductsCost> => {
                    return ProductsCost.create(
                        {
                            product_id: productId,
                            cost: currentCostValue,
                            date: moment(today).format("yyyy-MM-DD")
                        },
                        { transaction }
                    );
                }
            );
        }
    } catch (error) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error as string
        );
    }
};

const getCostByProduct = async (
    product_id: string,
    from: string,
    to: string
): Promise<ProductsCost[]> => {
    try {
        return await connection.transaction(
            async (transaction: Transaction): Promise<ProductsCost[]> => {
                return ProductsCost.findAll({
                    where: {
                        product_id,
                        createdAt: {
                            [Op.between]: [
                                from ? from : new Date(0),
                                to ? to : new Date(Date.now())
                            ]
                        }
                    },
                    raw: true,
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                    transaction
                });
            }
        );
    } catch (error) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error as string
        );
    }
};

export {
    createProduct,
    findProductByName,
    calculateProductCost,
    getCostByProduct,
    addProductToStock,
    removeProductFromStock,
    findProductById,
    findProductCost
};
