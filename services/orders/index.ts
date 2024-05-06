import EventEmitter from "node:events";
import { Op, Transaction } from "sequelize";
import {
    addProductToStock,
    calculateProductCost,
    createProduct,
    findProductByName,
    removeProductFromStock
} from "../products";
import { connection } from "../../connection";
import { APIError } from "../../helpers/errorHandling";
import { ProductOfIncomingInvoice } from "../../models/products/product-of-incoming-invoice";
import { Products } from "../../models/products/products";
import { OutgoingInvoice } from "../../models/orders/outgoing-invoice";
import { ProductsOfOutgoingInvoice } from "../../models/products/products-of-expense-invoice";
import { IncomingInvoice } from "../../models/orders/incoming-orders";
import { HttpErrors } from "../../common/enums/errors";
import { AppErrors } from "../../common/data/errors";
import { HttpStatusCode, Statuses } from "../../common/enums";
import {
    ICreateIncomingInvoiceDto,
    ICreateOutgoingInvoiceDto,
    IFindOutgoingInvoiceDto
} from "../../common/dto/orders";

const eventEmitter: EventEmitter = new EventEmitter();

const createIncomingInvoice = async (
    createIncomingInvoiceDto: ICreateIncomingInvoiceDto
): Promise<IncomingInvoice | APIError> => {
    try {
        let productIds: string[] = [];
        const incomingInvoice: IncomingInvoice = await connection.transaction(
            async (transaction: Transaction) => {
                return IncomingInvoice.create(
                    {
                        date: createIncomingInvoiceDto.date
                    },
                    { transaction }
                );
            }
        );
        for (const product of createIncomingInvoiceDto.products) {
            let currentProduct: Products | null = await findProductByName(product.name);
            if (!currentProduct) {
                currentProduct = await createProduct(product);
            } else {
                await addProductToStock(product, product.quantity);
            }
            productIds.push(currentProduct.id);
            await connection.transaction(
                async (transaction: Transaction): Promise<ProductOfIncomingInvoice> => {
                    return ProductOfIncomingInvoice.create(
                        {
                            price: product.price,
                            quantity: product.quantity,
                            document_id: incomingInvoice.id,
                            product_id: currentProduct.id
                        },
                        { transaction }
                    );
                }
            );
        }
        eventEmitter.emit("product cost", productIds);
        productIds = [];
        return incomingInvoice;
    } catch (error: any) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error.message
        );
    }
};

const createOutgoingInvoice = async (
    createOutgoingInvoiceDto: ICreateOutgoingInvoiceDto
): Promise<Error | OutgoingInvoice | undefined> => {
    try {
        const productIds: string[] = [];
        const outgoingInvoice: OutgoingInvoice = await connection.transaction(
            async (transaction: Transaction) => {
                return OutgoingInvoice.create(
                    {
                        date: createOutgoingInvoiceDto.date,
                        status: Statuses.Pending
                    },
                    { transaction }
                );
            }
        );

        for (const product of createOutgoingInvoiceDto.products) {
            let currentProduct: Products | null = await findProductByName(product.name);
            if (!currentProduct) {
                await connection.transaction(async (transaction: Transaction) => {
                    return OutgoingInvoice.update(
                        {
                            status: Statuses.Rejected,
                            reason: AppErrors.PRODUCT_NOT_FOUND
                        },
                        { where: { id: outgoingInvoice.id }, transaction }
                    );
                });
                return new APIError(
                    HttpErrors.BAD_REQUEST,
                    HttpStatusCode.BAD_REQUEST,
                    true,
                    AppErrors.PRODUCT_NOT_FOUND
                );
            }

            if (currentProduct.quantity < product.quantity) {
                await connection.transaction(async (transaction: Transaction) => {
                    await OutgoingInvoice.update(
                        {
                            status: Statuses.Rejected,
                            reason: AppErrors.INVALID_QUANTITY_OF_PRODUCT
                        },
                        { where: { id: outgoingInvoice.id }, transaction }
                    );
                });
                return new APIError(
                    HttpErrors.BAD_REQUEST,
                    HttpStatusCode.BAD_REQUEST,
                    true,
                    AppErrors.INVALID_QUANTITY_OF_PRODUCT
                );
            }

            await connection.transaction(async (transaction: Transaction) => {
                await OutgoingInvoice.update(
                    {
                        status: Statuses.Approve
                    },
                    { where: { id: outgoingInvoice.id }, transaction }
                );

                await removeProductFromStock(product, product.quantity);

                await ProductsOfOutgoingInvoice.create(
                    {
                        price: product.price,
                        quantity: product.quantity,
                        document_id: outgoingInvoice.id,
                        product_id: currentProduct.id,
                        product_name: product.name
                    },
                    { transaction }
                );
            });

            productIds.push(currentProduct.id);
        }
        eventEmitter.emit("product cost", productIds);
        return outgoingInvoice;
    } catch (error: any) {
        throw new APIError(
            HttpErrors.INTERNAL_SERVER,
            HttpStatusCode.INTERNAL_SERVER,
            true,
            error as string
        );
    }
};

const findOutgoingInvoiceByDate = (dto: IFindOutgoingInvoiceDto) => {
    return connection.transaction(
        async (transaction: Transaction): Promise<ProductsOfOutgoingInvoice[]> => {
            return ProductsOfOutgoingInvoice.findAll({
                where: {
                    product_id: dto.productId,
                    createdAt: {
                        [Op.between]: [dto.from, dto.to]
                    }
                },
                transaction
            });
        }
    );
};

eventEmitter.on("product cost", (productIds: string[]): void => {
    calculateProductCost(productIds).then(() => console.log("Calculate is started"));
});

export { createIncomingInvoice, createOutgoingInvoice, findOutgoingInvoiceByDate };
