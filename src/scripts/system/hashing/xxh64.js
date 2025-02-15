import { bigInt } from "../numbers";

const xxh64 = (bytes, seed) => {
    const PRIME64_1 = 11400714785074694791n;
    const PRIME64_2 = 14029467366897019727n;
    const PRIME64_3 = 1609587929392839161n;
    const PRIME64_4 = 9650029242287828579n;
    const PRIME64_5 = 2870177450012600261n;
    
    const BITS = 64n;
    const BITMASK = 2n ** BITS - 1n;
    
    const encoder = new TextEncoder();
    
    
    function bitsTobigInt (a00, a16, a32, a48) {
        return (
            (bigInt(a00)) |
            (bigInt(a16) << 16n) |
            (bigInt(a32) << 32n) |
            (bigInt(a48) << 48n)
        );
    }
    
    function memoryTobigInt(memory, offset) {
        return (
            (bigInt(memory[offset])) |
            (bigInt(memory[offset+1]) << 8n) |
            (bigInt(memory[offset+2]) << 16n) |
            (bigInt(memory[offset+3]) << 24n) |
            (bigInt(memory[offset+4]) << 32n) |
            (bigInt(memory[offset+5]) << 40n) |
            (bigInt(memory[offset+6]) << 48n) |
            (bigInt(memory[offset+7]) << 56n)
        );
    }
    
    function rotl (value, rotation) {
        return (
            ((value << rotation) & BITMASK) |
            (value >> (BITS - rotation))
        );
    }
    
    function trunc (value) {
        return bigInt.asUintN(64, value);
    }
    
    
    class XXH64 {
        #seed;
        #v1;
        #v2;
        #v3;
        #v4;
    
        #memory;
    
        #len;
        #memsize;
    
        constructor (seed = 0) {
            this.reset(seed);
        }
    
        reset (seed = this.#seed) {
            this.#seed = bigInt.asUintN(32, bigInt(seed));
            this.#v1 = trunc(this.#seed + PRIME64_1 + PRIME64_2);
            this.#v2 = trunc(this.#seed + PRIME64_2);
            this.#v3 = this.#seed;
            this.#v4 = trunc(this.#seed - PRIME64_1);
    
            this.#memory = null;
    
            this.#len = 0;
            this.#memsize = 0;
    
            return this;
        }
    
        update (input) {
            if (typeof input === 'string') {
                input = encoder.encode(input);
            }
    
            let p = 0;
            let len = input.length;
            let bEnd = p + len;
    
            if (len === 0) {
                return this;
            }
    
            this.#len += len;
    
            if (this.#memsize === 0) {
                this.#memory = new Uint8Array(32);
            }
    
            if (this.#memsize + len < 32) {
                this.#memory.set(input.subarray(0, len), this.#memsize);
    
                this.#memsize += len;
                return this;
            }
    
            if (this.#memsize > 0) {
                this.#memory.set(input.subarray(0, 32 - this.#memsize), this.#memsize);
    
                let p64 = 0;
                let other;
    
                other = memoryTobigInt(this.#memory, p64);
                this.#v1 = trunc(rotl(trunc(this.#v1 + other * PRIME64_2), 31n) * PRIME64_1);
    
                p64 += 8
                other = memoryTobigInt(this.memory, p64)
                this.#v2 = trunc(rotl(trunc(this.#v2 + other * PRIME64_2), 31n) * PRIME64_1);
    
                p64 += 8
                other = memoryTobigInt(this.memory, p64)
                this.#v3 = trunc(rotl(trunc(this.#v3 + other * PRIME64_2), 31n) * PRIME64_1);
    
                p64 += 8
                other = memoryTobigInt(this.memory, p64)
                this.#v4 = trunc(rotl(trunc(this.#v4 + other * PRIME64_2), 31n) * PRIME64_1);
    
                p += 32 - this.#memsize;
                this.#memsize = 0;
            }
    
            if (p <= bEnd - 32) {
                const limit = bEnd - 32;
    
                do {
                    let other;
    
                    other = memoryTobigInt(input, p)
                    this.#v1 = trunc(rotl(trunc(this.#v1 + other * PRIME64_2), 31n) * PRIME64_1);
                    p += 8
    
                    other = memoryTobigInt(input, p)
                    this.#v2 = trunc(rotl(trunc(this.#v2 + other * PRIME64_2), 31n) * PRIME64_1);
                    p += 8
    
                    other = memoryTobigInt(input, p)
                    this.#v3 = trunc(rotl(trunc(this.#v3 + other * PRIME64_2), 31n) * PRIME64_1);
                    p += 8
    
                    other = memoryTobigInt(input, p)
                    this.#v4 = trunc(rotl(trunc(this.#v4 + other * PRIME64_2), 31n) * PRIME64_1);
                    p += 8
                } while (p <= limit)
            }
    
            if (p < bEnd) {
                this.#memory.set(input.subarray(p, bEnd), this.#memsize);
                this.#memsize = bEnd - p;
            }
    
            return this;
        }
    
        digest () {
            let input = this.#memory;
    
            let bEnd = this.#memsize;
            let p = 0;
            let h64 = 0n;
            let h = 0n;
            let u = 0n;
    
            if (this.#len >= 32) {
                h64 = rotl(this.#v1, 1n) + rotl(this.#v2, 7n) + rotl(this.#v3, 12n) + rotl(this.#v4, 18n);
    
                h64 = trunc(h64 ^ (rotl(trunc(this.#v1 * PRIME64_2), 31n) * PRIME64_1));
                h64 = trunc(h64 * PRIME64_1 + PRIME64_4);
    
                h64 = trunc(h64 ^ (rotl(trunc(this.#v2 * PRIME64_2), 31n) * PRIME64_1));
                h64 = trunc(h64 * PRIME64_1 + PRIME64_4);
    
                h64 = trunc(h64 ^ (rotl(trunc(this.#v3 * PRIME64_2), 31n) * PRIME64_1));
                h64 = trunc(h64 * PRIME64_1 + PRIME64_4);
    
                h64 = trunc(h64 ^ (rotl(trunc(this.#v4 * PRIME64_2), 31n) * PRIME64_1));
                h64 = trunc(h64 * PRIME64_1 + PRIME64_4);
            }
            else {
                h64 = trunc(this.#seed + PRIME64_5);
            }
    
            h64 += bigInt(this.#len);
    
            while (p <= bEnd - 8) {
                u = memoryTobigInt(input, p);
                u = trunc(rotl(trunc(u * PRIME64_2), 31n) * PRIME64_1);
    
                h64 = trunc((rotl(h64 ^ u, 27n) * PRIME64_1) + PRIME64_4);
                p += 8;
            }
    
            if (p + 4 <= bEnd) {
                u = bitsTobigInt((input[p+1] << 8) | input[p], (input[p+3] << 8) | input[p+2], 0, 0);
                h64 = trunc((rotl(h64 ^ trunc((u * PRIME64_1)), 23n) * PRIME64_2) + PRIME64_3);
                p += 4;
            }
    
            while (p < bEnd) {
                u = bitsTobigInt(input[p++], 0, 0, 0);
                h64 = trunc(rotl(h64 ^ trunc(u * PRIME64_5), 11n) * PRIME64_1);
            }
    
            h = trunc(h64 >> 33n);
            h64 = trunc((h64 ^ h) * PRIME64_2);
    
            h = trunc(h64 >> 29n);
            h64 = trunc((h64 ^ h) * PRIME64_3);
    
            h = trunc(h64 >> 32n);
            h64 = trunc(h64 ^ h);
    
            return h64;
        }
    }

    function hash (input, seed = 0) {
        return new XXH64(seed).update(input).digest();
    }

    return hash(bytes, seed);
}

export default xxh64;

// Thanks to intrnl: https://codeberg.org/intrnl/js-xxhash64/src/branch/trunk/src/index.js