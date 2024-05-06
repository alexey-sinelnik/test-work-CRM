import { Sequelize } from "sequelize-typescript";
import { Products } from "../models/products/products";
import { IncomingInvoice } from "../models/orders/incoming-orders";
import { ProductOfIncomingInvoice } from "../models/products/product-of-incoming-invoice";
import { OutgoingInvoice } from "../models/orders/outgoing-invoice";
import { ProductsOfOutgoingInvoice } from "../models/products/products-of-expense-invoice";
import { ProductsCost } from "../models/products/products-cost";

export const connection: Sequelize = new Sequelize({
    dialect: "postgres",
    database: "test_crm",
    username: "user",
    password: "password",
    host: "localhost",
    port: 5435,
    logging: true,
    models: [
        Products,
        IncomingInvoice,
        ProductOfIncomingInvoice,
        OutgoingInvoice,
        ProductsOfOutgoingInvoice,
        ProductsCost
    ]
});

async function connectToDb(): Promise<void> {
    try {
        await connection.sync().then(() => console.log("Sync success"));
    } catch (error: any) {
        console.log(error);
    }
}

export default connectToDb;
