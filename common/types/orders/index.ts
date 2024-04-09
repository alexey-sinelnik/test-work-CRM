export interface ICreateIncomingInvoice {
    date: Date;
    products: IProduct[];
}

export interface ICreateOutgoingInvoice {
    date: Date;
    products: IProduct[];
}

interface IProduct {
    name: string;
    price: number;
    quantity: number;
}
