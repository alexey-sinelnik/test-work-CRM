import { HttpStatusCode } from "../../common/enums";

class BaseError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;
    public readonly description: string;

    constructor(
        name: string,
        httpCode: HttpStatusCode,
        isOperational: boolean,
        description: string
    ) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        this.description = description;

        Error.captureStackTrace(this);
    }
}

export class APIError extends BaseError {
    constructor(
        name: string,
        httpCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER,
        isOperational: boolean = true,
        description: string = "internal server error"
    ) {
        super(name, httpCode, isOperational, description);
    }
}
