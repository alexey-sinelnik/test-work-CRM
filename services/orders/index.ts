import { ICreateOutgoingInvoice, ICreateIncomingInvoice } from "../../common/types/orders";
import { IncomingInvoice } from "../../models/orders/incoming-orders";
import { calculateProductCost, createProduct, findProductByName } from "../products";
import { ProductOfIncomingInvoice } from "../../models/products/product-of-incoming-invoice";
import { Products } from "../../models/products/products";
import EventEmitter from "node:events";
import { OutgoingInvoice } from "../../models/orders/outgoing-invoice";
import { AppErrors } from "../../common/data/errors";
import { ProductsOfOutgoingInvoice } from "../../models/products/products-of-expense-invoice";

const eventEmitter: EventEmitter = new EventEmitter();

const createIncomingInvoice = async (
    createIncomingInvoiceDto: ICreateIncomingInvoice
): Promise<IncomingInvoice | undefined> => {
    try {
        const productIds: string[] = [];
        const invoice: IncomingInvoice = await IncomingInvoice.create({
            date: createIncomingInvoiceDto.date
        });
        for (const product of createIncomingInvoiceDto.products) {
            let currentProduct: Products | null = await findProductByName(product.name);
            if (!currentProduct) {
                currentProduct = await createProduct(product);
            }
            productIds.push(currentProduct.id);
            await ProductOfIncomingInvoice.create({
                price: product.price,
                quantity: product.quantity,
                document_id: invoice.id,
                product_id: currentProduct.id
            });
        }
        eventEmitter.emit("product cost", productIds);
        return invoice;
    } catch (error: any) {
        console.log(error);
    }
};

const createOutgoingInvoice = async (
    createOutgoingInvoiceDto: ICreateOutgoingInvoice
): Promise<Error | OutgoingInvoice | undefined> => {
    try {
        const productIds: string[] = [];
        const invoice: OutgoingInvoice = await OutgoingInvoice.create({
            date: createOutgoingInvoiceDto.date
        });

        for (const product of createOutgoingInvoiceDto.products) {
            let currentProduct: Products | null = await findProductByName(product.name);
            if (!currentProduct) {
                return new Error(AppErrors.PRODUCT_NOT_FOUND);
            }
            productIds.push(currentProduct.id);

            await ProductsOfOutgoingInvoice.create({
                price: product.price,
                quantity: product.quantity,
                document_id: invoice.id,
                product_id: currentProduct.id,
                product_name: product.name
            });
        }
        eventEmitter.emit("product cost", productIds);
        return invoice;
    } catch (error) {
        console.error(error);
    }
};

eventEmitter.on("product cost", (productIds: string[]): void => {
    calculateProductCost(productIds).then(() => console.log("Calculate is started"));
});

export { createIncomingInvoice, createOutgoingInvoice };
