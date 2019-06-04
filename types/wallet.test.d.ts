import '@pefish/js-node-assist';
declare global {
    namespace NodeJS {
        interface Global {
            logger: any;
        }
    }
}
