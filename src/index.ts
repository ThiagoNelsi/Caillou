import ping from 'ping';
import { config as configEnv } from 'dotenv';
import { Mailer } from './Mailer';

configEnv();

const targets: {
    domain: string,
    alertEmail: string,
}[] = [];

const offline: string[] = [];

targets.push({
    domain: 'github.com',
    alertEmail: 'some_random@email.com',
});

main();

async function main() {

    const mailer = await Mailer.createMailer({
        host: process.env.SMTP_HOST as string,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_AUTH_USER as string,
            password: process.env.SMTP_AUTH_PASSWORD as string,
        }
    });

    while (true) {
        // Ping all targets
        targets.forEach(async ({ domain, alertEmail }) => {
            ping.sys.probe(domain, (isAlive) => {
                if (!isAlive) {
                    if (offline.includes(domain)) return;
                    handleError(domain, alertEmail);
                } else if (offline.includes(domain)) {
                    offline.splice(offline.indexOf(domain), 1);
                }
            }, { timeout: 5 });
        });
        await sleep(5);
    }

    function handleError(domain: string, alertEmail: string) {
        offline.push(domain);
        sendAlertEmail(domain, alertEmail);
    }
    
    function sendAlertEmail(domain: string, targetEmail: string) {
        const html = `
            <h2 color="red">Calliou Alert!</h2>
            <hr>
            <h3>We have just detected (at ${new Date().toLocaleString()}) that ${domain} is offline!</h3>
        `;
        mailer.sendMail({
            to: targetEmail,
            subject: domain + ' offline!',
            content: html,
            isHtml: true,
        }).then(console.log).catch(console.log);
    }

}

function sleep(seconds: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
    });
}