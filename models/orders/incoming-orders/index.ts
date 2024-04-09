import { Column, DataType, HasMany, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import { ProductOfIncomingInvoice } from "../../products/product-of-incoming-invoice";

@Table
export class IncomingInvoice extends Model {
    @PrimaryKey
    @Index
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    id!: string;

    @Column({ type: DataType.DATE, defaultValue: new Date().getDate() })
    date!: Date;

    @HasMany(() => ProductOfIncomingInvoice)
    products!: ProductOfIncomingInvoice[];
}
