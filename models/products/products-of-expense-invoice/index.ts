import {
    Column,
    DataType,
    ForeignKey,
    Index,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import { Products } from "../products";
import { OutgoingInvoice } from "../../orders/outgoing-invoice";

@Table
export class ProductsOfOutgoingInvoice extends Model {
    @PrimaryKey
    @Index
    @Column({ type: DataType.UUID, allowNull: false, defaultValue: DataType.UUIDV4 })
    id!: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    price!: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    quantity!: number;

    @Column({ type: DataType.STRING, allowNull: false })
    product_name!: number;

    @ForeignKey(() => OutgoingInvoice)
    document_id!: string;

    @ForeignKey(() => Products)
    product_id!: string;
}
