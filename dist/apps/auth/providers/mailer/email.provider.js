"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailProvider = void 0;
const nodemailer = require("nodemailer");
const result_1 = require("../../../../core/application/result");
class emailProvider {
    async sendMail(data) {
        const transport = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });
        const info = {
            from: 'Hey <abc@gmail.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        };
        await transport.sendMail(info, (err, info) => {
            if (err) {
                return err;
            }
            else {
                return info;
            }
        });
        return result_1.Result.ok({
            message: 'Email sent successfully',
        });
    }
}
exports.emailProvider = emailProvider;
//# sourceMappingURL=email.provider.js.map