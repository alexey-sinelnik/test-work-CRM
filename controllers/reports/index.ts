import { Request, Response } from "express";
import { createReport } from "../../services/reports";
import { Report } from "../../common/types/reports";

const createReports = async (req: Request, res: Response): Promise<void> => {
    const report: Report[] = await createReport();
    res.status(201).json(report);
};

export { createReports };
