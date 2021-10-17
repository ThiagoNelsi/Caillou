import nodemailer, { Transporter } from 'nodemailer';

interface ICreateMailer {
    host: string;
    port: number;
    auth: IAuth,
}

interface IAuth {
    user: string;
    password: string;
}

interface ISendMail {
    to: string;
    subject: string;
    content: string;
    isHtml?: boolean;
}

export class Mailer {

    private mailer: Transporter;

    private constructor(host: string, port: number, auth: IAuth) {
        this.mailer = nodemailer.createTransport({
            host,
            port,
            auth: {
                type: 'login',
                user: auth.user,
                pass: auth.password,
            }
        });
    }

    sendMail({ to, subject, content, isHtml = false }: ISendMail) {

        interface IConfig {
            to: string;
            subject: string;
            html?: string;
            text?: string;
        }

        const config: IConfig = {
            to,
            subject,
        }

        if (isHtml) config.html = content;
        else config.text = content;

        return this.mailer.sendMail(config);
        
    }

    private verify() {
        return new Promise((resolve, reject) => {
            this.mailer.verify((err, success) => {
                if (success) return resolve(true);
                return reject(err);
            });
        })
    }

    static async createMailer({ host, port, auth }: ICreateMailer) {
        const mailer = new Mailer(host, port, auth);
        if (await mailer.verify()) return mailer;
    }

}