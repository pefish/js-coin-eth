import 'node-assist';
declare global {
    namespace NodeJS {
        interface Global {
            logger: any;
        }
    }
}
