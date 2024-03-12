import { AbstractOutput } from "./AbstractOutput.mjs";
import { AbstractInputEntry } from "../input/entry/AbstractInputEntry.mjs";
import { basename, dirname } from "path";
import JSZip from "jszip";

/**
 * @typedef OutputByType
 * 
 * @property {string} base64
 * @property {string} string
 * @property {string} text
 * @property {string} binarystring
 * @property {number[]} array
 * @property {Uint8Array} uint8array
 * @property {ArrayBuffer} arraybuffer
 * @property {Blob} blob
 * @property {Buffer} nodebuffer
 */

/**
 * Class BufferOutput
 */
class BufferOutput extends AbstractOutput {
    /**
     * @inheritDoc
     */
    constructor() {
        super();

        /**
         * @type {JSZip}
         *
         * @protected
         */
        this.zip = new JSZip();
    }

    /**
     * @param {AbstractInputEntry} entry
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async applyInputEntry(entry) {
        await entry.applyToZip(this.zip);
    }

    /**
     * @returns {Promise<*>}
     *
     * @throws {Error}
     */
    async generate() {
        this.log.log(`Generate ${Buffer.name} zip`);

        return this.generateZip("nodebuffer");
    }

    /**
     * @template {keyof OutputByType} T
     *
     * @param {T} type
     * 
     * @returns {Promise<OutputByType[T]>}
     *
     * @protected
     */
    async generateZip(type) {
        return this.zip.generateAsync({ type })
    }

    /**
     * @param {string} path
     *
     * @returns {Promise<boolean>}
     *
     * @throws {Error}
     */
    async exists(path) {
        return (path in this.zip.files);
    }

    /**
     * @param {string} from
     * @param {string} to
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async rename(from, to) {
        //this.zip.rename(from, to);
        // https://github.com/Stuk/jszip/pull/622
        for (const [key, entry] of Object.entries(this.zip.files)) {
            if (from.endsWith("/") ? entry.name.startsWith(from) : entry.name === from) {
                delete this.zip.files[key];

                entry.name = (to + entry.name.substr(from.length));

                this.zip.files[entry.name] = entry;
            }
        }
    }

    /**
     * @param {string} file
     *
     * @returns {Promise<Buffer>}
     *
     * @throws {Error}
     */
    async read(file) {
        return this.zip.file(file).async("nodebuffer");
    }

    /**
     * @param {string} file
     * @param {Buffer} data
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async write(file, data) {
        this.zip.file(file, data);
    }

    /**
     * @param {string} path
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async delete(path) {
        this.zip.remove(path);
    }

    /**
     * @param {string} from
     * @param {string} to
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async copy(from, to) {
        // https://github.com/Stuk/jszip/pull/622
        for (const entry of Object.values(this.zip.files)) {
            if (from.endsWith("/") ? entry.name.startsWith(from) : entry.name === from) {
                // https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance#answer-41474987
                const clonedEntry = Object.assign({}, entry);
                Object.setPrototypeOf(clonedEntry, entry.__proto__);

                clonedEntry.name = (to + clonedEntry.name.substr(from.length));

                this.zip.files[clonedEntry.name] = clonedEntry;
            }
        }
    }

    /**
     * @param {string} name
     *
     * @returns {Promise<string|null>}
     *
     * @throws {Error}
     */
    async lookupFile(name) {
        const entry = Object.values(this.zip.files).find(entry => {
            return (!entry.dir && basename(entry.name) === name);
        });

        if (entry) {
            return dirname(entry.name);
        } else {
            return null;
        }
    }
}

export { BufferOutput };
