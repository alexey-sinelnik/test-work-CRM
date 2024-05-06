import { ProductOfIncomingInvoice } from "../../../models/products/product-of-incoming-invoice";

export interface IFindProductOfIncomingInvoiceByDate {
    products: ProductOfIncomingInvoice[];
    quantity: number | undefined;
}

export interface IProduct {
    name: string;
    price: number;
    quantity: number;
    id?: string;
}
