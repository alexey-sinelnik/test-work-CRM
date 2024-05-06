import express, { Express } from "express";
import cors from "cors";
import { corsOptions } from "./common/data/cors";
import connectToDb from "./connection";
import productRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import reportRouter from "./routes/reports";
import dotenv from "dotenv";

const app: Express = express();
app.use(express.json());
dotenv.config();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
connectToDb().then(() => console.log("Db connect"));

app.use("/api/products", productRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/report", reportRouter);

const port: number = Number(process.env.API_PORT) || 5000;

app.listen(port, (): void => {
    console.log(`The application is successfully deployed on port ${port} ${process.env.NODE_ENV}`);
});
