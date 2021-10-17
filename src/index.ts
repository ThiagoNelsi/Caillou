import ping from 'ping';

const TARGETS = ['google.com', 'github.com'];
const offline: string[] = [];

main();

async function main() {

    while (true) {
        // Ping all targets
        TARGETS.forEach(async target => {
            ping.sys.probe(target, (isAlive) => {
                if (!isAlive) {
                    if (offline.includes(target)) return;
                    handleError(target);
                } else if (offline.includes(target)) {
                    offline.splice(offline.indexOf(target), 1);
                }
            }, { timeout: 5 });
        });
        await sleep(5);
    }

}

function handleError(target: string) {
    offline.push(target);
    sendAlertEmail(target);
}

function sendAlertEmail(target: string) {
    console.log(`sending email => ${target} is down!`);
}

function sleep(seconds: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
    });
}