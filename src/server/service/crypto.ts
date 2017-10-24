class Encryption {
    crypt: any
    algorithm: string

    constructor() {
        this.crypt = require('crypto')
        this.algorithm = 'aes-256-ctr'
    }

    static defaultPassword () {
        return "SJi28SIkspanv2NssaA"
    }

    encrypt(text, password = Encryption.defaultPassword()) {
        let cipher = this.crypt.createCipher(this.algorithm, password)
        let crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    decrypt(text, password = Encryption.defaultPassword()) {
        let decipher = this.crypt.createDecipher(this.algorithm, password)
        let dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}


export {Encryption}