import connectToDb from "./connection";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { Products } from "./models/products/products";
import { ProductsCost } from "./models/products/products-cost";
import { IncomingInvoice } from "./models/orders/incoming-orders";
import { ProductOfIncomingInvoice } from "./models/products/product-of-incoming-invoice";
import { OutgoingInvoice } from "./models/orders/outgoing-invoice";
import { ProductsOfOutgoingInvoice } from "./models/products/products-of-expense-invoice";
import { productsArray } from "./common/data/products";

async function seed(): Promise<void> {
    await connectToDb();
    try {
        const date: string = moment(new Date(Date.now())).format("YYYY-MM-DD");

        const randomNumber = (from: number, to: number): number => {
            return Math.floor(Math.random() * (to - from + 1)) + from;
        };
        const products: Products[] = [];
        const arrivalInvoice: IncomingInvoice = await IncomingInvoice.create({
            date: new Date(Date.now())
        });

        const outgoingInvoice: OutgoingInvoice = await OutgoingInvoice.create({
            date: new Date(Date.now())
        });

        for (const productsArrayElement of productsArray) {
            const product: Products = await Products.create({ name: productsArrayElement.name });
            products.push(product);
        }
        for (const product of products) {
            await ProductOfIncomingInvoice.create({
                price: 300,
                quantity: randomNumber(10, 100),
                document_id: arrivalInvoice.id,
                product_id: product.id
            });

            await ProductsOfOutgoingInvoice.create({
                price: randomNumber(350, 400),
                quantity: randomNumber(10, 100),
                document_id: outgoingInvoice.id,
                product_id: product.id,
                product_name: product.name
            });

            await ProductsCost.create({
                id: uuidv4(),
                product_id: product.id,
                date,
                cost: 300
            });
        }

        console.log("Seed completed successfully");
    } catch (error) {
        console.error("Seed failed:", error);
    }
}

seed().then(() => console.log("Seeding is done"));
